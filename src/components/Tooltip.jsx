import { Tooltip as AntTooltip } from "antd";

export default function Tooltip({ title, children, placement = "top", ...props }) {
  if (!title) return children;

  return (
    <AntTooltip
      title={title}
      placement={placement}
      mouseEnterDelay={0.06}
      styles={{
        body: {
          background: "var(--text)",
          color: "var(--text-inverse)",
          borderRadius: 12,
          boxShadow: "var(--shadow-card)",
        },
      }}
      {...props}
    >
      {children}
    </AntTooltip>
  );
}
