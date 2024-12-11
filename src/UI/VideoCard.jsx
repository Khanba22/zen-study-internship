import React from "react";
import Image from "next/image";

const VideoCard = () => {
  return (
    <div className="flex gap-2 group hover:bg-gray-800 rounded-lg p-1">
      <Image
        src="/placeholder.svg?height=90&width=160"
        alt="Video thumbnail"
        width={160}
        height={90}
        className="rounded object-cover w-40 h-24"
      />
      <div className="flex-1">
        <h4 className="font-medium line-clamp-2">
          The Weeknd, JENNIE & Lily Rose Depp - One Of The Girls
        </h4>
        <p className="text-sm text-gray-400">The Weeknd</p>
        <p className="text-sm text-gray-400">4:05</p>
      </div>
    </div>
  );
};

export default VideoCard;
