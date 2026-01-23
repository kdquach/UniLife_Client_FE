export const ORDER_STATUS = {
  pending: "pending",
  confirmed: "confirmed",
  preparing: "preparing",
  completed: "completed",
  cancelled: "cancelled",
};

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.pending]: "Pending",
  [ORDER_STATUS.confirmed]: "Confirmed",
  [ORDER_STATUS.preparing]: "Preparing",
  [ORDER_STATUS.completed]: "Completed",
  [ORDER_STATUS.cancelled]: "Cancelled",
};

export const ORDER_STATUS_BADGE = {
  [ORDER_STATUS.pending]: {
    className: "bg-surfaceMuted text-muted",
  },
  [ORDER_STATUS.confirmed]: {
    className: "bg-primary/10 text-primary",
  },
  [ORDER_STATUS.preparing]: {
    className: "bg-primary/10 text-primary",
  },
  [ORDER_STATUS.completed]: {
    className: "bg-success/10 text-success",
  },
  [ORDER_STATUS.cancelled]: {
    className: "bg-danger/10 text-danger",
  },
};

export const ORDER_TIMELINE_STEPS = [
  {
    key: "placed",
    title: "Đặt hàng",
    subtitle: "Order placed",
    icon: "shopping_bag",
  },
  {
    key: "confirmed",
    title: "Đã xác nhận",
    subtitle: "Order confirmed",
    icon: "verified",
  },
  {
    key: "preparing",
    title: "Đang chuẩn bị",
    subtitle: "Kitchen preparing",
    icon: "restaurant",
  },
  {
    key: "completed",
    title: "Hoàn thành",
    subtitle: "Delivered",
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
    case ORDER_STATUS.completed:
      return 3;
    case ORDER_STATUS.cancelled:
      // stop the timeline early
      return 1;
    default:
      return 0;
  }
}
