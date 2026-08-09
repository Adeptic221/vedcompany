export interface PublicUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface UserRecord extends PublicUser {
  passwordHash?: string;
  passwordSalt?: string;
  authProvider?: "email" | "sms";
}

export interface SessionPayload {
  sub: string;
  email: string;
  name: string;
  phone: string;
  exp: number;
}