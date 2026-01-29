/**
 * Central API configuration.
 *
 * IMPORTANT:
 * - The app was crashing because this file was empty, so imports like `Endpoints`
 *   were `undefined` at runtime (e.g. `Endpoints.loginCandidate`).
 * - In dev, we point `API_BASE_URL` at the local backend to make testing easier.
 */

import {Platform} from 'react-native';

const PROD_API_BASE_URL =
  'https://nassautestingapi-d6gzgzhzamhthuar.eastus-01.azurewebsites.net';

// Local Node/Express backend (see backend `server.js` default PORT=3001)
const LOCAL_API_BASE_URL = `http://${
  Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
}:3001`;

export const API_BASE_URL = __DEV__ ? LOCAL_API_BASE_URL : PROD_API_BASE_URL;

export const RequestConfig = {
  timeoutMs: 240_000, // 4 minutes
} as const;

// All endpoints are PATHS appended to `API_BASE_URL` by `ApiClient`.
// Keep leading slashes.
export const Endpoints = {
  loginCandidate: '/api/auth/LoginCandidate',
  petitionQueue: '/api/selectPetitionQueue',
  settings: '/api/settings',
  notifications: '/api/notifications',
  notificationRead: '/api/notifications/mark-read',
  notificationUnreadCount: '/api/notifications/unread-count',
  logout: '/api/auth/LogoutCandidate',
  contactUs: '/api/contact',
  floridaVoters: '/api/floridaVoters',
  selectCitys: '/api/selectCitys',
  selectCountyCommissionDistrict: '/api/selectCountyCommissionDistrict',
  selectSchoolBoardDistrict: '/api/selectSchoolBoardDistrict',
} as const;

// Used by `LoginPopup` to open the "Forgot Password" flow in a webview.
export const FORGOT_PASSWORD_URL =
  'https://precinctmanagement20230415145526.azurewebsites.net/Candidate_ForgotPassword';
