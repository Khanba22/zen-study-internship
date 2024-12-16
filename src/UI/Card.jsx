"use client";
import { useRouter } from "next/navigation";
import React from "react";

const Card = ({ bannerImgSrc, educatorName, courseName, courseType }) => {
  const router = useRouter();

  return (
    <div
      onClick={() => {
        router.push(`/subjects/${courseName}`)
      }}
      className="flex lg:flex-col h-full bg-[#1f1f1f] rounded-lg cursor-pointer shadow-md overflow-hidden w-full border border-neutral-700"
    >
      <div className="relative lg:h-1/2 h-full aspect-square">
        <img
          src={bannerImgSrc}
          alt={courseName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="lg:p-4 p-2 flex flex-col lg:gap-2 gap-1">
        <div className="flex items-center gap-2">
          <span className="text-gray-300 font-medium text-sm">
            {educatorName}
          </span>
        </div>
        <h3 className="text-gray-100 font-semibold text-lg">{courseName}</h3>
        <span className="text-gray-400 text-sm">{courseType}</span>
      </div>
    </div>
  );
};

export default Card;
