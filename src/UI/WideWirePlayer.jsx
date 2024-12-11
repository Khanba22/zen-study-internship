'use client';
import React, { useEffect, useRef } from 'react';
import shaka from 'shaka-player';

const WideVinePlayer = ({ manifestUrl }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const player = new shaka.Player(videoRef.current);

    player.configure({
      drm: {
        servers: {
          'com.widevine.alpha': '/api/widevine-license', // Replace with your license server
        },
      },
    });

    player
      .load(manifestUrl)
      .then(() => console.log('Video loaded successfully!'))
      .catch((error) => console.error('Failed to load video:', error));

    return () => {
      if (player) {
        player.destroy();
      }
    };
  }, [manifestUrl]);

  return <video ref={videoRef} controls autoPlay className="w-full aspect-video bg-black" />;
};

export default WideVinePlayer;
