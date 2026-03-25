import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { GlobalLogoutButton } from "@/app/ui/GlobalLogoutButton";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

export const App = () => {
  return (
    <AppProviders>
      <ErrorBoundary>
        <GlobalLogoutButton />
        <AppRoutes />
      </ErrorBoundary>
    </AppProviders>
  );
};
