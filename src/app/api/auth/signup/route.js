import User from '@/database/models/User';
import bcrypt from 'bcrypt';

export async function POST(req) {
  try {
    const { username, email, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, roles:["user","admin"] });
    await newUser.save();

    return new Response(JSON.stringify({ message: 'User created successfully' }), {
      status: 201,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
