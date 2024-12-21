"use client";
import DashBoardHeader from "@/UI/DashboardHeader";
import DashboardSideBar from "@/UI/DashboardSidebar";
import DashboardVideoLister from "@/UI/DashboardVideoLister";
import { Playlist } from "@/UI/PlayList";
import React, { useEffect, useState } from "react";

const Page = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseVideos, setCourseVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  useEffect(() => {
    // setLoading(true);
    setText("Loading courses...");
    fetch("/api/courses")
      .then((response) => response.json())
      .then((data) => {
        setSelectedCourse(data[0]);
        // setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching courses:", error);
        setText("Error fetching courses");
      });
  }, [selectedCourse]);

  let touchStartX = 0;
  let touchEndX = 0;

  const handleTouchStart = (e) => {
    touchStartX = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const swipeDistance = touchEndX - touchStartX;
    if (swipeDistance > 50) {
      setIsSidebarOpen(true);
    }
  };

  return (
    <div
      onClick={() => setIsSidebarOpen(false)}
      className="h-full md:p-5 container m-auto rounded-sm w-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        style={{
          background: "linear-gradient(315deg, #1e1e1e, #2a2a2a)",
          boxShadow: "-7px -7px 14px #141414, 7px 7px 14px #323232",
        }}
        className="h-full flex flex-1 relative overflow-hidden md:overflow-clip items-center w-full"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`w-80 absolute md:relative left-0 z-30 md:translate-x-0 -translate-x-full md:rounded-l-lg overflow-hidden md:w-64 drop-shadow-lg h-full bg-[#252525] transition-transform duration-300 ${
            isSidebarOpen ? "translate-x-0" : ""
          }`}
        >
          <DashboardSideBar
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
          />
        </div>
        <main className="flex drop-shadow-lg rounded-r-lg md:w-screen overflow-y-scroll h-full scrollbar-hide w-full flex-col bg-[#1f1f1f] p-4">
          {loading ? (
            <DashBoardHeader heading={text} />
          ) : (
            <>
              <DashBoardHeader
                courseId={selectedCourse?.courseId || "Course Name"}
                heading={"Course Details"}
                loading={false}
                noOfVideos={selectedCourse?.noOfVideos || 0}
                courseName={selectedCourse?.title || "No Course"}
              />
              <DashboardVideoLister />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Page;
