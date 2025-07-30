import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import EmailVerify from "./pages/EmailVerify";
import ResetPassword from "./pages/ResetPassword";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/email-verify", element: <EmailVerify /> },
  { path: "/reset-password", element: <ResetPassword /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
