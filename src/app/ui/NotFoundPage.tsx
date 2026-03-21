import { Link } from "react-router-dom";

export const NotFoundPage = () => {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The page you requested does not exist.</p>
      <Link to="/">Go to home</Link>
    </main>
  );
};
