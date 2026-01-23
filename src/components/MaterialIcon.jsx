import clsx from "clsx";

export default function MaterialIcon({
  name,
  className,
  filled = false,
  label,
  ...props
}) {
  return (
    <span
      className={clsx("material-symbols-rounded", filled && "fill", className)}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...props}
    >
      {name}
    </span>
  );
}
