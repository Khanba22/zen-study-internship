"use client";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const DashBoardNavItem = ({ item, handleClick, selected }) => {
  const isSelected = item === selected;

  return (
    <div>
      <button
        onClick={() => {
          handleClick(item);
        }}
        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-white transition-all duration-300 ease-in-out hover:bg-white/10 ${
          isSelected ? "bg-white/10" : ""
        }`}
      >
        {item.icon}
        <span className="flex-1 text-sm font-medium">{item.title}</span>
        {item.badge && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-medium text-blue-600">
            {item.badge}
          </span>
        )}
      </button>
    </div>
  );
};

export default DashBoardNavItem;
