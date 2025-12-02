import { User, UserRole } from "@prisma/client";

interface CreateUserData {
  email: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
  phone?: string;
  avatar?: string;
  password: string;
  refreshToken?: string | null;  // Add this
}

export default interface UserRepository {
  createUser(userData: CreateUserData): Promise<User>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<User>;
}

export type { CreateUserData, UserRepository };