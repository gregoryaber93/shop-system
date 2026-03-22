import { z } from "zod";

import { CACHE_KEY, cacheGet, cacheSet } from "@/shared/lib/cache/localCache";
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

const updateProfileRequestSchema = z.object({
  firstName: z.string().trim().min(1).max(50).optional(),
  lastName: z.string().trim().min(1).max(50).optional(),
  phoneNumber: z.string().trim().min(7).max(20).optional(),
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
      const cached = cacheGet<UserProfile>(CACHE_KEY.userProfile, 60 * 60 * 1000);
      if (cached) {
        return cached;
      }

      const response = await client.get("/api/users/profile");
      const profile = parseUserProfile(response.data);
      cacheSet(CACHE_KEY.userProfile, profile);
      return profile;
    },

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
      const request = updateProfileRequestSchema.parse(data);
      const response = await client.put("/api/users/profile", request);
      const profile = parseUserProfile(response.data);
      cacheSet(CACHE_KEY.userProfile, profile);
      return profile;
    },
  };
};
