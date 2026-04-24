export class AppError extends Error {
  status: number;
  reference?: string;

  constructor(message: string, status: number, reference?: string) {
    super(message);
    this.status = status;
    this.reference = reference;
  }
}

export class ApiError extends AppError {}

export class UserError extends AppError {}