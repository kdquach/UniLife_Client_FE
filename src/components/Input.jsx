export default function Input({ label, className, error, ...props }) {
  return (
    <label className="grid gap-1">
      {label && <span className="text-sm text-gray-600">{label}</span>}
      <input
        className={
          "rounded-input bg-surfaceMuted px-3 py-2 text-text outline-none shadow-card transition duration-200 placeholder:text-muted focus:shadow-[0_0_0_4px_rgba(255,85,50,0.18)] " +
          (className || "") +
          (error ? " border border-red-500" : "")
        }
        {...props}
      />
      {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
    </label>
  );
}
