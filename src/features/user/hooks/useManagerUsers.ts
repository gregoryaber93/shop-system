import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";
import type { CreateManagerInput, UpdateManagerInput } from "../model/managerUser.types";
import { createManagerUserApiClient } from "../api/managerUserClient";

const MANAGER_USERS_QUERY_KEY = ["admin", "manager-users"] as const;

export const useManagerUsers = () => {
  const queryClient = useQueryClient();
  const { token, isLoggedIn } = useAuth();

  const apiClient = useMemo(
    () => createManagerUserApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  const managerUsersQuery = useQuery({
    queryKey: [...MANAGER_USERS_QUERY_KEY, token],
    queryFn: () => apiClient.getManagers(),
    enabled: isLoggedIn,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateManagerInput) => apiClient.createManager(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MANAGER_USERS_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: UpdateManagerInput) => apiClient.updateManager(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MANAGER_USERS_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteManager(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MANAGER_USERS_QUERY_KEY });
    },
  });

  return {
    managers: managerUsersQuery.data ?? [],
    isLoading: managerUsersQuery.isLoading,
    error: managerUsersQuery.error instanceof Error ? managerUsersQuery.error : null,
    refetch: async () => {
      await managerUsersQuery.refetch();
    },
    createManager: async (input: CreateManagerInput) => {
      await createMutation.mutateAsync(input);
    },
    updateManager: async (input: UpdateManagerInput) => {
      await updateMutation.mutateAsync(input);
    },
    deleteManager: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};