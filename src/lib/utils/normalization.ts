/**
 * Normalizes company names to prevent duplicate DB records.
 * e.g., "Google LLC", "google", "GOOGLE" -> "Google"
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return "";
  let n = name.trim();
  
  // Remove common suffixes case-insensitively with word boundaries
  n = n.replace(/\b(llc|inc|corp|co|ltd|limited|corporation|gmbh|sa|pvt|private)\b\.?/gi, "");
  n = n.replace(/\s+/g, " ").trim();
  
  const upper = n.toUpperCase();
  if (upper === "GOOGLE" || upper === "GOOGLE LLC" || upper === "GOOGLE INC") return "Google";
  if (upper === "AMAZON" || upper === "AMAZON.COM" || upper === "AMAZON INC") return "Amazon";
  if (upper === "MICROSOFT" || upper === "MICROSOFT CORP" || upper === "MICROSOFT CORPORATION") return "Microsoft";
  if (upper === "META" || upper === "META PLATFORMS" || upper === "FACEBOOK") return "Meta";
  if (upper === "UBER" || upper === "UBER TECHNOLOGIES") return "Uber";
  if (upper === "ATLASSIAN") return "Atlassian";
  
  // Convert to Title Case
  return n
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Formats a salary value into standard Indian numbering system (Lakhs / Crores) or simple locale formatting.
 */
export function formatINR(value: number): string {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Formats value as Lakhs (e.g. 15.4 L) without the currency symbol.
 */
export function formatLakhs(value: number): string {
  return `${(value / 100000).toFixed(1)} L`;
}
