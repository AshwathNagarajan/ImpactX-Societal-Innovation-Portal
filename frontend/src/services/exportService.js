import api from "./api.js";

async function download(path, filename) {
  const res = await api.get(path, { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export const exportService = {
  challengesCsv: () => download("/exports/challenges.csv", "impactx-challenges.csv"),
  projectsCsv: () => download("/exports/projects.csv", "impactx-projects.csv"),
  impactPdf: () => download("/exports/impact.pdf", "impactx-impact-summary.pdf")
};
