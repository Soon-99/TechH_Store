import { UserResponse } from "./user.response";

export interface RegisterResponse {
    errorCode: number;
    message: string;
    status: 'success' | 'error';
    data: UserResponse | null;
}