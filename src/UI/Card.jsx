import React from "react";

const Card = () => {
  return (
    <div class="flex flex-col bg-white rounded-lg shadow-md overflow-hidden w-full min-w-[150px] h-full">
      <div class="relative h-2/3 w-full">
        <img
          src="/path-to-your-image.png"
          alt="Python for Everybody"
          class="object-cover w-full h-full"
        />
      </div>
      <div class="p-4 flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/e/e5/University_of_Michigan_block_M_logo.svg"
            alt="University of Michigan"
            class="w-6 h-6"
          />
          <span class="text-gray-800 font-medium text-sm">
            University of Michigan
          </span>
        </div>
        <h3 class="text-gray-900 font-semibold text-lg">
          Python for Everybody
        </h3>
        <span class="text-gray-500 text-sm">Specialization</span>
      </div>
    </div>
  );
};

export default Card;
