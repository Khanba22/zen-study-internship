"use client";
import {
  Delete,
  DeleteIcon,
  LucideDelete,
  RemoveFormatting,
  RemoveFormattingIcon,
  Trash,
  ViewIcon,
} from "lucide-react";
import React from "react";

const PlayCard = ({ key }) => {
  return (
    <div
      key={key}
      className="flex gap-2 group hover:bg-gray-800 rounded-lg items-center p-1 px-10 cursor-pointer"
    >
      <div className="px-1 py-1 h-full flex justify-center aspect-square">
        <img
          src="https://avatar.iran.liara.run/public/38"
          alt="Video thumbnail"
          className="rounded object-contain h-14 aspect-square"
        />
      </div>
      <div className="flex-1">
        <h4 className="font-medium line-clamp-2">
          Chapter {key + 1}: The Chapter Name
        </h4>
        <p className="text-sm text-gray-400">Suresh Sir</p>
        <p className="text-sm text-gray-400">4:05</p>
      </div>
      <button className="p-1 bg-blue-500 m-2 rounded hover:bg-blue-600 transition-all duration-300 ease-in-out">
        <ViewIcon />
      </button>
      <button className="p-1 bg-red-500 m-2 rounded hover:bg-red-600 transition-all duration-300 ease-in-out">

        <Trash />
      </button>
    </div>
  );
};

const DashboardVideoLister = () => {
  return (
    <div className="h-full w-full scrollbar-hide overflow-y-auto">
      {Array.from({ length: 20 }).map((_, i) => (
        <PlayCard key={i} />
      ))}
    </div>
  );
};

export default DashboardVideoLister;
