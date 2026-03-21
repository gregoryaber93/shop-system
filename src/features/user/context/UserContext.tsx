import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { createUserApiClient } from "../api/userClient";
import { type UserContextType } from "../model/user.types";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { token, isLoggedIn } = useAuth();

  const apiClient = useMemo(
    () => createUserApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const profileQuery = useQuery({
    queryKey: ["user", "profile", token],
    queryFn: () => apiClient.getProfile(),
    enabled: isLoggedIn,
    retry: false,
  });

  const value = useMemo<UserContextType>(() => ({
    profile: profileQuery.data ?? null,
    orderHistory: [],
    isLoading: profileQuery.isLoading,
    errorMessage: profileQuery.error instanceof Error ? profileQuery.error.message : null,
    refetchProfile: async () => {
      await profileQuery.refetch();
    },
  }), [profileQuery]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
};
