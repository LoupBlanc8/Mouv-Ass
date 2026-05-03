import React, { useEffect, useRef } from 'react';

export default function YouTubePlayer({ videoId, startSeconds, endSeconds }) {
  const playerRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let player;
    
    // Function to initialize player
    const initPlayer = () => {
      if (!containerRef.current) return;
      
      player = new window.YT.Player(containerRef.current, {
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          mute: 1,
          modestbranding: 1,
          rel: 0,
          start: startSeconds || undefined,
          end: endSeconds || undefined,
          playsinline: 1
        },
        events: {
          onReady: (event) => {
            event.target.mute();
            event.target.playVideo();
          },
          onStateChange: (event) => {
            // If the video ended (state = 0)
            if (event.data === window.YT.PlayerState.ENDED) {
              if (startSeconds) {
                player.seekTo(startSeconds);
              }
              player.playVideo();
            }
          }
        }
      });
      playerRef.current = player;
    };

    // If API is ready, init immediately. Else wait for global callback.
    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const previousCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };
    }

    // Interval to force loop if endSeconds is specified (sometimes ENDED event doesn't fire at endSeconds)
    let loopInterval;
    if (endSeconds && startSeconds) {
      loopInterval = setInterval(() => {
        if (player && player.getCurrentTime) {
          const currentTime = player.getCurrentTime();
          if (currentTime >= endSeconds) {
            player.seekTo(startSeconds);
            player.playVideo();
          }
        }
      }, 500);
    }

    return () => {
      if (loopInterval) clearInterval(loopInterval);
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [videoId, startSeconds, endSeconds]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }}></div>
    </div>
  );
}
