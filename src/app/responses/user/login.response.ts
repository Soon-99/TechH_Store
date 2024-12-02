import { UserResponse } from "./user.response";

export interface LoginResponse {
  errorCode: number;
  message: string;
  status: string;
  data: {
    token: string;
    authenticated: boolean;
    user: UserResponse
  };
}