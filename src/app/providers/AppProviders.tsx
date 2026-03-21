import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { AuthProvider } from "@/features/auth";
import { CartProvider } from "@/features/cart";
import { UserProvider } from "@/features/user";
import { queryClient } from "@/shared/lib/query/queryClient";

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <CartProvider>{children}</CartProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
