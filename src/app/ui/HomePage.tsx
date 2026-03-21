import { useAuth } from "../../features/auth";

export const HomePage = () => {
  const { userId, roles, logout } = useAuth();

  return (
    <main>
      <h1>Shop Dashboard</h1>
      <p>You are logged in.</p>
      <p>User: {userId ?? "unknown"}</p>
      <p>Roles: {roles.length > 0 ? roles.join(", ") : "none"}</p>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </main>
  );
};
