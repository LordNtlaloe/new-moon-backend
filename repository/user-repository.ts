import { PrismaClient, User, UserRole } from "@prisma/client";
import { CreateUserData, UserRepository } from "./interfaces/UserRepository";

const prisma = new PrismaClient();

// CREATE USER
export const createUser = async (userData: CreateUserData): Promise<User> => {
  try {
    const newUser = await prisma.user.create({
      data: {
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || UserRole.CLIENT,
        phone: userData.phone,
        avatar: userData.avatar,
        password: userData.password,
      },
    });

    return newUser;
  } catch (error: any) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

// GET USER BY EMAIL
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { email },
    });
  } catch (error: any) {
    console.error("Error fetching user by email:", error);
    throw new Error("Failed to get user by email");
  }
};

// GET USER BY ID
export const getUserById = async (id: string): Promise<User | null> => {
  try {
    return await prisma.user.findUnique({
      where: { id },
    });
  } catch (error: any) {
    console.error("Error fetching user by ID:", error);
    throw new Error("Failed to get user");
  }
};

// UPDATE USER
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    return await prisma.user.update({
      where: { id },
      data,
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

// DELETE USER
export const deleteUser = async (id: string): Promise<User> => {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    throw new Error("Failed to delete user");
  }
};

// REPOSITORY EXPORT
const userRepository: UserRepository = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser,
  deleteUser,
};

export default userRepository;
