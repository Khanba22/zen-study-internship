import React from "react";

const Button = ({ text, onClick, classList }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full h-full bg-blue-500 text-white font-bold py-2 px-4 rounded transition-all duration-300 ease-in-out hover:bg-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-300 active:scale-95 ${
        classList || ""
      }`}
    >
      {text}
    </button>
  );
};

export default Button;
