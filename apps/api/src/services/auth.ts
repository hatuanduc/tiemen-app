import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

export function signToken(user: { id: string; email: string; name?: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    jwtSecret,
    { expiresIn: '1h' },
  );
}

export function verifyToken(token: string) {
  return jwt.verify(token, jwtSecret);
}
