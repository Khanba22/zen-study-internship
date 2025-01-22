"use client";

import React, { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const WideVinePlayer = () => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    // Dynamically import shaka-player only on client side
    const loadShaka = async () => {
      try {
        const shaka = (await import("shaka-player")).default;

        // Install polyfills
        await shaka.Player.probeSupport();


        const fetchManifestUrl = async () => {
          return `https://awsnewpop.s3.ap-south-1.amazonaws.com/NewVideo.mp4`;
        };


        // Initialize player
        if (videoRef.current && !playerRef.current) {
          playerRef.current = new shaka.Player(videoRef.current);

          // Add error handler
          playerRef.current.addEventListener("error", (error) => {
            console.error("Error code", error.code, "object", error);
          });

          try {
            const manifestUrl = await fetchManifestUrl();
            await playerRef.current.load(manifestUrl);
            console.log("Video loaded successfully!");
          } catch (error) {
            console.error("Failed to load video:", error);
          }
        }
      } catch (error) {
        console.error("Failed to load Shaka Player:", error);
      }
    };

    loadShaka();

    // Cleanup
    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      className="w-full aspect-video bg-black rounded-lg"
    />
  );
};

// Export with dynamic import and disabled SSR
export default dynamic(() => Promise.resolve(WideVinePlayer), {
  ssr: false,
});
