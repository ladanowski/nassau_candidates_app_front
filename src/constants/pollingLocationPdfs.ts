// Mapping of precinct numbers to PDF filenames
// PDFs are stored locally in the backend public/pdfs/ directory
// All PDFs are local - no external URLs or fallbacks
export const PRECINCT_PDF_MAP: Record<string, string> = {
    // Individual precincts
    '11': 'District_11.pdf',
    '12': 'District_12.pdf',
    '13': 'District_13.pdf',
    '21': 'District_21.pdf',
    '32': 'District_32.pdf',
    '33': 'District_33.pdf',
    '41': 'District_41.pdf',
    '42': 'District_42.pdf',
    '43': 'District_43.pdf',
    '53': 'District_53.pdf',
    // Combined precincts (shared locations)
    '14/31': 'District_14_31.pdf',
    '22/23': 'District_22_23.pdf',
    '34/51': 'District_34_51.pdf',
    '44/52': 'District_44_52.pdf',
};

import { API_BASE_URL } from '../config/api';

// Base URL for PDFs - only use local backend (no external URLs)
const PDF_BASE_URL_LOCAL = `${API_BASE_URL}/pdfs/`;

// Helper function to get PDF URL for a precinct (only returns local URLs, no fallbacks)
export function getPdfUrlForPrecinct(precinct: string): string | null {
    if (!precinct) return null;
    
    // Normalize precinct string (remove "Precinct" prefix, trim whitespace)
    const normalizedPrecinct = precinct.replace(/^Precinct\s+/i, '').trim();
    
    // First, try exact match for combined precincts (e.g., "14/31")
    if (PRECINCT_PDF_MAP[normalizedPrecinct]) {
        return `${PDF_BASE_URL_LOCAL}${PRECINCT_PDF_MAP[normalizedPrecinct]}`;
    }
    
    // Extract all numbers from precinct string (e.g., "14/31" -> ["14", "31"])
    const numbers = normalizedPrecinct.match(/\d+/g) || [];
    
    if (numbers.length === 0) return null;
    
    // For combined precincts, try to match the combined format
    if (numbers.length >= 2) {
        const combinedKey = `${numbers[0]}/${numbers[1]}`;
        if (PRECINCT_PDF_MAP[combinedKey]) {
            return `${PDF_BASE_URL_LOCAL}${PRECINCT_PDF_MAP[combinedKey]}`;
        }
    }
    
    // Try individual precinct numbers
    for (const number of numbers) {
        if (PRECINCT_PDF_MAP[number]) {
            return `${PDF_BASE_URL_LOCAL}${PRECINCT_PDF_MAP[number]}`;
        }
    }
    
    // No PDF available - return null (no fallback to external URLs)
    return null;
}


