import { Briefcase, MapPin, Calendar, Pencil, Eye, Send } from "lucide-react";

export default function DashBoardHeader({ heading, loading , noOfVideos,courseId,courseName }) {
  return loading ? (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-100">{heading}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-gray-400" />
            <span>{courseId}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-gray-400" />
            <span>{courseName}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">$</span>
            <span>{noOfVideos}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
          <Pencil className="h-4 w-4" />
          Edit
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg border border-gray-600 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white">
          <Eye className="h-4 w-4" />
          View
        </button>
        <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Send className="h-4 w-4" />
          Publish
        </button>
      </div>
    </div>
  ) : (
    <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-100">{heading}</h1>
      </div>
    </div>
  );
}
