import { z } from "zod";

import { createApiClient } from "@/shared/lib/http/apiClient";
import { ApiError } from "@/shared/lib/http/errors";
import { type UserProfile } from "../model/user.types";

const userProfileSchema = z.object({
  id: z.string().min(1),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const parseUserProfile = (value: unknown): UserProfile => {
  const parsed = userProfileSchema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError({
      message: "Invalid profile response",
      status: 500,
      detail: "Backend returned invalid user profile data.",
    });
  }

  return parsed.data;
};

export const createUserApiClient = (
  getToken: () => string | null,
  onUnauthorized: () => void,
) => {
  const client = createApiClient(getToken, onUnauthorized);

  return {
    async getProfile(): Promise<UserProfile> {
      const response = await client.get("/api/users/profile");
      return parseUserProfile(response.data);
    },
  };
};
