export const ORDER_STATUS = {
  pending: "pending",
  confirmed: "confirmed",
  preparing: "preparing",
  ready: "ready",
  completed: "completed",
  received: "received",
  cancelled: "cancelled",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.pending]: "Chờ xác nhận",
  [ORDER_STATUS.confirmed]: "Đã xác nhận",
  [ORDER_STATUS.preparing]: "Đang chuẩn bị",
  [ORDER_STATUS.ready]: "Sẵn sàng",
  [ORDER_STATUS.completed]: "Hoàn thành",
  [ORDER_STATUS.received]: "Đã nhận",
  [ORDER_STATUS.cancelled]: "Đã hủy",
};

export const ORDER_STATUS_BADGE = {
  [ORDER_STATUS.pending]: {
    className: "bg-surfaceMuted text-muted",
  },
  [ORDER_STATUS.confirmed]: {
    className: "bg-info/10 text-info",
  },
  [ORDER_STATUS.preparing]: {
    className: "bg-primary/10 text-primary",
  },
  [ORDER_STATUS.ready]: {
    className: "bg-info/10 text-info",
  },
  [ORDER_STATUS.completed]: {
    className: "bg-primary/10 text-primary",
  },
  [ORDER_STATUS.received]: {
    className: "bg-success/10 text-success",
  },
  [ORDER_STATUS.cancelled]: {
    className: "bg-danger/10 text-danger",
  },
};

export const ORDER_TIMELINE_STEPS = [
  {
    key: "placed",
    title: "Đã đặt",
    icon: "shopping_bag",
  },
  {
    key: "confirmed",
    title: "Đã xác nhận",
    icon: "verified",
  },
  {
    key: "preparing",
    title: "Đang chuẩn bị",
    icon: "restaurant",
  },
  {
    key: "ready",
    title: "Sẵn sàng",
    icon: "restaurant_menu",
  },
  {
    key: "completed",
    title: "Chờ nhận món",
    icon: "qr_code_2",
  },
  {
    key: "received",
    title: "Đã nhận hàng",
    icon: "task_alt",
  },
];

export function getTimelineIndex(status) {
  switch (status) {
    case ORDER_STATUS.pending:
      return 0;
    case ORDER_STATUS.confirmed:
      return 1;
    case ORDER_STATUS.preparing:
      return 2;
    case ORDER_STATUS.ready:
      return 3;
    case ORDER_STATUS.completed:
      return 4;
    case ORDER_STATUS.received:
      return 5;
    case ORDER_STATUS.cancelled:
      return 1;
    default:
      return 0;
  }
}
