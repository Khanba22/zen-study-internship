import React from "react";

const SelectGroup = ({ name, id, value, onChange, options ,label}) => {
  return (
    <div className="relative w-full h-full p-2">
      <label className="text-gray-600 h-6 px-2 py-2 font-semibold" htmlFor={name}>{label}</label>
      <select
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        className="w-full h-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
      >
        <option
          value={null}
          className="text-gray-700 bg-white hover:bg-gray-100"
        >
          --Choose an option--
        </option>
        {options.map((option, index) => (
          <option
            key={index}
            value={option}
            className="text-gray-700 bg-white hover:bg-gray-100"
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectGroup;
