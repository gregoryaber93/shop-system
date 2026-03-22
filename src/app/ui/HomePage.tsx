import { useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../features/auth";
import { CartModal, useCart } from "@/features/cart";
import { ProductsSection } from "@/features/products";
import { useUser } from "@/features/user";
import { ErrorState } from "@/shared/ui/ErrorState";

export const HomePage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { userId, roles, logout } = useAuth();
  const { cart } = useCart();
  const { profile, isLoading, profileError, refetchProfile } = useUser();

  if (isLoading) {
    return <main className="dashboard-page"><p>Loading profile...</p></main>;
  }

  if (profileError) {
    return (
      <main className="dashboard-page">
        <ErrorState error={profileError} onRetry={() => { void refetchProfile(); }} title="Profile unavailable" />
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-hero">
        <div>
          <h1>Shop Dashboard</h1>
          <p>You are logged in.</p>
        </div>
        <div className="dashboard-actions">
          <Link className="button-link" to="/profile">Go to profile</Link>
          <button type="button" onClick={() => setIsCartOpen(true)}>
            View cart
          </button>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <section className="dashboard-stats" aria-label="User session details">
        <article>
          <h3>User</h3>
          <p>{userId ?? "unknown"}</p>
        </article>
        <article>
          <h3>Email</h3>
          <p>{profile?.email ?? "unknown"}</p>
        </article>
        <article>
          <h3>Roles</h3>
          <p>{roles.length > 0 ? roles.join(", ") : "none"}</p>
        </article>
        <article>
          <h3>Cart items</h3>
          <p>{cart.items.length}</p>
        </article>
      </section>

      <ProductsSection />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
};
