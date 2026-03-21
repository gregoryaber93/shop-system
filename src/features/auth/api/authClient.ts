import { z } from "zod";

import { createApiClient } from "../../../shared/lib/http/apiClient";
import { ApiError } from "../../../shared/lib/http/errors";
import { AuthResponse } from "../model/auth.types";

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerRequestSchema = loginRequestSchema.extend({
  role: z.string().optional(),
});

const authResponseSchema = z.object({
  token: z.string().min(1),
});

type LoginRequest = z.infer<typeof loginRequestSchema>;
type RegisterRequest = z.infer<typeof registerRequestSchema>;

const readonlyClient = createApiClient(() => null);

const parseAuthResponse = (value: unknown): AuthResponse => {
  const parsed = authResponseSchema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError({
      message: "Invalid auth response",
      status: 500,
      detail: "Backend returned invalid authentication payload.",
    });
  }

  return parsed.data;
};

export const authApiClient = {
  async login(input: LoginRequest): Promise<AuthResponse> {
    const request = loginRequestSchema.parse(input);

    const response = await readonlyClient.post("/api/authentication/login", request);
    return parseAuthResponse(response.data);
  },

  async register(input: RegisterRequest): Promise<AuthResponse> {
    const request = registerRequestSchema.parse(input);

    const response = await readonlyClient.post("/api/authentication/register", {
      ...request,
      role: request.role ?? "User",
    });

    return parseAuthResponse(response.data);
  },
};
