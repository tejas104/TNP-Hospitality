import { useId } from 'react';

// Original vector still: the same open architectural frame and miniature
// service compositions, available before JavaScript/WebGL and on static tiers.
export default function HospitalityCubeFallback({ service = 0 }: { service?: number }) {
  const id = useId().replaceAll(':', '');
  return <svg viewBox="0 0 600 500" width="100%" height="100%" fill="none" aria-hidden="true" data-cube-fallback>
    <defs>
      <linearGradient id={`${id}-gold`} x1="150" y1="100" x2="430" y2="400" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fff2d3"/><stop offset=".45" stopColor="#bba879"/><stop offset=".7" stopColor="#eedbb5"/><stop offset="1" stopColor="#ac9161"/>
      </linearGradient>
    </defs>
    <g stroke={`url(#${id}-gold)`} strokeWidth="3.5" strokeLinejoin="round">
      <path d="m158 130 215-32 89 62-210 40Z M158 130v227l94 53 210-45V160 M252 200v210 M373 98v220l89 47 M158 357l215-39"/>
      <path d="m166 140 199-30 86 54M261 207v190l190-40" strokeWidth=".8"/>
    </g>
    <path d="m169 345 195-29 85 41-193 40Z" fill="#ead9b0" fillOpacity=".12"/>
    <g stroke="#f5dfab" strokeWidth=".7" opacity=".65"><path d="m280 233 56-27 29 48-46 35-39-56 85 21M336 206l-17 83"/></g>
    {[[280,233],[336,206],[365,254],[319,289]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="3" fill="#fff0cc"/>)}
    <g transform="translate(254 217)">
      {service === 0 && <>
        <path d="M22 108V22Q22-3 53-9Q87-14 87 8v89" stroke="#e8cca0" strokeWidth="4"/>
        <path d="M30 104V23Q30 2 54-2Q78-7 78 12v87" stroke="#fff0d1" strokeWidth="1"/>
        {[[-8,117],[99,98]].map(([x,y]) => <g key={x} transform={`translate(${x} ${y})`}>
          <path d="M0 0v28M-20 0v22M20-4v22" stroke="#bba879" strokeWidth="3"/>
          <ellipse rx="29" ry="10" fill="#eee1c7"/><path d="M0 0v-16" stroke="#bba879"/><circle cy="-20" r="8" fill="#e6c7b3"/>
          <path d="m-33 4 2 19m57-26 4 19" stroke="#edd8b0" strokeWidth="5"/>
        </g>)}
      </>}
      {service === 1 && <><path d="m61 69 75-12v50l-75 15Z" fill="#d6bf91"/><path d="m61 69 75-12-12-8-73 11Z" fill="#f6ead3"/><path d="M96 65V43l22-4v22Z" fill="#333333"/></>}
      {(service === 2 || service === 3) && <>
        {[[0,12],[88,0],[72,66]].map(([x,y], i) => <g key={i} transform={`translate(${x} ${y})`}>
          <path d="m0 0 65-11v35L0 35Z" fill="#fff5df" fillOpacity=".8" stroke="#d5bd8a"/>
          <path d="m9 9 45-8m-45 16 31-5" stroke="#454545" strokeWidth="2"/>
          <circle cx="53" cy="19" r="3" fill="#008080"/>
        </g>)}
        <path d="m38 102 82-14v7l-82 14Z M48 105v32m62-43v32" stroke="#dcc08d" strokeWidth="3"/>
      </>}
      {(service === 0 ? [[42,111],[122,120]] : service === 1 ? [[22,95],[115,105],[67,137]] : service === 2 ? [[44,112]] : [[39,103],[119,123],[1,143]]).map(([x,y],i) => <g key={i} transform={`translate(${x} ${y})`}>
        <path d="m-5 13-2 22m12-24 3 22" stroke="#303030" strokeWidth="4"/>
        <path d="m-9-3-4 18m21-19 12-9" stroke={i === 0 ? '#f4e5c8' : '#bba879'} strokeWidth="4" strokeLinecap="round"/>
        <path d="M-7-6h14l4 23h-22Z" fill={i === 0 ? '#f4e5c8' : '#bba879'}/>
        <circle cy="-15" r="6" fill="#b98565"/><path d="M-6-15q0-10 9-5" stroke="#303333" strokeWidth="4"/>
      </g>)}
    </g>
    <g fill="#fff1ca">{[0,1,2,3,4].map(i => <circle key={i} cx={272+i*37} cy={198-i*7} r="2"/>)}</g>
  </svg>;
}

