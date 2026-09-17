import styles from './Home.module.css';

export function PavilionFallback() {
  return <svg className={styles.pavilion} viewBox="0 0 600 600" fill="none" aria-hidden="true">
    <ellipse cx="300" cy="465" rx="215" ry="58" stroke="#bba879" strokeOpacity=".25" />
    <ellipse cx="300" cy="450" rx="165" ry="43" fill="#0a3d39" stroke="#bba879" strokeOpacity=".65" />
    <ellipse cx="300" cy="438" rx="146" ry="37" fill="#0e5049" stroke="#bba879" />
    {[[-110, 1], [-55, .7], [55, .7], [110, 1]].map(([offset, opacity]) => <path key={offset} d={`M${300 + offset} 435 V280 Q${300 + offset} 175 300 170`} stroke="#bba879" strokeWidth="8" opacity={opacity} />)}
    <path d="M190 435V280Q190 170 300 170Q410 170 410 280V435" stroke="#d4c499" strokeWidth="10" />
    <ellipse cx="300" cy="170" rx="126" ry="30" stroke="#ddcc9b" strokeWidth="5" />
    <circle cx="300" cy="255" r="42" fill="#c5b17e" fillOpacity=".1" stroke="#ddcc9b" />
    <path d="M275 254h50M300 230v50" stroke="#ddcc9b" strokeWidth="2" />
    <path d="M110 348Q300 540 490 348M110 348Q300 200 490 348" stroke="#bba879" strokeOpacity=".45" />
    <circle cx="110" cy="348" r="8" fill="#bba879" /><circle cx="490" cy="348" r="8" fill="#bba879" />
  </svg>;
}

export default function HomeHero() {
  return <div className={styles.heroArt}><PavilionFallback /><div className={styles.artCaption}><span>THE ART OF COMING TOGETHER</span><p>A place for every detail.</p></div></div>;
}
