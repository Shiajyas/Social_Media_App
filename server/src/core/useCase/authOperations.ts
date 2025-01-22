import { IUser } from "../domain/interfaces/IUser";
import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { verifyGoogleToken } from "../../infrastructure/utils/googleAuthUtils";
import { IAuthService } from "./interfaces/IAuthService";
import { createAccessToken, createRefreshToken } from "../../infrastructure/utils/createTokens";
import bcrypt from "bcryptjs";
import User from "../domain/models/userModel";
import { IOtpService } from "../../infrastructure/services/interfaces/IOtpService";


export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private otpService: IOtpService;

  constructor(userRepository: IUserRepository, otpService: IOtpService) {
    this.userRepository = userRepository;
    this.otpService = otpService;
  }

  // Register user and initiate OTP
  async register(user: IUser): Promise<void> {
    const { email, username, password } = user;


    if (await this.userRepository.findByEmail(email)) {
      throw new Error("Email is already registered.");
    }

    if (await this.userRepository.findByUsername(username)) {
      throw new Error("Username is already taken.");
    }

    if (password.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }

    
    const otp = this.otpService.generateOtp(email);
    console.log("otp for register use : ",otp);
    
    const userData: IUser = { ...user, otp } as IUser;

    
    const isOtpSent = await this.otpService.sendOtpEmail(email, otp) as boolean;
    if (!isOtpSent) {
      throw new Error("Failed to send OTP via email.");
    }
    this.otpService.storeOtp(email, otp, userData);
  }

  async sentOtp(email: string): Promise<{ emailSend: boolean }> {
    const otp = this.otpService.generateOtp(email);
    const isOtpSent: boolean = await this.otpService.sendOtpEmail(email, otp) as boolean;
    return { emailSend: isOtpSent };
  }


  async verifyOtp(email: string, enterdOtp: string): Promise<{ accessToken: string; refreshToken: string; user: IUser; }> {
    console.log(enterdOtp,"Enterd Otp");
    const { valid, expired } = this.otpService.verifyOtp(email, enterdOtp);
    console.log(valid, expired );
    

    if (expired) {
      throw new Error("OTP has expired, please request a new one.");
    }

    if (!valid) {
      throw new Error("Invalid OTP, please try again.");
    }


    const userData = this.otpService.getUserData(email);
    if (!userData) {
      throw new Error("User data not found.");
    }

    // Create the user and save to the database
    const newUser = await this.createUser(userData as IUser);

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = this.generateTokens((newUser._id as string).toString());

    return {  accessToken, refreshToken, user: newUser };
  }

  // Create and save a new user
  async createUser(user: IUser): Promise<IUser> {
    const hashedPassword = await bcrypt.hash(user.password, 12);
    const newUser = new User({ ...user, password: hashedPassword });
    return newUser.save();
  }

  // Generate JWT tokens
  generateTokens(userId: unknown): { accessToken: string; refreshToken: string } {
    return {
      accessToken: createAccessToken({ id: userId }),
      refreshToken: createRefreshToken({ id: userId }),
    };
  }

  async getUser(userId: unknown): Promise<{ user: IUser  }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }
    return { user };
  }

  async login(email: string, password: string, role: "user" | "admin"): Promise<{ token: string; user: IUser;  refreshToken:string } | null> {
    try {
      const user = await this.userRepository.findByEmailAndRole(email,role);

   

      if (!user) {
        throw new Error("give registerd Email.")
      }

      const isMatch = await bcrypt.compare(password, user.password);
      console.log(isMatch, "hit");
      
      if (!isMatch) {
        throw new Error("Email or Password is incorrect.")
      }

      const access_token = createAccessToken({ id: user._id });
      const  refreshToken= createRefreshToken({ id: user._id });

      return {   
        token: access_token, 
        user: user,
        refreshToken
      }
    } catch (error) {
      console.log(error);
      
      throw new Error("Login failed.");
    }
  }

  async requestOtp(email:string) : Promise<void>{
   try {
    
    if (!email) throw new Error("Email is required");

    const normalizedEmail = email.trim().toLowerCase();
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new Error("User not found");

    const otp = this.otpService.generateOtp(email);
    console.log("otp for forgot password : ",otp);
    
    const userData: IUser = {...user, otp } as IUser;

    const isOtpSent = await this.otpService.sendOtpEmail(email, otp) as boolean;
    if (!isOtpSent) {
      throw new Error("Failed to send OTP via email.");
    }
    this.otpService.storeOtp(email, otp, userData);
      return;
   } catch (error) {
    throw new Error ("Internal server error")
   }
  }

  async verify_Otp(email: string, enterdOtp: string): Promise<{ userData: IUser }> {
    try {
      const { valid, expired } = this.otpService.verifyOtp(email, enterdOtp);

      if (expired) {
        throw new Error("OTP has expired, please request a new one.");
      }

      if (!valid) {
        throw new Error("Invalid OTP, please try again.");
      }

      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found.");
      }

      return { userData: user };
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw new Error(error.message);
      } else {
        console.log(String(error));
        throw new Error("Failed to verify OTP.");
      }
    
    }
  }

  async resendOtp(email:string): Promise<boolean>{
    try {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error("User not found.");
      }
      const otp = this.otpService.generateOtp(email);
      console.log("otp for resend : ",otp);
      const userData: IUser = {...user, otp } as IUser;
      const isOtpSent = await this.otpService.sendOtpEmail(email, otp) as boolean;
      if (!isOtpSent) {
        throw new Error("Failed to send OTP via email.");
      }
      this.otpService.storeOtp(email, otp, userData);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        throw new Error(error.message);
      } else {
        console.log(String(error));
        throw new Error("Failed to resend OTP.");
      }
    
    }
    }

    async resetPassword(email: string, password:string): Promise<boolean> {
      try {
    console.log(email,password);
    
        
    if (!email || !password) {
      throw new Error("Email and Password are required");
    }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await this.userRepository.findByEmailAndUpdatePwd(email,passwordHash)
        console.log(user);
        
      if(!user) throw new Error ("User not found") 
      
    
      return true;
      } catch (error) {
        console.log(error);
        
        throw new Error("Failed to update password");
      }
    }

    async getAllUser(query: object):Promise <IUser[]>{
      try {
        const users = await this.userRepository.find({});
        // console.log(users);
        
        return users;
      } catch (error) {
        throw new Error("Failed to get all users");
      }
    }

    async googleAuth(data: string): Promise<{token:string ,user:IUser}> {
        try {
          const payload = await verifyGoogleToken(data);
          const { sub: googleId, email, name, picture } = payload;
          if (!email) {
            throw new Error("Email is required for Google authentication.");
          }
          let user = await this.userRepository.findByEmail(email);
          if (!user) {
            // If user doesn't exist, create a new one
            const randomPassword = Math.random().toString(36).slice(-8);
            user = {
              googleId,
              fullname: name,
              username: email.split("@")[0], 
              email,
              password: randomPassword, 
              avatar: picture,
              mobile: "",
            } as unknown as IUser;
      
              user = await this.userRepository.save(user);
            }
            const { accessToken } = this.generateTokens((user._id as string).toString());

            return {
              token:  accessToken, 
              user: user,
            }
    
        } catch (error) {
          console.error(error);
          throw new Error("Google authentication failed.");
        }
    }

 }

