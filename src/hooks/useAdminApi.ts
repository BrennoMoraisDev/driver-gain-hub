import { supabase } from "@/integrations/supabase/client";

const PROJECT_ID = import.meta.env.VITE_SUPABASE_PROJECT_ID;
const BASE = `https://${PROJECT_ID}.supabase.co/functions/v1/admin-api`;

async function adminFetch(action: string, params?: Record<string, string>, options?: { method?: string; body?: unknown }) {
  const session = (await supabase.auth.getSession()).data.session;
  if (!session) throw new Error("Not authenticated");

  const qs = new URLSearchParams({ action, ...params });
  const url = `${BASE}?${qs}`;

  const res = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function useAdminApi() {
  return {
    listUsers: (search = "", page = 1) => adminFetch("list-users", { search, page: String(page) }),
    userDetails: (userId: string) => adminFetch("user-details", { userId }),
    activatePremium: (userId: string, days = 30) => adminFetch("activate-premium", {}, { method: "POST", body: { userId, days } }),
    deactivateUser: (userId: string, reason = "") => adminFetch("deactivate", {}, { method: "POST", body: { userId, reason } }),
    kiwifyEvents: (processed?: string, page = 1) => {
      const params: Record<string, string> = { page: String(page) };
      if (processed !== undefined) params.processed = processed;
      return adminFetch("kiwify-events", params);
    },
    retryEvent: (eventId: string) => adminFetch("retry-event", {}, { method: "POST", body: { eventId } }),
    stats: () => adminFetch("stats"),
  };
}
