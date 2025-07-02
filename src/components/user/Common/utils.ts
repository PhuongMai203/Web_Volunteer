export const formatDate = (date: { seconds: number; nanoseconds: number } | string | null | undefined): string => {
  if (!date) return "Không xác định";

  if (typeof date === "string") {
    const d = new Date(date);
    return d.toLocaleDateString("vi-VN");
  }

  if (typeof date === "object" && "seconds" in date) {
    const d = new Date(date.seconds * 1000);
    return d.toLocaleDateString("vi-VN");
  }

  return "Không xác định";
};
