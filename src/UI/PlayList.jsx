export function Playlist({ onVideoSelect }) {
  return (
    <div className="lg:w-[400px] border-t scrollbar-hide lg:border-t-0 lg:border-l border-gray-800">
      <div className="p-4 pt-8 flex items-end justify-between border-b border-gray-800">
        <h3 className="font-semibold">UpComing Chapters</h3>
      </div>
      <div className="h-[calc(100vh-48px)] scrollbar-hide lg:h-[calc(100vh-96px)] overflow-y-auto">
        <div className="p-4 space-y-2 scrollbar-hide">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex gap-2 group hover:bg-gray-800 rounded-lg p-1 cursor-pointer"
              onClick={() => onVideoSelect(`video-id-${i}`)}
            >
              <div className="px-1 py-1 h-full flex justify-center aspect-square">
                <img
                  src="https://avatar.iran.liara.run/public/38"
                  alt="Video thumbnail"
                  className="rounded object-contain h-14 aspect-square"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium line-clamp-2">
                  Chapter {i + 1}: The Chapter Name
                </h4>
                <p className="text-sm text-gray-400">Suresh Sir</p>
                <p className="text-sm text-gray-400">4:05</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
