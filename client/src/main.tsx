import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import AuthProvider from "./context/authProvider.ts";
import CartProvider from "./context/cartProvider.tsx";
import ToastProvider from "./context/toastProvider.tsx";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);
