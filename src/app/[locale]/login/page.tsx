import { Suspense } from "react";
import LoginClient from "./LoginClient";

export default function LocaleLogin() {
  return (
    <Suspense fallback={<div className="container section" />}>
      <LoginClient />
    </Suspense>
  );
}
