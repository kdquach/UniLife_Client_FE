import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '@/layouts/MainLayout.jsx';
import AuthLayout from '@/layouts/AuthLayout.jsx';
import HomePage from '@/pages/Home/index.jsx';
import MenuPage from '@/pages/Menu/index.jsx';
import ProductDetailPage from '@/pages/Product/index.jsx';
import FavoritePage from '@/pages/Favorite/index.jsx';
import OrderHistoryPage from '@/pages/OrderHistory/OrderHistoryPage.jsx';
import Login from '@/pages/Auth/Login.jsx';
import Register from '@/pages/Auth/Register.jsx';

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/menu', element: <MenuPage /> },
      { path: '/products/:id', element: <ProductDetailPage /> },
      { path: '/favorite', element: <FavoritePage /> },
      { path: '/orders', element: <OrderHistoryPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
    ],
  },
]);
