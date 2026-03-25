import { NavLink } from "react-router-dom";

import { useAuth } from "@/features/auth";

interface NavigationItem {
  to: string;
  label: string;
}

const hasRole = (roles: string[], role: string): boolean =>
  roles.some((currentRole) => currentRole.toLowerCase() === role.toLowerCase());

const getNavigationByRoles = (roles: string[]): NavigationItem[] => {
  if (hasRole(roles, "Admin")) {
    return [
      { to: "/", label: "Dashboard" },
      { to: "/admin/shops", label: "Shop Management" },
      { to: "/admin/users", label: "User Management" },
    ];
  }

  if (hasRole(roles, "Manager")) {
    return [
      { to: "/manager/shops", label: "Shops" },
      { to: "/manager/products", label: "Products" },
      { to: "/manager/promotions", label: "Promotions" },
    ];
  }

  return [{ to: "/", label: "Dashboard" }];
};

export const GlobalLogoutButton = () => {
  const { isLoggedIn, logout, roles } = useAuth();

  if (!isLoggedIn) {
    return null;
  }

  const navigationItems = getNavigationByRoles(roles);

  return (
    <header className="role-top-nav" aria-label="Role based navigation">
      <nav className="role-top-nav-links" aria-label="Main menu">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? "top-nav-link is-active" : "top-nav-link")}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className="secondary-action" type="button" onClick={logout}>Logout</button>
    </header>
  );
};