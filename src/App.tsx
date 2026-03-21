import { AuthProvider } from "./features/auth";
import { AppRoutes } from "./app/routes/AppRoutes";

export const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};
