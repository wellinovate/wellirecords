import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
// import { Web3Provider } from "./src/shared/auth/providers";
import "react-day-picker/style.css";

// Automatically reload the page if a Vite dynamic import chunk fails to load
// (e.g. after a new deployment invalidates old chunk hashes).
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});


const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
   <BrowserRouter> 
        <App />
      </BrowserRouter>
  //  </React.StrictMode>
);

// </Web3Provider>
    // <Web3Provider>
