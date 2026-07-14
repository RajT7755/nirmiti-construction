import "./motionShine.css";

/** Animated shine blobs — pass className on parent for blob colours */
export function MotionShineLayer({ showNoise = true }: { showNoise?: boolean }) {
  return (
    <div className="motion-shine-layer" aria-hidden>
      <div className="shapes-wrapper">
        <div className="motion-shine-blob motion-shine-blob--a" />
        <div className="motion-shine-blob motion-shine-blob--b" />
        <div className="motion-shine-blob motion-shine-blob--c" />
      </div>
      {showNoise && <div className="motion-shine-noise" />}
    </div>
  );
}