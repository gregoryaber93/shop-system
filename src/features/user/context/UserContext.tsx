import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth";
import { createOrderApiClient } from "@/features/orders";
import { createUserApiClient } from "../api/userClient";
import { type UserContextType } from "../model/user.types";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { token, isLoggedIn } = useAuth();
  const shouldFetchOrderHistory = location.pathname.startsWith("/profile");

  const apiClient = useMemo(
    () => createUserApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const orderApiClient = useMemo(
    () => createOrderApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const profileQuery = useQuery({
    queryKey: ["user", "profile", token],
    queryFn: () => apiClient.getProfile(),
    enabled: isLoggedIn,
    retry: false,
  });

  const orderHistoryQuery = useQuery({
    queryKey: ["user", "orders", token],
    queryFn: async () => {
      const orders = await orderApiClient.getMyOrders();
      return orders.map((order) => ({
        id: order.id,
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        status: order.status,
        itemCount: order.items.length,
      }));
    },
    enabled: isLoggedIn && shouldFetchOrderHistory,
    retry: false,
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: Parameters<typeof apiClient.updateProfile>[0]) => apiClient.updateProfile(data),
    onSuccess: async () => {
      await profileQuery.refetch();
    },
  });

  const value = useMemo<UserContextType>(() => ({
    profile: profileQuery.data ?? null,
    orderHistory: orderHistoryQuery.data ?? [],
    isLoading: profileQuery.isLoading || (shouldFetchOrderHistory && orderHistoryQuery.isLoading),
    isUpdating: updateProfileMutation.isPending,
    errorMessage: profileQuery.error instanceof Error ? profileQuery.error.message : null,
    updateErrorMessage: updateProfileMutation.error instanceof Error ? updateProfileMutation.error.message : null,
    updateSuccessMessage: updateProfileMutation.isSuccess ? "Profile updated successfully." : null,
    refetchProfile: async () => {
      await profileQuery.refetch();
    },
    updateProfile: async (data) => {
      await updateProfileMutation.mutateAsync(data);
    },
  }), [orderHistoryQuery, profileQuery, shouldFetchOrderHistory, updateProfileMutation]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within UserProvider");
  }

  return context;
};
