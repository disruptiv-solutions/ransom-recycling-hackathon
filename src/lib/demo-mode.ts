"use client";

import { useEffect, useState } from "react";

const DEMO_MODE_KEY = "demo-mode";
const DEMO_MODE_EVENT = "demo-mode-change";

const readDemoMode = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEMO_MODE_KEY) === "true";
};

export const setDemoMode = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DEMO_MODE_KEY, enabled ? "true" : "false");
  document.cookie = `${DEMO_MODE_KEY}=${enabled ? "true" : "false"}; path=/; max-age=2592000; samesite=lax`;
  window.dispatchEvent(new Event(DEMO_MODE_EVENT));
};

export const useDemoMode = () => {
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(readDemoMode());

    const handleChange = () => setIsDemoMode(readDemoMode());
    window.addEventListener(DEMO_MODE_EVENT, handleChange);
    window.addEventListener("storage", handleChange);
    return () => {
      window.removeEventListener(DEMO_MODE_EVENT, handleChange);
      window.removeEventListener("storage", handleChange);
    };
  }, []);

  return { isDemoMode, setDemoMode };
};
