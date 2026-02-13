export const resolveNotificationLink = (notification) => {
  if (!notification) return null;

  const type = notification.type;
  const metadata = notification.metadata || {};

  switch (type) {
    case "order":
      return metadata.orderId ? `/orders/${metadata.orderId}` : "/orders";
    case "shift":
      return metadata.shiftId
        ? `/staff/shifts/${metadata.shiftId}`
        : "/staff/shifts";
    case "salary":
      return metadata.salaryId
        ? `/staff/salary/${metadata.salaryId}`
        : "/staff/salary";
    case "promotion":
      return metadata.voucherId ? `/vouchers/${metadata.voucherId}` : "/menu";
    default:
      return null;
  }
};
