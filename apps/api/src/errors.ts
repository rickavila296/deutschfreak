import { apiErrorStatus, type ApiErrorCode } from '@deutschfreak/validation';

/** An error the API means to send. The error handler turns it into the one error shape (TRD-API-20). */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;

  constructor(code: ApiErrorCode, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = apiErrorStatus[code];
  }
}
