import { api } from "../../services/api";

// The API on Render's free plan sleeps when idle; the first request can take ~1 minute.
const SLOW_REQUEST_MS = 120000;

const filenameFrom = (headers, fallback) => {
  const m = /filename="?([^"]+)"?/i.exec(headers["content-disposition"] || "");
  return m ? m[1] : fallback;
};

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// FastAPI returns validation errors as JSON, but we asked for a blob — read it back.
const readError = async (err) => {
  const data = err.response?.data;
  if (data instanceof Blob) {
    try {
      const body = JSON.parse(await data.text());
      if (Array.isArray(body.detail)) {
        return body.detail.map((d) => `${d.loc.filter((x) => x !== "body").join(" › ")}: ${d.msg}`).join("\n");
      }
      return body.detail || body.error || "Request failed";
    } catch { /* not JSON */ }
  }
  if (err.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
  if (!err.response) return "Could not reach the server. Check your connection and try again.";
  if (err.response.status === 401) return "Your session has expired. Please sign in again.";
  if (err.response.status === 403) return "This account is not allowed to create quotations.";
  return `Server error (${err.response.status})`;
};

export const quotationService = {
  async downloadDocx(payload) {
    try {
      const res = await api.post("/quotations/docx", payload, { responseType: "blob", timeout: SLOW_REQUEST_MS });
      const filename = filenameFrom(res.headers, "Quotation.docx");
      saveBlob(res.data, filename);
      return filename;
    } catch (err) {
      throw new Error(await readError(err));
    }
  },
};
