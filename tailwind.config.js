export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fdfdfd",
        appbg: "#f5f6f8",
        surface: "#ffffff",
        surfaceMuted: "#f5f5f5",

        text: "#0f232e",
        muted: "#5f6b73",
        inverse: "#ffffff",

        primary: {
          DEFAULT: "#ff5532",
          hover: "#ff6a4a",
          active: "#e64a2b",
        },
        primaryHover: "#ff6a4a",
        primaryActive: "#e64a2b",

        success: {
          DEFAULT: "#2e7d32",
          light: "#4caf50",
          dark: "#1b5e20",
        },
        warning: {
          DEFAULT: "#ffb80e",
          light: "#ffc107",
          dark: "#f57c00",
        },
        danger: {
          DEFAULT: "#872822",
          light: "#d32f2f",
          dark: "#5d1f1a",
        },
        info: {
          DEFAULT: "#1976d2",
          light: "#2196f3",
          dark: "#0d47a1",
        },

        border: "#d9d9d9",
        borderHover: "#c4c4c4",
        borderStrong: "#c4c4c4",
        divider: "#ececec",
      },
      borderRadius: {
        surface: "20px",
        card: "16px",
        input: "14px",
      },
      boxShadow: {
        surface: "0 8px 30px rgba(0,0,0,0.04)",
        panel: "0 12px 40px rgba(0,0,0,0.06)",
        card: "0 4px 16px rgba(0,0,0,0.03)",
        lift: "0 10px 26px rgba(0,0,0,0.06)",
      },
    },
  },
  plugins: [],
}
