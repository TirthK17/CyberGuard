import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="ambient-orb ambient-orb-1" aria-hidden="true" />
    <div className="ambient-orb ambient-orb-2" aria-hidden="true" />
    <App />
  </StrictMode>
);
