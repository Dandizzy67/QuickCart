import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuthProvider from "./context/authProvider.ts";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
);
