import { cookies } from "next/headers";
import { PROVIDER_LANG_COOKIE, type ProviderLang } from "./provider";
export { PROVIDER_LANG_COOKIE };

/** Server-read provider language so the first render is already correct. */
export async function providerLang(): Promise<ProviderLang> {
  const c = await cookies();
  return c.get(PROVIDER_LANG_COOKIE)?.value === "zh" ? "zh" : "en";
}
