export interface ActiveAccountResponse {
    errorCode: number;
    message: string;
    status: 'success' | 'error';
    data: {
        activated: boolean;
    } | null;
}