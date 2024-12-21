import Course from '@/database/models/Course';
import { authenticate, authorize } from '@/utils/auth';

export async function GET(req) {
  try {
    const courses = await Course.find();
    return new Response(JSON.stringify(courses), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req) {
  const user = await authenticate(req);
  if (!user || !authorize(user, ['admin'])) {
    return new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 });
  }

  try {
    const { courseTitle, courseDescription, instructor } = await req.json();
    const newCourse = new Course({ courseTitle, courseDescription, instructor });
    await newCourse.save();

    return new Response(JSON.stringify(newCourse), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
