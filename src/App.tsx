import { AppProviders } from "@/app/providers/AppProviders";
import { AppRoutes } from "@/app/routes/AppRoutes";
import { ErrorBoundary } from "@/shared/ui/ErrorBoundary";

export const App = () => {
  return (
    <AppProviders>
      <ErrorBoundary>
        <AppRoutes />
      </ErrorBoundary>
    </AppProviders>
  );
};
