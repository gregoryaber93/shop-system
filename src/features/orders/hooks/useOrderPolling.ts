import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/features/auth";
import { dispatchUnauthorizedEvent } from "@/shared/lib/auth/authStorage";
import { createOrderApiClient } from "../api/orderClient";
import { type OrderStatus } from "../model/order.types";

const terminalStatuses: OrderStatus[] = ["Fulfilled", "PaymentFailed"];

export const useOrderPolling = (orderId: string | null, interval = 2000) => {
  const { token, isLoggedIn } = useAuth();

  const apiClient = useMemo(
    () => createOrderApiClient(() => token, dispatchUnauthorizedEvent),
    [token],
  );

  return useQuery({
    queryKey: ["orders", "detail", orderId, token],
    queryFn: () => (orderId ? apiClient.getById(orderId) : Promise.reject(new Error("Missing order id"))),
    enabled: Boolean(orderId) && isLoggedIn,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (!status) {
        return interval;
      }

      return terminalStatuses.includes(status) ? false : interval;
    },
  });
};
