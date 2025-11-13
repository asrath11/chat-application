import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

export const generateToken = (userId: string) => {
  return jwt.sign(
    { userId },
    JWT_SECRET as string,
    {
      expiresIn: JWT_EXPIRES_IN,
    } as jwt.SignOptions
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET as string) as { userId: string };
};
