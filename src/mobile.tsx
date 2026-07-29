import { Capacitor, SystemBars, SystemBarsStyle } from "@capacitor/core";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { getRouter } from "./router";
import "./styles.css";

document.documentElement.classList.add("anga-mobile-entry");

if (Capacitor.isNativePlatform()) {
  document.documentElement.classList.add("anga-native");
  void SystemBars.show();
  void SystemBars.setStyle({ style: SystemBarsStyle.Default });
}

// The native shell is the app itself, so skip the website landing page while
// preserving the normal `/` experience for web visitors.
if (window.location.pathname === "/" || window.location.pathname.endsWith("/index.html")) {
  window.history.replaceState(null, "", "/app");
}

const router = getRouter();
const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
