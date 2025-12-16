export const API_BASE_URL = 'http://192.168.14.89:3002'
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
}

export const RequestConfig = {
    timeoutMs: 60000,
  };