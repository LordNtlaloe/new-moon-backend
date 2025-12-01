import { UserRepository, CreateUserData } from "@/repo/interfaces";
import { User } from "@prisma/client";
import bcrypt from "bcryptjs";

export const createNewUser = async (
    userRepository: UserRepository,
    userData: CreateUserData
): Promise<User> => {
    try {
        // Check if user already exists by email
        const existingEmailUser = await userRepository.getUserByEmail(userData.email);
        if (existingEmailUser) {
            throw new Error("Email already registered");
        }

        // Hash password before saving
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        const userDataWithHash = {
            ...userData,
            password: hashedPassword
        };

        const newUser = await userRepository.createUser(userDataWithHash);
        return newUser;
    } catch (error: any) {
        console.error("Error creating user:", error);
        throw error;
    }
};

export const getUserById = async (
    userRepository: UserRepository,
    id: string
): Promise<User | null> => {
    try {
        const user = await userRepository.getUserById(id);
        return user;
    } catch (error: any) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

export const getUserByEmail = async (
    userRepository: UserRepository,
    email: string
): Promise<User | null> => {
    try {
        const user = await userRepository.getUserByEmail(email);
        return user;
    } catch (error: any) {
        console.error("Error fetching user:", error);
        throw error;
    }
};

export const updateUserRefreshToken = async (
    userRepository: UserRepository,
    id: string,
    refreshToken: string | null
): Promise<User> => {
    try {
        const user = await userRepository.updateUser(id, { refreshToken });
        return user;
    } catch (error: any) {
        console.error("Error updating user refresh token:", error);
        throw error;
    }
};

export default {
    createNewUser,
    getUserById,
    getUserByEmail,
    updateUserRefreshToken,
};