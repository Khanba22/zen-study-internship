"use client";
import React, { useEffect, useRef } from "react";
import shaka from "shaka-player";

const WideVinePlayer = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (!(typeof window !== "undefined" && typeof navigator !== "undefined")) {
      return;
    }

    const manifestUrl =
      "https://storage.googleapis.com/shaka-demo-assets/angel-one-widevine/dash.mpd"; // Public Widevine test stream

    const player = new shaka.Player(videoRef.current);

    player.configure({
      drm: {
        servers: {
          "com.widevine.alpha": "https://cwip-shaka-proxy.appspot.com/no_auth", // Public test license server
        },
      },
    });

    player
      .load(manifestUrl)
      .then(() => console.log("Video loaded successfully!"))
      .catch((error) => console.error("Failed to load video:", error));

    return () => {
      if (player) {
        player.destroy();
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

export default WideVinePlayer;

// "use client";
// import React, { useEffect, useRef } from "react";
// import shaka from "shaka-player";
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

// const WideVinePlayer = () => {
//   const videoRef = useRef(null);

//   useEffect(() => {
//     if (!(typeof window !== "undefined" && typeof navigator !== "undefined")) {
//       return;
//     }

//     const region = "us-west-2"; // Replace with your AWS region
//     const bucketName = "your-s3-bucket-name"; // Replace with your bucket name
//     const objectKey = "path/to/your/video/manifest.mpd"; // Replace with the path to your manifest file
//     const drmLicenseUrl = "https://your-license-server-url"; // Replace with your license server URL

//     const s3Client = new S3Client({ region });

//     const fetchManifestUrl = async () => {
//       try {
//         const command = new GetObjectCommand({
//           Bucket: bucketName,
//           Key: objectKey,
//         });
//         const response = await s3Client.send(command);
//         return URL.createObjectURL(await response.Body.blob());
//       } catch (error) {
//         console.error("Failed to fetch manifest URL from S3:", error);
//         throw error;
//       }
//     };

//     const initPlayer = async () => {
//       const manifestUrl = await fetchManifestUrl();

//       const player = new shaka.Player(videoRef.current);

//       player.configure({
//         drm: {
//           servers: {
//             "com.widevine.alpha": drmLicenseUrl,
//           },
//         },
//       });

//       player
//         .load(manifestUrl)
//         .then(() => console.log("Video loaded successfully!"))
//         .catch((error) => console.error("Failed to load video:", error));

//       return player;
//     };

//     let playerInstance;

//     initPlayer().then((player) => {
//       playerInstance = player;
//     });

//     return () => {
//       if (playerInstance) {
//         playerInstance.destroy();
//       }
//     };
//   }, []);

//   return (
//     <video
//       ref={videoRef}
//       controls
//       autoPlay
//       className="w-full aspect-video bg-black rounded-lg"
//     />
//   );
// };

// export default WideVinePlayer;
