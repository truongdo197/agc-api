declare namespace Express {
  interface Request {
    accountId?: string;
    memberId?: string;
    gender?: number;
    userId?: string;
    verify?: any;
    permissions?: any[];
    language?: string;
  }
}
