import { Navigate, Route, Routes } from "react-router-dom";

import { LoginPage, ProtectedRoute, RegisterPage } from "../../features/auth";
import { CheckoutPage, OrderDetailPage } from "@/features/orders";
import { ProfilePage } from "@/features/user";
import { ForbiddenPage } from "../ui/ForbiddenPage";
import { HomePage } from "../ui/HomePage";
import { NotFoundPage } from "../ui/NotFoundPage";

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forbidden" element={<ForbiddenPage />} />
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/checkout"
        element={(
          <ProtectedRoute>
            <CheckoutPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/orders/:orderId"
        element={(
          <ProtectedRoute>
            <OrderDetailPage />
          </ProtectedRoute>
        )}
      />
      <Route
        path="/profile"
        element={(
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        )}
      />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
