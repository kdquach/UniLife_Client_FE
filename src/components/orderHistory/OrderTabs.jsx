import React from "react";

export default function OrderTabs({ active, onChange }) {
  // Danh sách trạng thái khớp với Backend
  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "pending", label: "Chờ xác nhận" },
    { id: "confirmed", label: "Đã xác nhận" },
    { id: "preparing", label: "Đang chuẩn bị" },
    { id: "ready", label: "Sẵn sàng" },
    { id: "completed", label: "Hoàn thành" },
    { id: "cancelled", label: "Đã hủy" },
  ];

  return (
    <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide gap-2 sticky top-0 bg-gray-50 z-10 py-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200
            ${
              active === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/30 transform scale-105"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
