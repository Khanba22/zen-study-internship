import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function authenticate(req) {
  const token = req.headers.get('Authorization')?.split(' ')[1];
  if (!token) return null;

  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

export function authorize(user, roles) {
  return roles.includes(user.roles[0]);
}
