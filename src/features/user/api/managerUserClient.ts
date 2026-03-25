import { z } from "zod";

import { createApiClient } from "@/shared/lib/http/apiClient";
import { ApiError } from "@/shared/lib/http/errors";
import type { CreateManagerInput, ManagerStatus, ManagerUser, UpdateManagerInput } from "../model/managerUser.types";

const managerStatusSchema = z.enum(["Active", "Suspended"]);

const managerTransportSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  status: managerStatusSchema.optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
  role: z.string().optional(),
});

const managerCollectionSchema = z.union([
  z.array(managerTransportSchema),
  z.object({
    items: z.array(managerTransportSchema),
  }),
  z.object({
    data: z.array(managerTransportSchema),
  }),
  z.object({
    users: z.array(managerTransportSchema),
  }),
]);

const createManagerSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
  roles: z.array(z.string().min(1)).min(1),
});

const updateManagerSchema = z.object({
  id: z.string().min(1),
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  status: managerStatusSchema,
});

const splitFullName = (fullName: string): { firstName: string; lastName?: string } => {
  const normalized = fullName.trim().replace(/\s+/g, " ");
  const [firstName, ...rest] = normalized.split(" ");
  const lastName = rest.join(" ").trim();

  return {
    firstName,
    lastName: lastName.length > 0 ? lastName : undefined,
  };
};

const normalizeStatus = (status: ManagerStatus | undefined, isActive: boolean | undefined): ManagerStatus => {
  if (status) {
    return status;
  }

  if (typeof isActive === "boolean") {
    return isActive ? "Active" : "Suspended";
  }

  return "Active";
};

const isManager = (roles: string[] | undefined, role: string | undefined): boolean => {
  if (role && role.toLowerCase() === "manager") {
    return true;
  }

  return (roles ?? []).some((currentRole) => currentRole.toLowerCase() === "manager");
};

const toManagerUser = (value: z.infer<typeof managerTransportSchema>): ManagerUser => {
  const firstName = value.firstName?.trim() ?? "";
  const lastName = value.lastName?.trim() ?? "";
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id: value.id,
    email: value.email,
    fullName: fullName.length > 0 ? fullName : value.email.split("@")[0],
    status: normalizeStatus(value.status, value.isActive),
  };
};

const parseManagerCollection = (input: unknown): ManagerUser[] => {
  const parsed = managerCollectionSchema.safeParse(input);

  if (!parsed.success) {
    throw new ApiError({
      message: "Invalid managers response",
      status: 500,
      detail: "Backend returned invalid manager data.",
    });
  }

  const payload = parsed.data;
  const rawUsers = Array.isArray(payload)
    ? payload
    : "items" in payload
      ? payload.items
      : "data" in payload
        ? payload.data
        : payload.users;

  return rawUsers.filter((user) => isManager(user.roles, user.role)).map(toManagerUser);
};

export const createManagerUserApiClient = (
  getToken: () => string | null,
  onUnauthorized: () => void,
) => {
  const client = createApiClient(getToken, onUnauthorized);

  return {
    async getManagers(): Promise<ManagerUser[]> {
      const response = await client.get("/api/users", {
        params: { role: "Manager" },
      });

      return parseManagerCollection(response.data);
    },

    async createManager(input: CreateManagerInput): Promise<void> {
      const request = createManagerSchema.parse(input);
      const createPayload = {
        email: request.email,
        password: request.password,
        roles: request.roles,
      };

      try {
        await client.post("/api/users", createPayload);
      } catch (error) {
        const apiError = error as ApiError;

        if (apiError.status === 404 || apiError.status === 405) {
          await client.post("/api/users/create", createPayload);
          return;
        }

        throw error;
      }
    },

    async updateManager(input: UpdateManagerInput): Promise<void> {
      const request = updateManagerSchema.parse(input);
      const nameParts = splitFullName(request.fullName);

      await client.put(`/api/users/${request.id}`, {
        email: request.email,
        role: "Manager",
        firstName: nameParts.firstName,
        lastName: nameParts.lastName,
        isActive: request.status === "Active",
      });
    },

    async deleteManager(id: string): Promise<void> {
      if (!id) {
        throw new ApiError({
          message: "Invalid manager id",
          status: 400,
          detail: "Manager id is required.",
        });
      }

      await client.delete(`/api/users/${id}`);
    },
  };
};