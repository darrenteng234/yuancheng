/** Role navigation configs. Same components + design system; only items differ. */
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Store, Package, CreditCard, FileText, TrendingUp, Settings,
  ClipboardList, Navigation, User,
} from "lucide-react";

export interface NavItem { href: string; label: string; icon?: LucideIcon; }

export const ADMIN_NAV: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/providers", label: "Providers", icon: Store },
  { href: "/admin/platform-orders", label: "Orders", icon: Package },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: FileText },
  { href: "/admin/economics", label: "Economics", icon: TrendingUp },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export const PROVIDER_NAV: NavItem[] = [
  { href: "/provider", label: "Dashboard", icon: LayoutDashboard },
  { href: "/provider/storefront", label: "Storefront", icon: Store },
  { href: "/provider/products", label: "Products & SKUs", icon: Package },
  { href: "/provider/orders", label: "Orders", icon: ClipboardList },
  { href: "/provider/account", label: "Account", icon: Settings },
];

export const RUNNER_NAV: NavItem[] = [
  { href: "/runner/assignments", label: "Assignments", icon: Navigation },
  { href: "/runner/profile", label: "Profile", icon: User },
];
