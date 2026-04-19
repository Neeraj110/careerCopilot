export type RegisterInput = {
  email: string;
  password: string;
  name: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type PublicUser = {
  id: string;
  email: string;
  name: string | null;
};

export type UserServiceFailure = {
  ok: false;
  status: number;
  error: string;
};

export type UserServiceSuccess = {
  ok: true;
  status: number;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: PublicUser;
};

export type UserServiceResult = UserServiceFailure | UserServiceSuccess;
