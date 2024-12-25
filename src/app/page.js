import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      {/* Header Section */}
      <header className="w-full bg-blue-600 text-white py-4">
        <div className="container mx-auto text-center text-lg font-bold">
          Zenstudy
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-4 text-center">
          Lorem ipsum dolor sit amet.
        </h1>
        <p className="text-gray-600 mb-8 text-center max-w-xl">
          Lorem, ipsum dolor sit amet consectetur adipisicing elit. Molestias,
          quis amet natus, aliquam voluptates perspiciatis eum enim numquam
          ratione vero possimus, nostrum accusamus a quo.
        </p>
        <div className="flex space-x-4">
          <Link
            href="/admin/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded transition duration-300"
          >
            Admin Login
          </Link>
          <Link
            href="/subjects"
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-6 rounded transition duration-300"
          >
            View Courses
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-gray-800 text-gray-400 py-4">
        <div className="container mx-auto text-center">
          © 2024 My Company. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
