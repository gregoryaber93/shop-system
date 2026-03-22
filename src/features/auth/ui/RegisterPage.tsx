import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ErrorState } from "@/shared/ui/ErrorState";
import { useAuth } from "../context/AuthContext";

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading, errorMessage, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("User");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await register(email.trim(), password, role);
      navigate("/", { replace: true });
    } catch {
      // Error is set by auth context for user-friendly UI.
    }
  };

  return (
    <main>
      <h1>Register</h1>
      <form onSubmit={onSubmit} aria-label="register form">
        <label htmlFor="register-email">Email</label>
        <input
          id="register-email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            clearError();
            setEmail(event.target.value);
          }}
          required
        />

        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          type="password"
          value={password}
          autoComplete="new-password"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            clearError();
            setPassword(event.target.value);
          }}
          required
          minLength={6}
        />

        <label htmlFor="register-role">Role</label>
        <select
          id="register-role"
          value={role}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => setRole(event.target.value)}
        >
          <option value="User">User</option>
          <option value="Manager">Manager</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {errorMessage ? (
        <ErrorState error={new Error(errorMessage)} title="Registration failed" />
      ) : null}
    </main>
  );
};
