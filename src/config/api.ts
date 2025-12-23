// For iOS Simulator or physical device: use 'http://localhost:3001'
// For Android Emulator: use 'http://10.0.2.2:3001'
export const API_BASE_URL = 'http://localhost:3001'
export const FORGOT_PASSWORD_URL = 'https://precinctmanagement20230415145526.azurewebsites.net/Candidate_ForgotPassword'

export const Endpoints = {
    loginCandidate: '/api/auth/LoginCandidate',
    petitionQueue: '/api/selectPetitionQueue',
    selectCitys: '/api/selectCitys',
    selectCountyCommissionDistrict: '/api/selectCountyCommissionDistrict',
    selectSchoolBoardDistrict: '/api/selectSchoolBoardDistrict',
    floridaVoters: '/api/floridaVoters',
    pollingLocations: '/api/pollingLocations',
    settings: '/api/settings',
    notifications: '/api/notifications',
    notificationRead: '/api/notifications/mark-read',
    notificationUnreadCount: '/api/notifications/unread-count',
    logout: '/api/auth/LogoutCandidate',
}

export const RequestConfig = {
    timeoutMs: 60000,
  };