import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import AppRoutes from "./routes";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import { AuthProvider } from "../features/auth/AuthProvider";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
      <Toaster position="bottom-right" richColors />
    </ErrorBoundary>
  );
}
