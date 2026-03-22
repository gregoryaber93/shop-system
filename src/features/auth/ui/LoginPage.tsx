import { type ChangeEvent, type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ErrorState } from "@/shared/ui/ErrorState";
import { useAuth } from "../context/AuthContext";

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isLoading, errorMessage, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      await login(email.trim(), password);
      navigate("/", { replace: true });
    } catch {
      // Error is set by auth context for user-friendly UI.
    }
  };

  return (
    <main>
      <h1>Login</h1>
      <form onSubmit={onSubmit} aria-label="login form">
        <label htmlFor="login-email">Email</label>
        <input
          id="login-email"
          type="email"
          value={email}
          autoComplete="email"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            clearError();
            setEmail(event.target.value);
          }}
          required
        />

        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          value={password}
          autoComplete="current-password"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            clearError();
            setPassword(event.target.value);
          }}
          required
        />

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {errorMessage ? (
        <ErrorState error={new Error(errorMessage)} title="Login failed" />
      ) : null}
    </main>
  );
};
