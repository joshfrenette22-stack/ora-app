// The ORA logomark (cross within a double ring) as an inline SVG data URI,
// shared by the generated app icons. Matches the <Logomark> in Sacred.tsx.

const GOLD = "#D8BC76";

export const ORA_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
<circle cx="60" cy="60" r="53" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
<circle cx="60" cy="60" r="46" fill="none" stroke="${GOLD}" stroke-width="1" opacity="0.45"/>
<path d="M55.4 26 L64.6 26 L64.6 88 L60 104 L55.4 88 Z" fill="${GOLD}"/>
<rect x="38" y="46.5" width="44" height="9.2" rx="1" fill="${GOLD}"/>
<circle cx="60" cy="23.5" r="3.6" fill="${GOLD}"/>
</svg>`;

export const ORA_MARK_DATA_URI = `data:image/svg+xml,${encodeURIComponent(ORA_MARK_SVG)}`;

/** Dark, faintly-glowing background that matches the app's ink surface. */
export const ORA_ICON_BG = "radial-gradient(circle at 50% 40%, #2A2410 0%, #1B1916 72%)";
