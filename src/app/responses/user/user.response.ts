export interface UserResponse {
    id: number;
    userName: string;
    email: string;
    createdDate: string | null;
    role: string;
    verifyCode: string;
    address: string;
    fullName: string;
    deleted: boolean | null;
    password: string;
    dateOfBirth: string;
    phone_number: string | null;
    verify: boolean;
    avatar: string;
  }