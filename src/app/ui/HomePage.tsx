import { useState } from "react";

import { useAuth } from "../../features/auth";
import { CartModal, useCart } from "@/features/cart";
import { ProductsSection } from "@/features/products";
import { useUser } from "@/features/user";

export const HomePage = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { userId, roles, logout } = useAuth();
  const { cart } = useCart();
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
      <p>Cart items: {cart.items.length}</p>
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
