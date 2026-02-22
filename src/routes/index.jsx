import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout.jsx";
import AuthLayout from "@/layouts/AuthLayout.jsx";
import HomePage from "@/pages/Home/index.jsx";
import MenuPage from "@/pages/Menu/index.jsx";
import ProductDetailPage from "@/pages/Product/index.jsx";
import FavoritePage from "@/pages/Favorite/index.jsx";
import OrderHistoryPage from "@/pages/OrderHistory/OrderHistoryPage.jsx";
import NotificationDetail from "@/pages/Notification/NotificationDetail.jsx";
import ProfilePage from "@/pages/Profile/index.jsx";
import Login from "@/pages/Auth/Login.jsx";
import Register from "@/pages/Auth/Register.jsx";
import VerifyOTP from "@/pages/Auth/VerifyOTP.jsx";
import ForgotPassword from "@/pages/Auth/ForgotPassword.jsx";
import VerifyForgotPasswordOTP from "@/pages/Auth/VerifyForgotPasswordOTP.jsx";
import ResetPassword from "@/pages/Auth/ResetPassword.jsx";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/menu", element: <MenuPage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/favorite", element: <FavoritePage /> },
      { path: "/orders", element: <OrderHistoryPage /> },
      { path: "/notifications/:id", element: <NotificationDetail /> },
      { path: "/profile", element: <ProfilePage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <Login /> },
      { path: "/register", element: <Register /> },
      { path: "/verify-otp", element: <VerifyOTP /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/forgot-password/verify", element: <VerifyForgotPasswordOTP /> },
      { path: "/reset-password", element: <ResetPassword /> },
    ],
  },
]);
