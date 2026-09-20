import type { CSSProperties } from 'react';
import styles from './HospitalityCube.module.css';

// CSS perspective still uses the identical original atlas as the WebGL cube.
// It is available with no WebGL and no JavaScript; labels/controls stay HTML.
export default function HospitalityCubeFallback({
  angle = 0,
}: {
  angle?: number;
}) {
  return (
    <div className={styles.still} aria-hidden="true" data-cube-fallback>
      <div
        className={styles.stillCube}
        style={
          {
            '--still-turn': `${(-angle * 180) / Math.PI - 17}deg`,
          } as CSSProperties
        }
      >
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={styles.stillFace}
            style={
              {
                '--face-turn': `${index * 90}deg`,
                backgroundPosition: `${index % 2 ? 100 : 0}% ${index > 1 ? 100 : 0}%`,
              } as CSSProperties
            }
          />
        ))}
        <span className={styles.stillTop} />
      </div>
    </div>
  );
}
