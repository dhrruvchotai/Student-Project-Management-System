import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "spms-default-secret-key";

export interface JwtPayload {
    userId: number;
    email: string;
    role: string;
}

export function signToken(payload: JwtPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
        return null;
    }
}
