import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import "./index.css";
import App from "./App.tsx";

import { StoreProvider } from "./store/StoreContext";
import { AuthProvider } from "./features/auth/context/AuthContext";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <StoreProvider>
          <AuthProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  maxWidth: "420px",
                  border: "1px solid #e5e4e7",
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#08060d",
                  boxShadow: "0 18px 48px rgba(0, 0, 0, 0.16)",
                  fontSize: "15px",
                  fontWeight: 600,
                  padding: "14px 16px",
                },
                success: {
                  iconTheme: {
                    primary: "#ff385c",
                    secondary: "#ffffff",
                  },
                },
                error: {
                  iconTheme: {
                    primary: "#dc2626",
                    secondary: "#ffffff",
                  },
                },
              }}
            />
          </AuthProvider>
        </StoreProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
