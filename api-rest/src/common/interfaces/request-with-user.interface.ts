import { Request } from 'express'

export interface RequestWithUser extends Request {
    user: {
        sub: number;
        email: string;
        iat?: number;     // Issued at
        exp?: number;     // Expires at
    }
}