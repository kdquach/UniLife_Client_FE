import MaterialIcon from "@/components/MaterialIcon.jsx";

export default function EmptyState({ title = "No data", description = "Try adjusting filters or adding items." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-600">
      <MaterialIcon name="inbox" className="mb-3 text-[40px]" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm">{description}</p>
    </div>
  );
}
