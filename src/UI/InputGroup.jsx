"use client";
import React from "react";

const InputGroup = ({ label, value, onChange, type, name }) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <div className="relative w-full bg-inherit h-full border-2">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(value !== "")}
        className="w-full h-full px-4 p-2 border bg-inherit border-gray-300 rounded-md bg-white peer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <label
        htmlFor={name}
        className={`absolute left-4 h-6 px-1 font-semibold top-0 bottom-0 m-auto transition-all duration-200 pointer-events-none bg-inherit
        ${
          isFocused || value !== ""
            ? "text-gray-600 -top-3 m-0 bg-inherit"
            : " text-gray-400"
        }`}
      >
        {label}
      </label>
    </div>
  );
};

export default InputGroup;
