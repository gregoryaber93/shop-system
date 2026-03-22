import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <main className="status-page">
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link className="button-link" to="/">Go to home</Link>
    </main>
  );
};
