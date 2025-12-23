import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

export type TableSection = {
    type: 'table';
    heading?: string;
    headers: string[];
    data: Record<string, string>[];
};

export type ListSection = {
    type: 'list';
    heading?: string;
    data: string[];
};

export type TextSection = {
    type: 'text';
    heading?: string;
    data: string[] | { heading: string; paragraphs: string[] }[];
};

export type PollingLocationSection = TableSection | ListSection | TextSection;

export type PollingLocationData = {
    title: string;
    sections: PollingLocationSection[];
    requiresWebView?: boolean;
    originalUrl?: string;
    pdfLinks?: string[];
    imageLinks?: string[];
};

type PollingLocationResponse = {
    success: boolean;
    data?: PollingLocationData;
    error?: string;
    details?: string;
};

export async function getPollingLocations(): Promise<PollingLocationData | null> {
    const res = await ApiClient.get<PollingLocationResponse>(Endpoints.pollingLocations);
    return res.success && res.data ? res.data : null;
}


