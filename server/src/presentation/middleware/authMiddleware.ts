import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../../core/domain/models/userModel";

interface DecodedToken {
  id: string;
}

export class AuthMiddleware {
  // Middleware method for authentication
  static async authenticate(req: Request & { user?: any }, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.header("Authorization");

      // console.log(token,"Token");
      
     
      if (!token) {
        res.status(400).json({ msg: "You are not authorized" });
        return;
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET || "") as DecodedToken;

      if (!decoded) {
        res.status(400).json({ msg: "You are not authorized" });
        return;
      }

      const user = await User.findOne({ _id: decoded.id });
      // console.log(user,"user");
      
      if (!user) {
        res.status(404).json({ msg: "User not found" });
        return;
      }

      req.user = user;
      next();
      return;
    } catch (err: any) {
      console.log(err.message);
      
      res.status(500).json({ msg: err.message });
      
    }
  }
}

export default AuthMiddleware;
