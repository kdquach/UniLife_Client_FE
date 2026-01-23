import clsx from "clsx";

export default function Button({ children, className, variant = "primary", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition duration-200 ease-out focus:outline-none focus:shadow-[0_0_0_4px_rgba(255,85,50,0.18)]";
  const variants = {
    primary: "bg-primary text-inverse shadow-card hover:bg-primaryHover hover:shadow-lift",
    secondary: "bg-surfaceMuted text-text shadow-card hover:bg-primary hover:text-inverse hover:shadow-lift",
    ghost: "bg-transparent text-text hover:bg-primary hover:text-inverse",
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
