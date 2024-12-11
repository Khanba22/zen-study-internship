"use client"
import Button from "@/UI/Button";
import { Playlist } from "@/UI/PlayList";
import { UploadButton } from "@/UI/UploadButton";
import { UploadPopup } from "@/UI/UploadPopUp";
import { VideoInfo } from "@/UI/VideoInfo";
import { VideoPlayer } from "@/UI/VideoPlayer";
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
      const response = await fetch("/api/video/upload", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        console.log("Videos uploaded successfully");
        setShowUploadPopup(false);
      } else {
        console.error("Failed to upload videos");
      }
    } catch (error) {
      console.error("Error uploading videos:", error);
    }
  }, []);

  return (
    <div className="flex flex-col lg:flex-row scrollbar-hide overflow-clip h-screen bg-black text-white">
      <div className="flex-1 w-full lg:px-10 lg:py-2 flex h-full flex-col">
        <VideoPlayer
          videoUrl={"https://drive.google.com/file/d/1ZyGSKPbPXapZY501D88s9pJ4mP4sWY-9/view?usp=drive_link"}
          isPlaying={isPlaying}
          onPlayPause={togglePlayPause}
        />
        <VideoInfo />
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
