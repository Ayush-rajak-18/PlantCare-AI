
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./components/App";
import "./index.css";

function ScrollToTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null;
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScrollToTop />
    <App />
  </React.StrictMode>
);
