const PROD_API_BASE_URL = 'https://nassautestingapi-d6gzgzhzamhthuar.eastus-01.azurewebsites.net'
const DEV_API_BASE_URL = 'http://localhost:3001'

export const API_BASE_URL = __DEV__ ? DEV_API_BASE_URL : PROD_API_BASE_URL
export const FORGOT_PASSWORD_URL = 'https://precinctmanagement20230415145526.azurewebsites.net/Candidate_ForgotPassword'

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
    pollingLocations: '/api/pollingLocations',
    selectCitys: '/api/selectCitys',
    selectCountyCommissionDistrict: '/api/selectCountyCommissionDistrict',
    selectSchoolBoardDistrict: '/api/selectSchoolBoardDistrict',
}

export const RequestConfig = {
    timeoutMs: 240000,  // 4 minutes
  };
