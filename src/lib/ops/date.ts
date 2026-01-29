export const formatDisplayDate = (value: string | Date | null | undefined) => {
  if (!value) return "—";
  
  let date: Date;
  if (typeof value === "string") {
    date = new Date(value);
  } else if (value instanceof Date) {
    date = value;
  } else if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    // Handle Firestore Timestamp
    date = value.toDate();
  } else if (typeof value === "object" && "seconds" in value) {
    // Handle Firestore Timestamp with seconds
    date = new Date((value as { seconds: number }).seconds * 1000);
  } else {
    return "—";
  }
  
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatShortDate = (value: string | Date) => {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  });
};

export const parseDateInput = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const getDayRange = (value: Date) => {
  const start = new Date(value);
  start.setHours(0, 0, 0, 0);
  const end = new Date(value);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

export const getStartOfWeek = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const getEndOfWeek = (date: Date = new Date()) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + 7; // adjust when day is sunday
  d.setDate(diff);
  d.setHours(23, 59, 59, 999);
  return d;
};
