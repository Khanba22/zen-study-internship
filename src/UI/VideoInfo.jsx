import { Download, MoreHorizontal, ScissorsIcon, Share2, ThumbsDown, ThumbsUp } from 'lucide-react'
import Image from "next/image"

export function VideoInfo() {
  return (
    <div className="px-4 flex-1 h-full">
      <h1 className="text-xl font-semibold mb-4">
        The Battle of PaniPath - The First Battle of Panipat | Maratha Empire
      </h1>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="https://avatar.iran.liara.run/public/33"
            alt="Channel avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h2 className="font-semibold">Suresh Sir</h2>
            <p className="text-sm text-gray-400">36.6M Followers</p>
          </div>
          <button className="ml-4 bg-white text-black font-semibold py-2 px-4 rounded-full hover:bg-gray-200">
            Visit Profile
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-gray-800 rounded-full">
            <button className="flex items-center py-2 px-4 rounded-l-full hover:bg-gray-700">
              <ThumbsUp className="h-4 w-4 mr-2" />
              2.2M
            </button>
            <div className="h-6 w-px bg-gray-700"></div>
            <button className="p-2 rounded-r-full hover:bg-gray-700">
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <button className="flex items-center py-2 px-4 rounded-full hover:bg-gray-800">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </button>
          <button className="flex items-center p-4 lg:py-2 lg:px-4 rounded-full hover:bg-gray-800">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
        </div>
      </div>
    </div>
  )
}

