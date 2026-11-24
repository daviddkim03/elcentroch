// Event times are entered and shown in the church's time zone, whatever zone the device is in.
const zone = "America/Los_Angeles";

/** "2026-12-25T09:00" for a datetime-local input. */
export function isoToChurchTime(iso: string): string {
  return new Date(iso).toLocaleString("sv-SE", { timeZone: zone }).slice(0, 16).replace(" ", "T");
}

export function churchTimeToIso(local: string): string {
  const wanted = Date.parse(local + "Z");
  let at = wanted;
  // Two passes settle the offset, including next to a daylight saving change.
  for (let i = 0; i < 2; i++) at += wanted - Date.parse(isoToChurchTime(new Date(at).toISOString()) + "Z");
  return new Date(at).toISOString();
}
