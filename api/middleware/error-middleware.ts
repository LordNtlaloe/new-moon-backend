import { Response } from "express";

export class ErrorHandler extends Error {
    status: number;
    code?: number;

    constructor(status: number, message: string, code?: number) {
        super();
        this.status = status;
        this.message = message;
        this.code = code;
    }
}

export function handleError(error: ErrorHandler, res: Response) {
    const status = error?.status || 500;
    const message = error?.message || "Something went wrong";
    const code = error?.code || 100;

    return res.status(status).send({
        success: false,
        error: {
            message,
            status,
            code,
        },
    });
}