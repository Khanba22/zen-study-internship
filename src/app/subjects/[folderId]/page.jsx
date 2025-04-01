"use client";

import { Playlist } from "@/UI/PlayList";
import { UploadButton } from "@/UI/UploadButton";
import { UploadPopup } from "@/UI/UploadPopUp";
import WideVinePlayer from "@/UI/WideWirePlayer";
import { useCallback, useState } from "react";

export default function YouTubePlayer() {
  const [showUploadPopup, setShowUploadPopup] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState("initial-video-id");
  const [isPlaying, setIsPlaying] = useState(false);

  const handleVideoSelect = useCallback((videoId) => {
    setCurrentVideoId(videoId);
    setIsPlaying(true);
  }, []);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleUpload = useCallback(async (files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`video${index}`, file);
    });

    try {
      const response = await fetch("/api/course/MyNewCourse/chapter/chapterName/video", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Videos uploaded successfully");
        setShowUploadPopup(false);
      } else {
        console.log(response);
        console.error("Failed to upload videos");
      }
    } catch (error) {
      console.error("Error uploading videos:", error);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row scrollbar-hide overflow-clip h-screen bg-black text-white">
      <div className="flex-1 pt-2 px-1 w-full lg:px-10 lg:py-8 flex h-full flex-col">
        <div className="relative aspect-video h-auto bg-gray-950">
          <WideVinePlayer manifestUrl={currentVideoId} />
        </div>
      </div>
      <Playlist onVideoSelect={handleVideoSelect} />
      <UploadButton onClick={() => setShowUploadPopup(true)} />
      {showUploadPopup && (
        <UploadPopup
          onClose={() => setShowUploadPopup(false)}
          onUpload={handleUpload}
        />
      )}
    </div>
  );
}
