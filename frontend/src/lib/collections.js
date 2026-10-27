import execReq from "./execReq";

export const listRows = response => {
  const body = response?.data ?? response;
  for (const value of [body, body?.data, body?.items, body?.rows, body?.data?.items, body?.data?.rows]) if (Array.isArray(value)) return value.filter(item => item && typeof item === "object");
  return [];
};
export async function fetchCollection(endpoint, params = {}, signal) {
  const rows = [], seen = new Set(); let page = 1, total;
  do {
    const response = await execReq(endpoint, { params: { ...params, page, limit: 100 }, signal });
    const items = listRows(response);
    const body = response.data;
    total = Number(body?.total ?? body?.pagination?.total ?? body?.data?.total ?? items.length);
    const fresh = items.filter(item => { const id = item._id || item.id; if (!id) return true; if (seen.has(String(id))) return false; seen.add(String(id)); return true; });
    rows.push(...fresh);
    if (!fresh.length || !Number.isFinite(total) || rows.length >= total) break;
    page++;
  } while (rows.length < total);
  return rows;
}
