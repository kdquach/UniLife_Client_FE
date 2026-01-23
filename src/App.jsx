import { RouterProvider } from "react-router-dom";
import { ConfigProvider } from "antd";
import { router } from "./routes/index.jsx";
import { AuthProvider } from "./store/auth.store.js";
import { CartProvider } from "./store/cart.store.js";
import { RightPanelProvider } from "./store/rightPanel.store.js";

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff5532",
          colorInfo: "#1976d2",
          colorSuccess: "#2e7d32",
          colorWarning: "#ffb80e",
          colorError: "#872822",

          colorBgBase: "#fdfdfd",
          colorBgLayout: "#f5f6f8",
          colorBgContainer: "#ffffff",
          colorBgElevated: "#ffffff",

          colorText: "#0f232e",
          colorTextSecondary: "#5f6b73",

          colorBorder: "#d9d9d9",
          colorSplit: "#ececec",

          borderRadius: 14,
          fontFamily:
            '"Inter", system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
        },
        components: {
          Tooltip: {
            colorBgSpotlight: "#0f232e",
            colorTextLightSolid: "#ffffff",
          },
        },
      }}
    >
      <AuthProvider>
        <CartProvider>
          <RightPanelProvider>
            <RouterProvider router={router} />
          </RightPanelProvider>
        </CartProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}
