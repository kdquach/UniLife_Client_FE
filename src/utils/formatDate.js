import dayjs from "dayjs";

export function formatDate(date, format = "YYYY-MM-DD") {
  if (!date) return "";
  return dayjs(date).format(format);
}
