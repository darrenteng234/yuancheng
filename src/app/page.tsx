import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n";

// Root → default customer locale. (Future: negotiate from Accept-Language.)
export default function RootIndex() {
  redirect(`/${DEFAULT_LOCALE}`);
}
