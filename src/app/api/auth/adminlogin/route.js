import User from '@/database/models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'your_secret_key';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    const admin = await User.findOne({ email, roles: 'admin' });

    if (!admin) {
      return new Response(JSON.stringify({ message: 'Admin not found' }), { status: 404 });
    }

    const isValid = await bcrypt.compare(password, admin.password);
    if (!isValid) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), { status: 401 });
    }

    const token = jwt.sign({ id: admin._id, roles: admin.roles }, SECRET, { expiresIn: '1h' });

    return new Response(JSON.stringify({ token }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
