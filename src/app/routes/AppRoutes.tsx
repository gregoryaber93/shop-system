import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "../../features/auth";

const LoginPage = lazy(() => import("@/features/auth").then((module) => ({ default: module.LoginPage })));
const RegisterPage = lazy(() => import("@/features/auth").then((module) => ({ default: module.RegisterPage })));
const CheckoutPage = lazy(() => import("@/features/orders").then((module) => ({ default: module.CheckoutPage })));
const OrderDetailPage = lazy(() => import("@/features/orders").then((module) => ({ default: module.OrderDetailPage })));
const ProfilePage = lazy(() => import("@/features/user").then((module) => ({ default: module.ProfilePage })));
const ForbiddenPage = lazy(() => import("../ui/ForbiddenPage").then((module) => ({ default: module.ForbiddenPage })));
const HomePage = lazy(() => import("../ui/HomePage").then((module) => ({ default: module.HomePage })));
const NotFoundPage = lazy(() => import("../ui/NotFoundPage").then((module) => ({ default: module.NotFoundPage })));
const RoleFeaturePage = lazy(() => import("../ui/RoleFeaturePage").then((module) => ({ default: module.RoleFeaturePage })));
const AdminUserManagementPage = lazy(() =>
  import("../ui/AdminUserManagementPage").then((module) => ({ default: module.AdminUserManagementPage })),
);

export const AppRoutes = () => {
  return (
    <Suspense fallback={<main className="status-page"><p>Loading page...</p></main>}>
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
        <Route
          path="/admin/shops"
          element={(
            <ProtectedRoute requiredRoles={["Admin"]}>
              <RoleFeaturePage
                title="Shop Management"
                description="Admin workspace for managing shops."
              />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/admin/users"
          element={(
            <ProtectedRoute requiredRoles={["Admin"]}>
              <AdminUserManagementPage />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/manager/shops"
          element={(
            <ProtectedRoute requiredRoles={["Manager"]}>
              <RoleFeaturePage
                title="Shops"
                description="Manager workspace for handling shops."
              />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/manager/products"
          element={(
            <ProtectedRoute requiredRoles={["Manager"]}>
              <RoleFeaturePage
                title="Products"
                description="Manager workspace for managing products."
              />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/manager/promotions"
          element={(
            <ProtectedRoute requiredRoles={["Manager"]}>
              <RoleFeaturePage
                title="Promotions"
                description="Manager workspace for controlling promotions."
              />
            </ProtectedRoute>
          )}
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
