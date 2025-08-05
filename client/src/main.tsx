import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import AppContextProvider from "./context/App-Context.tsx";

createRoot(document.getElementById("root")!).render(
  <AppContextProvider>
    <App />
  </AppContextProvider>
);
