export function normalizeString(string) {
    const norm = String(string ?? "").trim().toLowerCase().replace(/\s+/g, " ");
    return norm.replaceAll(" ", "")
}
