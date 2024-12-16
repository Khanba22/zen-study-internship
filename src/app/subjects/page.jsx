'use client'
import Card from "@/UI/Card";
import React from "react";

const page = () => {

  return (
    <div className="container lg:pt-24 pt-8 mx-auto p-6 text-gray-100 flex flex-col h-screen">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-100">
        Available Courses
      </h1>
      <div className="grid grid-cols-1 h-full overflow-y-scroll scrollbar-hide pt-4 w-full sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 gap-2">
        {Array.from({ length: 10 }).map((_, i) => (
          <div className="w-full lg:aspect-square h-32 lg:h-full" key={i}>
            <Card
              courseName={`Subject ${i}`}
              bannerImgSrc={`https://loremflickr.com/200/200?random=${i - 1}`}
              courseType={"Web Development"}
              educatorAvatar={"https://avatar.iran.liara.run/public/38"}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
