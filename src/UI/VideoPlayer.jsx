import { FastForward, FullscreenIcon, Laptop2, Pause, Play, Rewind, Volume2 } from 'lucide-react'
import WideVinePlayer from './WideWirePlayer'



export function VideoPlayer({ videoUrl, isPlaying, onPlayPause }) {
  return (
    <div className="relative aspect-video h-auto bg-gray-950">
      <WideVinePlayer manifestUrl={videoUrl} />
    </div>
  )
}

