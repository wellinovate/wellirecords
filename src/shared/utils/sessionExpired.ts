import Cookies from "js-cookie";

// STORAGE_KEY mirrors the constant in shared/api/authApi.ts. Duplicated
// here (rather than imported) to keep this module dependency-free —
// it needs to be safe to import from an axios interceptor with no
// risk of pulling in the rest of authApi.ts's request logic.
const STORAGE_KEY = "welli_auth_user";

const LOGIN_ROUTE = "/auth/pre-login";

let handling = false;

/**
 * Called by both axios instances (shared/lib/api.ts and
 * shared/api/apiClient.ts) when a request comes back 401.
 *
 * The token and its cookie both expire after 1 day, and until now
 * nothing detected that: the UI kept rendering as logged in while
 * every authenticated call silently failed (org name falling back to
 * "Unknown Org", queues and lists showing raw fetch errors). This
 * clears the same session state AuthProvider.signOut() clears, then
 * sends the user back to login instead of leaving them on a page that
 * looks live but can't load anything.
 *
 * Guarded with `handling` because a single expired-session page can
 * fire several 401s in parallel (e.g. org + doctors + queue all
 * requested on mount) — only the first should trigger the redirect.
 */
export function handleSessionExpired() {
  if (handling) return;
  if (window.location.pathname.startsWith(LOGIN_ROUTE)) return;

  handling = true;

  Cookies.remove("accessToken");
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("ui_user");
  localStorage.removeItem("welli_onboarded");
  localStorage.removeItem("wallet_onboarded");

  window.location.href = LOGIN_ROUTE;
}
