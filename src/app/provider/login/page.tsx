import { Suspense } from "react";
import ProviderLoginClient from "./LoginClient";

export default function ProviderLoginPage() {
  return (
    <Suspense fallback={<div className="auth-wrap" />}>
      <ProviderLoginClient />
    </Suspense>
  );
}
