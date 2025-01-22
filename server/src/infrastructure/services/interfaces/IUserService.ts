import { IUser } from "../../../core/domain/interfaces/IUser";

export interface IUserService {
  register(user: IUser): Promise<void>;
  verifyOtp(email: string, otp: string): Promise<{ accessToken: string; refreshToken: string; user: IUser }>;
  createUser(user: IUser): Promise<IUser>;
  generateTokens(userId: string): { accessToken: string; refreshToken: string };
  getUser(userId : unknown) : Promise<{user: IUser}>
   login(email: string, password: string, role: "user" | "admin"): Promise<{ token: string; user: IUser;refreshToken: string;  } | null>
}
