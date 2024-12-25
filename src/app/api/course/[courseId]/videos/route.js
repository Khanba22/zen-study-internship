import Course from '@/database/models/Course';
import { authenticate, authorize } from '@/app/utils/auth';

export async function GET(req, { params }) {
  const { courseId } = params;

  try {
    const course = await Course.findById(courseId).select('videos');
    if (!course) {
      return new Response(JSON.stringify({ message: 'Course not found' }), { status: 404 });
    }

    return new Response(JSON.stringify(course.videos), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function POST(req, { params }) {
  const user = await authenticate(req);
  if (!user || !authorize(user, ['admin'])) {
    return new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 });
  }

  const { courseId } = params;

  try {
    const { title, description, videoUrl, duration, thumbnailUrl } = await req.json();
    const course = await Course.findById(courseId);

    if (!course) {
      return new Response(JSON.stringify({ message: 'Course not found' }), { status: 404 });
    }

    course.videos.push({ title, description, videoUrl, duration, thumbnailUrl });
    await course.save();

    return new Response(JSON.stringify(course), { status: 201 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}

export async function DELETE(req, { params }) {
  const user = await authenticate(req);
  if (!user || !authorize(user, ['admin'])) {
    return new Response(JSON.stringify({ message: 'Access denied' }), { status: 403 });
  }

  const { courseId, videoId } = params;

  try {
    const course = await Course.findById(courseId);

    if (!course) {
      return new Response(JSON.stringify({ message: 'Course not found' }), { status: 404 });
    }

    course.videos = course.videos.filter((video) => video._id.toString() !== videoId);
    await course.save();

    return new Response(JSON.stringify(course), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
}
