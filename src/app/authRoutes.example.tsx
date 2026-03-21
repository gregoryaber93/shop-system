import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "../features/auth";
import { LoginPage } from "../features/auth";
import { ProtectedRoute } from "../features/auth";
import { RegisterPage } from "../features/auth";

export const AuthRoutesExample = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/"
          element={(
            <ProtectedRoute>
              <h1>Home</h1>
            </ProtectedRoute>
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};
