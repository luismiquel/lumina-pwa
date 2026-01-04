window.addEventListener("unhandledrejection", (event) => {
  // Evita pantallas raras por promesas sin catch
  console.error("Unhandled promise rejection:", event.reason);
});
window.addEventListener("error", (event) => {
  console.error("Window error:", event.error || event.message);
});
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { registerSW } from "./swRegister";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

registerSW();



