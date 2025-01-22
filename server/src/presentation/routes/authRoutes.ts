import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { OtpService } from "../../infrastructure/services/otpService";
import { IOtpService } from "../../infrastructure/services/interfaces/IOtpService";
import { UserRepository } from "../../data/repositories/userRepository";
import { IUserRepository } from "../../core/domain/interfaces/IUserRepository";
import { UserService } from "../../core/useCase/UserOperations";
import { IUserService } from "../../infrastructure/services/interfaces/IUserService";
import AuthMiddleware from "../middleware/authMiddleware";

const router = Router();


const userRepository : IUserRepository = new UserRepository(); 
const otpService : IOtpService = new OtpService(); 

const userService : IUserService = new UserService(userRepository, otpService);

const authController = new AuthController(userService);

router.post("/register", authController.register.bind(authController));
router.post("/verify_otp", authController.verifyOtp.bind(authController));
router.get("/user",AuthMiddleware.authenticate,authController.getUser.bind(authController))  
router.post("/login", authController.login.bind(authController));

export default router;
