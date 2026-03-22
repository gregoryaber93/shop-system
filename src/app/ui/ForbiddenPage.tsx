import { Link } from "react-router-dom";

export const ForbiddenPage = () => {
  return (
    <main className="status-page">
      <h1>Access denied</h1>
      <p>You do not have enough permissions to open this page.</p>
      <Link className="button-link" to="/">Go to home</Link>
    </main>
  );
};
