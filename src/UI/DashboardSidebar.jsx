"use client";

import { Book } from "lucide-react";
import DashBoardNavItem from "./DashBoardNavItem";
import { useEffect, useState } from "react";

const createNavItem = (title, icon, badge, isExpandable, items) => ({
  title,
  icon,
  badge,
  isExpandable,
  items,
});

const PAGES_ITEMS = [
  createNavItem("History", <Book className="h-5 w-5" />),
  createNavItem("Civics", <Book className="h-5 w-5" />),
  createNavItem("Geography", <Book className="h-5 w-5" />),
  createNavItem("Mathematics", <Book className="h-5 w-5" />),
  createNavItem("Computers", <Book className="h-5 w-5" />),
  createNavItem("SQL", <Book className="h-5 w-5" />),
  createNavItem("Graphics", <Book className="h-5 w-5" />),
  createNavItem("Operating Systems", <Book className="h-5 w-5" />),
  createNavItem("Windows", <Book className="h-5 w-5" />),
  createNavItem("Linux", <Book className="h-5 w-5" />),
  createNavItem("Graphs", <Book className="h-5 w-5" />),
  createNavItem("Tables", <Book className="h-5 w-5" />),
  createNavItem("Excel", <Book className="h-5 w-5" />),
];

export default function DashboardSideBar({selectedCourse, setSelectedCourse}) {
  const [courses, setCourses] = useState(PAGES_ITEMS);

  useEffect(() => {
    fetch("/api/courses")
      .then((response) => response.json())
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching courses:", error));
  }, []);

  // UseEffect To Get the videos in the Selected Course as the Course Changes


  const handleClick = (item) => {
    console.log("Selected course:", item);
    setSelectedCourse(item);
  };

  return (
    <>
      <div className="flex h-full shadow-lg overflow-y-scroll scrollbar-hide w-full flex-col bg-[#1f1f1f] p-3">
        {/* Logo */}
        <div className="mb-6 flex items-center gap-2 px-3 py-4">
          <div className="text-xl font-bold text-gray-100">ZenStudy</div>
          <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-[#1f1f1f]">
            ADMIN
          </span>
        </div>

        {/* Navigation */}
        <div className="flex-1 space-y-1">
          {/* Pages Section */}
          <div className="mb-4">
            <div className="mb-2 px-3 text-xs font-semibold text-gray-400">
              Subjects
            </div>
            <nav className="space-y-1">
              {courses.map((item) => (
                <DashBoardNavItem
                  selected={selectedCourse}
                  handleClick={handleClick}
                  key={item.title}
                  item={item}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
