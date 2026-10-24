export class DomainError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string, public readonly retryable = false) {
    super(message);
    this.name = "DomainError";
  }
}
