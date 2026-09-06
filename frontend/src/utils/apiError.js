export function apiErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;
  const detail = data?.message || data?.detail || error?.message;
  if (!detail) return fallback;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => {
      if (typeof item === "string") return item;
      const path = Array.isArray(item?.loc) ? item.loc.join(".") : "";
      return [path, item?.msg].filter(Boolean).join(": ");
    }).filter(Boolean).join(" ") || fallback;
  }
  if (typeof detail === "object") return detail.msg || JSON.stringify(detail);
  return String(detail);
}
