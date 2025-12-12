export function normalizeTime(rawTime) {
    if (!rawTime) return null;

    let t = rawTime.trim().toUpperCase();

    let hasAM = t.includes("am");
    let hasPM = t.includes("pm");

    t = t.replace("am", "").replace("pm", "").trim();

    let [hours, minutes] = t.split(":");

    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (isNaN(minutes)) minutes = 0;

    if (!hasAM && !hasPM) {
        hasAM = true;
    }

    const hh = hours.toString().padStart(2, "0");
    const mm = minutes.toString().padStart(2, "0");

    const suffix = hasAM ? "am" : "pm";

    return `${hh}:${mm} ${suffix}`;
}
