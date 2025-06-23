"use client"

interface OrangeLoadingCubeProps {
  transitionState: 'entering' | 'visible' | 'exiting';
}

export default function OrangeLoadingCube({ transitionState }: OrangeLoadingCubeProps) {
  return (
    <div className={`cube-wrapper ${transitionState}`}>
      <div className="cube">
        <div className="face front" />
        <div className="face back" />
        <div className="face right" />
        <div className="face left" />
        <div className="face top" />
        <div className="face bottom" />
      </div>
    </div>
  )
}
