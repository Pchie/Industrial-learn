"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode
} from "react";
import { usePathname } from "next/navigation";
import type { AppRole } from "./session-core";
import type { WorkspaceDestination } from "./workspace-access";

export type AccountAccessSummary = {
  authenticated: boolean;
  identityScope: string;
  displayName: string;
  primaryRole: string;
  roles: AppRole[];
  workspaces: WorkspaceDestination[];
};
type State = {
  status: "checking" | "ready" | "unavailable";
  account: AccountAccessSummary | null;
  path: string;
};
const Context = createContext<State & { refresh: () => void }>({
  status: "checking",
  account: null,
  path: "",
  refresh() {}
});
const channelName = "industrial-learn-account-change";

export function AccountProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<State>({
    status: "checking",
    account: null,
    path: pathname
  });
  const generation = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const channel = useRef<BroadcastChannel | null>(null);
  const previousPath = useRef(pathname);
  const invalidate = useCallback(() => {
    generation.current++;
    controller.current?.abort();
    // Hide synchronously before a restored page or another tab can paint.
    document.documentElement.dataset.accountState = "checking";
    setState({ status: "checking", account: null, path: pathname });
  }, [pathname]);
  const refresh = useCallback(async () => {
    invalidate();
    if (document.visibilityState === "hidden") return;
    const current = generation.current;
    const requestController = new AbortController();
    controller.current = requestController;
    const timeout = setTimeout(() => requestController.abort(), 10000);
    try {
      const response = await fetch("/api/account/access", {
        cache: "no-store",
        credentials: "same-origin",
        signal: requestController.signal
      });
      if (!response.ok && response.status !== 401)
        throw new Error("Account check unavailable");
      const account = (await response.json()) as AccountAccessSummary;
      if (!account.identityScope) throw new Error("Missing identity scope");
      if (current !== generation.current) return;
      setState({ status: "ready", account, path: pathname });
      document.documentElement.dataset.accountState = "ready";
    } catch {
      if (current !== generation.current) return;
      setState({ status: "unavailable", account: null, path: pathname });
      document.documentElement.dataset.accountState = "unavailable";
    } finally {
      clearTimeout(timeout);
    }
  }, [invalidate, pathname]);
  useEffect(() => {
    if (typeof BroadcastChannel !== "undefined") {
      channel.current = new BroadcastChannel(channelName);
      channel.current.onmessage = () => {
        void refresh();
      };
    }
    const check = () => {
      void refresh();
    };
    const visibility = () => {
      if (document.visibilityState === "hidden") invalidate();
      else check();
    };
    window.addEventListener("focus", check);
    window.addEventListener("pageshow", check);
    window.addEventListener("pagehide", invalidate);
    window.addEventListener("offline", invalidate);
    window.addEventListener("online", check);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      invalidate();
      channel.current?.close();
      window.removeEventListener("focus", check);
      window.removeEventListener("pageshow", check);
      window.removeEventListener("pagehide", invalidate);
      window.removeEventListener("offline", invalidate);
      window.removeEventListener("online", check);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [invalidate, refresh]);
  useEffect(() => {
    if (pathname.startsWith("/auth/") || previousPath.current.startsWith("/auth/"))
      channel.current?.postMessage("invalidate");
    previousPath.current = pathname;
    void refresh();
  }, [pathname, refresh]);
  return (
    <Context.Provider
      value={{
        ...state,
        // A new route must not reuse the previous route's verified account while
        // effects are still pending (child effects can run before this provider).
        status: state.path === pathname ? state.status : "checking",
        account: state.path === pathname ? state.account : null,
        refresh: () => {
          void refresh();
        }
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useAccount() {
  return useContext(Context);
}

/** The server binds each navigation payload to the identity which loaded it. */
export function AccountBoundary({
  scope,
  children
}: {
  scope: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const { status, account, refresh } = useAccount();
  const reloading = useRef(false);
  const matches = status === "ready" && account?.identityScope === scope;
  useEffect(() => {
    if (status === "ready" && account?.authenticated && !matches && !reloading.current) {
      reloading.current = true;
      // A new document discards the entire RSC/router cache, old component state
      // and in-flight actions; neither late payloads nor history can restore A.
      window.location.reload();
    }
  }, [status, matches, account?.authenticated]);
  return (
    <>
      {!matches && (
        <div className="account-transition" role="status" aria-live="polite">
          {status === "unavailable"
            ? "We could not verify your account. Private content is hidden."
            : status === "ready" && !account?.authenticated
              ? "Your session has ended. Sign in to continue."
              : "Checking your account…"}
          {status === "ready" && !account?.authenticated && (
            <a href={`/auth/sign-in?next=${encodeURIComponent(pathname)}`}>Sign in</a>
          )}
          {status === "unavailable" && (
            <button type="button" onClick={refresh}>
              Retry account check
            </button>
          )}
        </div>
      )}
      {(status === "checking" || matches) && (
        <div data-account-boundary hidden={!matches}>
          {children}
        </div>
      )}
    </>
  );
}
