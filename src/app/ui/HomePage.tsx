import { useAuth } from "../../features/auth";
import { useUser } from "@/features/user";

export const HomePage = () => {
  const { userId, roles, logout } = useAuth();
  const { profile, isLoading, errorMessage } = useUser();

  if (isLoading) {
    return <main><p>Loading profile...</p></main>;
  }

  if (errorMessage) {
    return <main><p role="alert">{errorMessage}</p></main>;
  }

  return (
    <main>
      <h1>Shop Dashboard</h1>
      <p>You are logged in.</p>
      <p>User: {userId ?? "unknown"}</p>
      <p>Email: {profile?.email ?? "unknown"}</p>
      <p>Roles: {roles.length > 0 ? roles.join(", ") : "none"}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </main>
  );
};
