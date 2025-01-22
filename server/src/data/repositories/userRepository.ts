import { IUser } from "../../core/domain/interfaces/IUser";
import { IUserRepository } from "../../core/domain/interfaces/IUserRepository";
import User from "../../core/domain/models/userModel";

export class UserRepository implements IUserRepository {
  // Find a user by email
  async findByEmail(email: string): Promise<IUser | null> {
    const user = await User.findOne({ email }).select("-password");
    return user ? (user.toObject() as IUser) : null;
  }

  // Find a user by username
  async findByUsername(username: string): Promise<IUser | null> {
    const user = await User.findOne({ username }).select("-password");
    return user ? (user.toObject() as IUser) : null;
  }

  // Save a new user
  async save(user: IUser): Promise<IUser> {
    const newUser = new User(user);
    const savedUser = await newUser.save();
    return savedUser.toObject() as IUser;
  }

  // Find a user by ID
  async findById(id: string): Promise<IUser | null> {
    const user = await User.findById(id).select("-password");
    return user ? (user.toObject() as IUser) : null;
  }

  async findByEmailAndRole(email: string, role: string): Promise<IUser | null> {
    const user = await User.findOne({ email, role: role });
    // console.log(user,3);
    
    return user ? (user.toObject() as IUser) : null;
  }
}
