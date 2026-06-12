export {};

declare global {
  namespace Express {
    interface User {
      id: string;
      iat?: number;
      exp?: number;
    }
    interface Request {
      user?: User;
    }
  }
}
