import { Request, Response } from "express";
import mongoose from "mongoose";
import { IUser } from "../../core/domain/interfaces/IUser";
import { IAuthService } from "../../core/useCase/interfaces/IAuthService";
import { getErrorMessage } from "../../infrastructure/utils/errorHelper";
import { IUserRepository } from "../../core/domain/interfaces/IUserRepository";

interface AuthenticatedRequest extends Request {
    user?: IUser;
}

export class AuthController {
    private userService: IAuthService;

    constructor(userService: IAuthService) {
        this.userService = userService;
    }


    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, role } = req.body;
            console.log(req.body,"><><><><");
            
            const loginResult = await this.userService.login(email, password, role);
            console.log(loginResult, "login result");

            if (!loginResult) {
                res.status(400).json({ message: "Login failed." });
                return;
            }

            const { token, refreshToken, user } = loginResult;

            // Check if the user is a Mongoose document, and convert to plain object if so
            const userObject: IUser = user instanceof mongoose.Document ? user.toObject() : user;

            const userWithoutPassword = { ...userObject, password: undefined };

            res.status(200).json({
                msg: "Logged in Successfully!",
                token: token,
                user: userWithoutPassword,
            });

        } catch (error) {
            console.error(error);
            res.status(400).json({ message: getErrorMessage(error) });
        }
    }

    async requestOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            await this.userService.requestOtp(email);
            res.status(200).json({ msg: "OTP sent successfully." });
        } catch (error) {
            console.log(getErrorMessage(error), "error");

            res.status(400).json({ msg: getErrorMessage(error) });
        }
    }

    async register(req: Request, res: Response): Promise<void> {
        try {
            console.log(req.body);

            await this.userService.register(req.body);
            res.status(201).json({ message: "OTP sent successfully.", email: req.body.email });
        } catch (error) {
            console.log(getErrorMessage(error), "error");

            res.status(400).json({ message: getErrorMessage(error) });
        }
    }

    async verifyOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email, enterdOtp } = req.body;
            const { accessToken, refreshToken, user } = await this.userService.verifyOtp(email, enterdOtp);
            res.status(200).json({
                message: "OTP verified successfully.",
                token: accessToken,
                refreshToken,
                user,
            });
        } catch (error) {
            res.status(400).json({ message: getErrorMessage(error) });
        }
    }


    async getUser(req: Request, res: Response): Promise<void> {
        try {

            let userId = (req as AuthenticatedRequest).user?.id

            // console.log(userId, ">>>>>>>>>>>>>>>>>>>>>>>>1234");


            if (!userId) {
                res.status(400).json({ message: "Invalid request: User information is missing." });
                return;
            }


            const getUser = await this.userService.getUser(userId);

            if (!getUser) {
                res.status(404).json({ message: "User not found." });
                return;
            }

            res.status(200).json(getUser);
        } catch (error) {
            console.log(error, "error");

            res.status(500).json({ message: getErrorMessage(error) });
        }
    }

    async verify_Otp(req: Request, res: Response): Promise<void> {
        try {
            const { email, enterdOtp } = req.body;
            const { userData } = await this.userService.verify_Otp(email, enterdOtp);
            res.status(200).json({
                msg: "OTP verified successfully.",
                userData
            });
        } catch (error) {
            res.status(400).json({ msg: getErrorMessage(error) });
        }

    }


    async resendOtp(req: Request, res: Response): Promise<void> {
        try {
            const { email } = req.body;
            const success = await this.userService.resendOtp(email);
            if (!success) {
                res.status(400).json({ message: "Failed to send OTP." });
                return;
            }
            res.status(200).json({
                message: "New OTP sent successfully.",
                success: success,
            });
        } catch (error) {
            res.status(400).json({ msg: getErrorMessage(error) });
        }

    }

    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;
            console.log(req.body);
            
           let success = await this.userService.resetPassword(email, password);
            if (!success) {
                res.status(400).json({ message: "Failed to reset password." });
                return;
            }
            res.status(200).json({ message: "Password reset successfully." });
        } catch (error) {
            res.status(400).json({ msg: getErrorMessage(error) });
        }
    }


    async getAllUser(req: Request, res: Response): Promise<void>  {
        try {
            // console.log("hit getAllUsers");
            
            const users = await this.userService.getAllUser({});
            // console.log(users);
            
            if(!users) throw new Error ("Userlist featching failed")
              res.status(200).json(users);
        } catch (error) {
            console.error(error);
            res.status(400).json({ message: getErrorMessage(error) });
        }
    }

}
