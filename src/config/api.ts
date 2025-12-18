export const API_BASE_URL = 'https://nassautestingapi-d6gzgzhzamhthuar.eastus-01.azurewebsites.net'
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
    selectCitys: '/api/selectCitys',
    selectCountyCommissionDistrict: '/api/selectCountyCommissionDistrict',
    selectSchoolBoardDistrict: '/api/selectSchoolBoardDistrict',
}

export const RequestConfig = {
    timeoutMs: 240000,  // 4 minutes
  };