import { AuthProvider } from "./src/shared/auth/AuthProvider";
import { AppRoutes } from "./src/AppRoutes";
import { WelliMateProvider } from "./src/shared/context/WelliMateContext";

// Note: BrowserRouter and Web3Provider are provided by index.tsx
export default function App() {
  return (
    <div className="overflow-x-hidden">
      <AuthProvider>
        <WelliMateProvider>
          <AppRoutes />
        </WelliMateProvider>
      </AuthProvider>
    </div>
  );
}
