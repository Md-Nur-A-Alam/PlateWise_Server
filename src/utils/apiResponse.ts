export class ApiResponse {
  constructor(
    public statusCode: number,
    public data: any,
    public message: string = "Success"
  ) {}
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors: any[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}
