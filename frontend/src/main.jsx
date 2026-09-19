
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

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ScrollToTop />
    <App />
  </React.StrictMode>
);
