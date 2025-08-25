import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";
import ErrorBoundary from "./components/ErrorBoundary";

// Notification setup
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/email-verify", element: <EmailVerify /> },
  { path: "/reset-password", element: <ResetPassword /> },
  // Catch-all for 404s
  {
    path: "*",
    errorElement: <ErrorBoundary />,
    loader: () => {
      throw new Response("Not Found", { status: 404 });
    },
  },
]);

export default function App() {
  return (
    <>
      <ToastContainer />
      <RouterProvider router={router} />
    </>
  );
}
