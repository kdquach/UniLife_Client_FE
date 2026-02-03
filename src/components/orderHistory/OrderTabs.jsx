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
    <div className="flex overflow-x-auto pb-2 mb-4 scrollbar-hide gap-2 sticky top-0 bg-appbg z-10 py-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200
            ${
              active === tab.id
                ? "bg-primary text-inverse shadow-lift"
                : "bg-surface/80 text-muted shadow-card hover:bg-surface hover:shadow-lift"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
