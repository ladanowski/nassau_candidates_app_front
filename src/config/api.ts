export const API_BASE_URL = 'https://nassautestingapi-d6gzgzhzamhthuar.eastus-01.azurewebsites.net';

export const Endpoints = {
    loginCandidate: '/api/auth/LoginCandidate',
    petitionQueue: '/api/selectPetitionQueue',
    settings: '/api/settings',
    notifications: '/api/notifications',
    logout: '/api/auth/LogoutCandidate',
}

export const RequestConfig = {
    timeoutMs: 60000,
  };