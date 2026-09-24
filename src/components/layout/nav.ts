/** Role navigation configs. Same components + design system; only items differ. */
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, Store, Package, CreditCard, FileText, TrendingUp, Settings,
  ClipboardList, Navigation, User, Sparkles, Users,
} from "lucide-react";

export interface NavItem { href: string; label: string; icon?: LucideIcon; group?: string; }

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
  { href: "/provider", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { href: "/provider/storefront", label: "Storefront", icon: Store, group: "Sell" },
  { href: "/provider/services", label: "Services", icon: Sparkles, group: "Sell" },
  { href: "/provider/products", label: "Products", icon: Package, group: "Sell" },
  { href: "/provider/orders", label: "Orders", icon: ClipboardList, group: "Operate" },
  { href: "/provider/customers", label: "Customers", icon: Users, group: "Operate" },
  { href: "/provider/subscription", label: "Subscription", icon: CreditCard, group: "Account" },
  { href: "/provider/account", label: "Account", icon: Settings, group: "Account" },
];

export const RUNNER_NAV: NavItem[] = [
  { href: "/runner/assignments", label: "Assignments", icon: Navigation },
  { href: "/runner/profile", label: "Profile", icon: User },
];
