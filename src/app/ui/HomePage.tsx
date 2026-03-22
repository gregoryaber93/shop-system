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
    return <main><p>Loading profile...</p></main>;
  }

  if (profileError) {
    return (
      <main>
        <ErrorState error={profileError} onRetry={() => { void refetchProfile(); }} title="Profile unavailable" />
      </main>
    );
  }

  return (
    <main>
      <h1>Shop Dashboard</h1>
      <p>You are logged in.</p>
      <p>User: {userId ?? "unknown"}</p>
      <p>Email: {profile?.email ?? "unknown"}</p>
      <p>Roles: {roles.length > 0 ? roles.join(", ") : "none"}</p>
      <p>Cart items: {cart.items.length}</p>
      <Link to="/profile">Go to profile</Link>
      <button type="button" onClick={() => setIsCartOpen(true)}>
        View cart
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
      <ProductsSection />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </main>
  );
};
