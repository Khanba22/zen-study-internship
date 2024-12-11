import React from "react";

const Card = ({
  bannerImgSrc,
  educatorName,
  educatorAvatar,
  courseName,
  courseType,
}) => {
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden w-full border border-neutral-200">
      <div className="relative h-1/2 w-full p-2">
        <img
          src={bannerImgSrc}
          alt={courseName}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <img src={educatorAvatar} alt={educatorName} className="w-8 h-8 mx-1" />
          <span className="text-gray-800 font-lg text-sm">
            {educatorName}
          </span>
        </div>
        <h3 className="text-gray-900 font-semibold text-lg">{courseName}</h3>
        <span className="text-gray-500 text-sm py-2">{courseType}</span>
      </div>
    </div>
  );
};

export default Card;
