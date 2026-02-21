/**
 * Tray icon generators — Opção 1: O "Teki" Moderno (Geométrico e Robusto).
 *
 * Two-path design: squircle body with integrated ears + circular face.
 * Eye features are created via SVG mask cutouts on the face path so the
 * negative-space eyes are visible even on macOS template images.
 *
 * idle    → pure silhouette, no eyes
 * watching → face with small circular eye cutouts (open eyes)
 * alert   → face with larger circular eye cutouts (wide-open eyes)
 */

// ─── Shared SVG parts ─────────────────────────────────────────────────────────

// Squircle body + integrated ears
const CAT_BODY_PATH =
  'M416,128c0-13.3-8.1-25.2-20.5-30.1l-72.3-28.9c-20.3-8.1-43.3-8.1-63.6,0' +
  'l-72.3,28.9C174.9,102.8,166.8,114.7,166.8,128v25.2' +
  'c-28.4,17.5-47.8,48.2-50.5,83.9L96,267.1V352c0,35.3,28.7,64,64,64h256' +
  'c35.3,0,64-28.7,64-64v-84.9l-20.3-29.9c-2.7-35.7-22.1-66.4-50.5-83.9V128z' +
  'M192,128l64-25.6l64,25.6V144H192V128z';

// Circular face area (center ≈ 288, 272, r=160)
const CAT_FACE_PATH =
  'M448,272c0-88.4-71.6-160-160-160S128,183.6,128,272c0,35,11.3,67.3,30.4,93.6' +
  'c-9.9,14.9-15.8,32.6-16.3,51.7C141.6,436,156.2,448,174,448h164' +
  'c17.8,0,32.4-12,31.9-30.7c-0.5-19-6.4-36.8-16.3-51.7C436.7,339.3,448,307,448,272z' +
  'M194.7,152.2c-10.6-21-34.1-30.8-55.9-23.4c-10.9,3.7-17,15.3-13.9,26.3' +
  'c5.7,20.5,20.6,46.4,45.6,72.7C176.9,198.7,185.5,174.7,194.7,152.2z' +
  'M387.1,155c-3.1-11-9.2-22.6-20.1-26.3c-21.8-7.4-45.3,2.4-55.9,23.4' +
  'c9.2,22.6,17.8,46.5,24.1,75.6C366.5,199.6,381.4,173.7,387.1,155z';

// Eye positions calibrated for face circle centered at (288, 272)
const LEFT_EYE_CX = 220;
const RIGHT_EYE_CX = 356;
const EYE_CY = 248;

function buildSVG(eyeRadius: number): string {
  const hasCutouts = eyeRadius > 0;
  const defs = hasCutouts
    ? `<defs><mask id="m">` +
      `<rect width="512" height="512" fill="white"/>` +
      `<circle cx="${LEFT_EYE_CX}" cy="${EYE_CY}" r="${eyeRadius}" fill="black"/>` +
      `<circle cx="${RIGHT_EYE_CX}" cy="${EYE_CY}" r="${eyeRadius}" fill="black"/>` +
      `</mask></defs>`
    : '';
  const maskAttr = hasCutouts ? ' mask="url(#m)"' : '';
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="22" height="22">` +
    defs +
    `<path d="${CAT_BODY_PATH}" fill="#FFFFFF"/>` +
    `<path d="${CAT_FACE_PATH}" fill="#FFFFFF"${maskAttr}/>` +
    `</svg>`
  );
}

function toDataURL(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ─── State variants ───────────────────────────────────────────────────────────

/** Silhueta pura — "descansando" (sem olhos) */
export function makeCatIdleDataURL(): string {
  return toDataURL(buildSVG(0));
}

/** Olhos como recortes — "estou observando" */
export function makeCatWatchingDataURL(): string {
  return toDataURL(buildSVG(28));
}

/** Olhos arregalados — "alerta / surpreso" */
export function makeCatAlertDataURL(): string {
  return toDataURL(buildSVG(44));
}
