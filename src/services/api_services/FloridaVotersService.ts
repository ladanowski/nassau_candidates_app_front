import { ApiClient } from './ApiClient';
import { Endpoints } from '../../config/api';

type CityItem = {
  ResidenceCity: string;
};

type DistrictItem = {
  CountyCommissionDistrict?: string;
  SchoolBoardDistrict?: string;
};

type CityResponse = {
  success: boolean;
  data?: CityItem[];
  message?: string;
};

type DistrictResponse = {
  success: boolean;
  data?: DistrictItem[];
  message?: string;
};

type VoterItem = {
  CountyCode?: string;
  VoterId?: string;
  NameLast?: string;
  NameSuffix?: string;
  NameFirst?: string;
  NameMiddle?: string;
  RequestedPublicRecordsExemption?: string;
  ResidenceAddressLine1?: string;
  ResidenceAddressLine2?: string;
  ResidenceCity?: string;
  ResidenceState?: string;
  ResidenceZipcode?: string;
  MailingAddressLine1?: string;
  MailingAddressLine2?: string;
  MailingAddressLine3?: string;
  MailingCity?: string;
  MailingState?: string;
  MailingZipcode?: string;
  MailingCountry?: string;
  Gender?: string;
  Race?: string;
  BirthDate?: string;
  RegistrationDate?: string;
  PartyAffiliation?: string;
  Precinct?: string;
  PrecinctGroup?: string;
  PrecinctSplit?: string;
  PrecinctSuffix?: string;
  VoterStatus?: string;
  CongressionalDistrict?: string;
  HouseDistrict?: string;
  SenateDistrict?: string;
  CountyCommissionDistrict?: string;
  SchoolBoardDistrict?: string;
  DaytimeAreaCode?: string;
  DaytimePhoneNumber?: string;
  DaytimePhoneExtension?: string;
  EmailAddress?: string;
};

type VotersResponse = {
  success: boolean;
  data?: VoterItem[];
  message?: string;
};

export async function getCities(): Promise<CityItem[]> {
  const res = await ApiClient.get<CityResponse>(Endpoints.selectCitys);
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function getCountyCommissionDistricts(): Promise<DistrictItem[]> {
  const res = await ApiClient.get<DistrictResponse>(Endpoints.selectCountyCommissionDistrict);
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function getSchoolBoardDistricts(): Promise<DistrictItem[]> {
  const res = await ApiClient.get<DistrictResponse>(Endpoints.selectSchoolBoardDistrict);
  return res.success && Array.isArray(res.data) ? res.data : [];
}

export async function getFilteredVoters(filters: {
  city?: string;
  countyCommissionDistrict?: string;
  schoolBoardDistrict?: string;
  // Backwards compatible: some builds used `party`; newer uses `partyAffiliation`
  party?: string;
  partyAffiliation?: 'DEM' | 'REP' | 'OTHER';
  street?: string;
}): Promise<VoterItem[]> {
  const params = new URLSearchParams();
  if (filters.city) params.append('city', filters.city);
  if (filters.countyCommissionDistrict) params.append('countyCommissionDistrict', filters.countyCommissionDistrict);
  if (filters.schoolBoardDistrict) params.append('schoolBoardDistrict', filters.schoolBoardDistrict);

  const party = (filters.partyAffiliation ?? filters.party)?.toString();
  if (party) {
    // Send both keys so either backend implementation works
    params.append('partyAffiliation', party);
    params.append('party', party);
  }

  if (filters.street) params.append('street', filters.street);
  
  const queryString = params.toString();
  const url = queryString ? `${Endpoints.floridaVoters}?${queryString}` : Endpoints.floridaVoters;
  // React Native fetch can fail on URLs with unescaped spaces; ensure the final URL is safe.
  const safeUrl = encodeURI(url);
  
  const res = await ApiClient.get<VotersResponse>(safeUrl);
  return res.success && Array.isArray(res.data) ? res.data : [];
}