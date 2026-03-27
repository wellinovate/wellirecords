import { AuthProvider } from "./src/shared/auth/AuthProvider";
import { AppRoutes } from "./src/AppRoutes";
import { WelliMateProvider } from "./src/shared/context/WelliMateContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Note: BrowserRouter and Web3Provider are provided by index.tsx
export default function App() {
  return (
    <div className="overflow-x-hidden">
      <AuthProvider>
        <WelliMateProvider>
          <AppRoutes />
        </WelliMateProvider>
      </AuthProvider>
        <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}