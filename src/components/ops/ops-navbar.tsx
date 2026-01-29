"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, Menu, Sparkles } from "lucide-react";

import type { SessionProfile } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { RoleSwitcher } from "@/components/auth/role-switcher";
import { Input } from "@/components/ui/input";

type OpsNavbarProps = {
  profile: SessionProfile;
  unreadAlertsCount: number;
  isAgentOpen: boolean;
  onToggleAgent: () => void;
};

const navItems = [
  { label: "Operations", href: "/operations" },
  { label: "Participants", href: "/participants" },
  { label: "Production", href: "/production" },
  { label: "Reports", href: "/reports" },
];

export const OpsNavbar = ({ profile, unreadAlertsCount, isAgentOpen, onToggleAgent }: OpsNavbarProps) => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [connectingApps, setConnectingApps] = useState(false);

  const displayName = useMemo(
    () => profile.displayName ?? profile.uid.slice(0, 6).toUpperCase(),
    [profile.displayName, profile.uid],
  );

  const handleToggleMenu = () => setMenuOpen((prev) => !prev);
  const handleToggleMobile = () => setMobileOpen((prev) => !prev);
  const handleConnectApps = async () => {
    console.log("[Pipedream Connect Frontend] Starting connect apps flow...");
    setConnectingApps(true);
    const startTime = Date.now();
    
    try {
      console.log("[Pipedream Connect Frontend] Fetching connect link from API...");
      const res = await fetch("/api/pipedream/connect-link", { method: "POST" });
      const fetchTime = Date.now() - startTime;
      console.log("[Pipedream Connect Frontend] API response received:", {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok,
        fetchTime: `${fetchTime}ms`,
        headers: Object.fromEntries(res.headers.entries()),
      });

      const data = await res.json();
      console.log("[Pipedream Connect Frontend] Response data:", {
        ok: data.ok,
        hasUrl: !!data.url,
        urlLength: data.url?.length,
        urlPreview: data.url ? `${data.url.substring(0, 100)}...` : "null",
        expiresAt: data.expiresAt,
        error: data.error,
        debug: data.debug,
      });

      // Log expiration info if available
      if (data.expiresAt) {
        const expiresAt = new Date(data.expiresAt);
        const now = new Date();
        const expiresInMs = expiresAt.getTime() - now.getTime();
        const expiresInSeconds = Math.floor(expiresInMs / 1000);
        const expiresInMinutes = Math.floor(expiresInSeconds / 60);
        console.log("[Pipedream Connect Frontend] Token expiration:", {
          expiresAt: data.expiresAt,
          expiresInSeconds,
          expiresInMinutes,
          isExpired: expiresInMs < 0,
          timeUntilExpiry: expiresInMs < 0 ? "EXPIRED" : `${expiresInSeconds}s (${expiresInMinutes}m)`,
        });
      }

      if (res.ok && data.ok && data.url) {
        const url = data.url as string;
        const currentOrigin = window.location.origin;
        console.log("[Pipedream Connect Frontend] Opening popup with URL:", {
          url,
          currentOrigin,
          tokenParam: new URL(url).searchParams.get("token") ? "present" : "missing",
          connectLinkParam: new URL(url).searchParams.get("connectLink"),
          appParam: new URL(url).searchParams.get("app") || "not set",
        });
        console.log("[Pipedream Connect Frontend] ⚠️ TROUBLESHOOTING: If you see 'session expired':");
        console.log("[Pipedream Connect Frontend] 1. Open browser DevTools (F12) > Network tab");
        console.log("[Pipedream Connect Frontend] 2. Filter for 'tokens' requests");
        console.log("[Pipedream Connect Frontend] 3. Look for requests to api.pipedream.com/v1/connect/tokens");
        console.log("[Pipedream Connect Frontend] 4. Check the response - it will show the actual error");
        console.log("[Pipedream Connect Frontend] 5. Verify your origin matches:", currentOrigin);

        // Try to open popup
        // Open popup and set up message listener to catch validation errors
        const popup = window.open(url, "_blank", "noopener,noreferrer");
        const openTime = Date.now() - startTime;
        
        console.log("[Pipedream Connect Frontend] Popup opened:", {
          popupExists: !!popup,
          popupClosed: popup?.closed,
          popupWindow: popup,
          openTime: `${openTime}ms`,
          url,
          currentOrigin: window.location.origin,
        });
        
        // Instructions for debugging
        console.log("%c[Pipedream Connect Frontend] 🔍 DEBUGGING INSTRUCTIONS:", "color: orange; font-weight: bold; font-size: 14px");
        console.log("[Pipedream Connect Frontend] 1. Open DevTools in the POPUP window (not this window)");
        console.log("[Pipedream Connect Frontend] 2. Go to Network tab");
        console.log("[Pipedream Connect Frontend] 3. Filter for 'tokens'");
        console.log("[Pipedream Connect Frontend] 4. Look for: api.pipedream.com/v1/connect/tokens");
        console.log("[Pipedream Connect Frontend] 5. Click it and check the Response tab for the error");
        console.log("[Pipedream Connect Frontend] Common errors:");
        console.log("[Pipedream Connect Frontend]   - 'Token is invalid' = token was already used");
        console.log("[Pipedream Connect Frontend]   - 'App not found' = app slug doesn't match");
        console.log("[Pipedream Connect Frontend]   - Origin mismatch = allowed_origins doesn't match");
        
        // Listen for messages from the popup (if it sends any)
        const messageListener = (event: MessageEvent) => {
          // Only accept messages from Pipedream domain
          if (event.origin.includes("pipedream.com")) {
            console.log("[Pipedream Connect Frontend] Message from popup:", event.data);
          }
        };
        window.addEventListener("message", messageListener);

        // Check if popup was blocked - use a more reliable check
        const isBlocked = !popup || popup.closed || typeof popup.closed === "undefined" || popup === window;
        
        if (isBlocked) {
          console.error("[Pipedream Connect Frontend] Popup was blocked or failed to open");
          
          // Offer to open in same window as fallback
          const openInSameWindow = window.confirm(
            "Popup was blocked by your browser.\n\n" +
            "Would you like to open the connection page in this window instead?\n\n" +
            "(You can also allow popups for localhost:3000 in your browser settings)"
          );
          
          if (openInSameWindow) {
            window.location.href = url;
          }
        } else {
          console.log("[Pipedream Connect Frontend] Popup opened successfully. Monitoring for closure...");
          
          // Monitor popup to detect if it closes immediately (indicates an error)
          let checkCount = 0;
          let wasOpen = true;
          const checkInterval = setInterval(() => {
            checkCount++;
            const elapsed = checkCount * 200;
            
            // Double-check if popup still exists and is not closed
            if (!popup || popup.closed) {
              if (wasOpen) {
                console.error("[Pipedream Connect Frontend] ⚠️ Popup closed unexpectedly after", elapsed, "ms");
                console.error("[Pipedream Connect Frontend] Possible reasons:");
                console.error("[Pipedream Connect Frontend] - Pipedream detected an error (check the popup window)");
                console.error("[Pipedream Connect Frontend] - Browser blocked the popup");
                console.error("[Pipedream Connect Frontend] - Token may be expired or invalid");
                console.error("[Pipedream Connect Frontend] URL that was opened:", url);
                
                // Try to get more info if possible
                try {
                  const urlObj = new URL(url);
                  console.error("[Pipedream Connect Frontend] URL parameters:", Object.fromEntries(urlObj.searchParams.entries()));
                } catch (e) {
                  // ignore
                }
              }
              wasOpen = false;
              clearInterval(checkInterval);
            } else {
              if (checkCount === 1) {
                console.log("[Pipedream Connect Frontend] ✅ Popup still open after 200ms - good sign");
              }
              if (checkCount >= 25) {
                // Stop checking after 5 seconds
                clearInterval(checkInterval);
                console.log("[Pipedream Connect Frontend] ✅ Popup still open after 5 seconds - connection likely successful");
                window.removeEventListener("message", messageListener);
              }
            }
          }, 200);
          
          // Clean up listener if popup closes
          const cleanupCheck = setInterval(() => {
            if (popup.closed) {
              window.removeEventListener("message", messageListener);
              clearInterval(cleanupCheck);
            }
          }, 1000);
        }
      } else {
        console.error("[Pipedream Connect Frontend] Failed to get connect link:", {
          resOk: res.ok,
          dataOk: data.ok,
          hasUrl: !!data.url,
          error: data.error,
          debug: data.debug,
        });
        
        const errorMessage = data.error || "Failed to connect apps. Please try again.";
        const debugInfo = data.debug ? `\n\nDebug info: ${JSON.stringify(data.debug, null, 2)}` : "";
        
        if (errorMessage.includes("expired") || errorMessage.includes("expire")) {
          console.error("[Pipedream Connect Frontend] Expired link error detected");
          alert(`The connection link has expired. Please try again to generate a new link.${debugInfo}`);
        } else {
          console.error("[Pipedream Connect Frontend] Other error:", errorMessage);
          alert(`${errorMessage}${debugInfo}`);
        }
      }
    } catch (error) {
      const errorTime = Date.now() - startTime;
      console.error("[Pipedream Connect Frontend] Unexpected error:", {
        error,
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        errorTime: `${errorTime}ms`,
      });
      alert(`An error occurred while connecting apps. Please check the console for details. Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setConnectingApps(false);
      const totalTime = Date.now() - startTime;
      console.log("[Pipedream Connect Frontend] Connect apps flow completed. Total time:", `${totalTime}ms`);
    }
  };

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const res = await fetch(`/api/participants?search=${encodeURIComponent(trimmed)}`, {
          signal: controller.signal,
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          const results = (data.participants ?? []).map((participant: any) => ({
            id: participant.id,
            name: participant.name,
          }));
          setSearchResults(results);
          setSearchOpen(true);
        } else {
          setSearchResults([]);
          setSearchOpen(false);
        }
      } catch (error) {
        if ((error as { name?: string }).name !== "AbortError") {
          setSearchResults([]);
          setSearchOpen(false);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-10 w-10 md:hidden"
            aria-label="Toggle navigation"
            onClick={handleToggleMobile}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </Button>
          <Link href="/operations" className="flex items-center gap-3 md:hidden" aria-label="Ransom Operations">
            <div className="relative h-9 w-28">
              <Image src="/RANSOM.png" alt="Ransom" fill className="object-contain" priority unoptimized />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Operations Platform
              </p>
            </div>
          </Link>

          <div className="relative hidden md:block">
            <Input
              className="w-72 bg-white"
              placeholder="Search participants..."
              aria-label="Search participants"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onFocus={() => {
                if (searchResults.length > 0) setSearchOpen(true);
              }}
              onBlur={() => {
                setTimeout(() => setSearchOpen(false), 150);
              }}
            />
            {searchOpen ? (
              <div className="absolute left-0 right-0 mt-2 max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                {searchLoading ? (
                  <p className="px-4 py-3 text-sm text-slate-500">Searching...</p>
                ) : searchResults.length === 0 ? (
                  <p className="px-4 py-3 text-sm text-slate-500">No participants found.</p>
                ) : (
                  searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={`/participants/${result.id}`}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                      aria-label={`Open ${result.name}`}
                      onClick={() => {
                        setSearchQuery("");
                        setSearchOpen(false);
                      }}
                    >
                      {result.name}
                    </Link>
                  ))
                )}
              </div>
            ) : null}
          </div>
        </div>

        <nav className="hidden" aria-label="Primary">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-semibold transition-colors",
                  isActive ? "text-slate-900" : "text-slate-500 hover:text-slate-900",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/alerts"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            aria-label="View alerts"
          >
            <Bell className="h-5 w-5" aria-hidden="true" />
            {unreadAlertsCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {unreadAlertsCount}
              </span>
            ) : null}
          </Link>

          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900"
              aria-label="Open user menu"
              onClick={handleToggleMenu}
            >
              <span className="hidden sm:inline">{displayName}</span>
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            {menuOpen ? (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                <Link
                  href="/settings"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Configs
                </Link>
                {profile.originalRole === "admin" ? (
                  <button
                    type="button"
                    onClick={handleConnectApps}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-100"
                    aria-label="Connect apps"
                    title="Connect Pipedream apps. Links expire quickly, so complete the connection immediately."
                  >
                    {connectingApps ? "Connecting..." : "Connect Apps"}
                  </button>
                ) : null}
                <Link
                  href="/work-logs"
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  Work Logs
                </Link>
                {profile.originalRole === "admin" ? (
                  <div className="px-2 py-2">
                    <RoleSwitcher currentRole={profile.role} isSuperAdmin />
                  </div>
                ) : null}
                <div className="px-2 py-2">
                  <LogoutButton />
                </div>
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleAgent}
            className={cn(
              "h-10 w-10 rounded-full border transition-all shrink-0",
              isAgentOpen 
                ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm" 
                : "border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600"
            )}
            aria-label="Toggle Ops Agent"
            title="Ops Agent"
          >
            <Sparkles className={cn("h-5 w-5", isAgentOpen && "animate-pulse")} />
          </Button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-t border-slate-200 bg-white px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-lg px-3 py-2 text-sm font-semibold",
                    isActive ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      ) : null}
    </header>
  );
};
