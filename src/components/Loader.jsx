import MaterialIcon from "@/components/MaterialIcon.jsx";

export default function Loader({ size = 24 }) {
  return (
    <div className="flex items-center justify-center p-6">
      <MaterialIcon name="autorenew" className="animate-spin text-primary" style={{ fontSize: size }} />
    </div>
  );
}
