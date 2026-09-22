/** Role navigation configs. Same components + design system; only items differ. */
export interface NavItem { href: string; label: string; icon?: string; }

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/providers", label: "Providers", icon: "🏮" },
  { href: "/admin/platform-orders", label: "Orders", icon: "📦" },
  { href: "/admin/payments", label: "Payments", icon: "💳" },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: "📄" },
  { href: "/admin/economics", label: "Economics", icon: "💰" },
  { href: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export const PROVIDER_NAV: NavItem[] = [
  { href: "/provider", label: "Dashboard", icon: "📊" },
  { href: "/provider/storefront", label: "Storefront", icon: "🏪" },
  { href: "/provider/products", label: "Products & SKUs", icon: "🛍️" },
  { href: "/provider/orders", label: "Orders", icon: "📦" },
  { href: "/provider/account", label: "Account", icon: "⚙️" },
];

export const RUNNER_NAV: NavItem[] = [
  { href: "/runner/assignments", label: "Assignments", icon: "🧭" },
  { href: "/runner/profile", label: "Profile", icon: "👤" },
];
