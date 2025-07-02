export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#1A1818]">
      <div className="text-center">
        <div className="cube-wrapper">
          <div className="cube">
            <div className="face front"></div>
            <div className="face back"></div>
            <div className="face right"></div>
            <div className="face left"></div>
            <div className="face top"></div>
            <div className="face bottom"></div>
          </div>
        </div>
        <p className="font-satoshi text-black dark:text-white mt-4">
          Loading...
        </p>
      </div>
    </div>
  )
} 