import { Endpoints } from "../../config/api";
import { ApiClient } from "./ApiClient";

type LogoutResponse = {
  success: boolean;
  message?: string;
};

export async function logoutCandidate(): Promise<LogoutResponse> {
  return ApiClient.post<LogoutResponse>(Endpoints.logout, {});
}