// Mapping of precinct numbers to bundled PDF assets.
// PDFs live in: nassau_candidates_app_mobile/assets/pdfs/
// Note: require() paths must be static literals so Metro can bundle the assets.
export const PRECINCT_PDF_ASSET_MAP: Record<string, number> = {
  // Individual precincts
  '11': require('../../assets/pdfs/District_11.pdf'),
  '12': require('../../assets/pdfs/District_12.pdf'),
  '13': require('../../assets/pdfs/District_13.pdf'),
  '21': require('../../assets/pdfs/District_21.pdf'),
  '32': require('../../assets/pdfs/District_32.pdf'),
  '33': require('../../assets/pdfs/District_33.pdf'),
  '41': require('../../assets/pdfs/District_41.pdf'),
  '42': require('../../assets/pdfs/District_42.pdf'),
  '43': require('../../assets/pdfs/District_43.pdf'),
  '53': require('../../assets/pdfs/District_53.pdf'),
  // Combined precincts (shared locations)
  '14/31': require('../../assets/pdfs/District_14_31.pdf'),
  '22/23': require('../../assets/pdfs/District_22_23.pdf'),
  '34/51': require('../../assets/pdfs/District_34_51.pdf'),
  '44/52': require('../../assets/pdfs/District_44_52.pdf'),
};

export type PrecinctPdfSource = number;

// Helper function to get PDF asset source for a precinct (bundled in the app)
export function getPdfSourceForPrecinct(precinct: string): PrecinctPdfSource | null {
  if (!precinct) return null;

  // Normalize precinct string (remove "Precinct" prefix, trim whitespace)
  const normalizedPrecinct = precinct.replace(/^Precinct\s+/i, '').trim();

  // First, try exact match for combined precincts (e.g., "14/31")
  if (PRECINCT_PDF_ASSET_MAP[normalizedPrecinct]) {
    return PRECINCT_PDF_ASSET_MAP[normalizedPrecinct];
  }

  // Extract all numbers from precinct string (e.g., "14/31" -> ["14", "31"])
  const numbers = normalizedPrecinct.match(/\d+/g) || [];
  if (numbers.length === 0) return null;

  // For combined precincts, try to match the combined format
  if (numbers.length >= 2) {
    const combinedKey = `${numbers[0]}/${numbers[1]}`;
    if (PRECINCT_PDF_ASSET_MAP[combinedKey]) {
      return PRECINCT_PDF_ASSET_MAP[combinedKey];
    }
  }

  // Try individual precinct numbers
  for (const number of numbers) {
    if (PRECINCT_PDF_ASSET_MAP[number]) {
      return PRECINCT_PDF_ASSET_MAP[number];
    }
  }

  return null;
}



