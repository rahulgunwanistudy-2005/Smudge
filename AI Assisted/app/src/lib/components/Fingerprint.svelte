<script lang="ts">
 let {active=false}: {active?:boolean}=$props();
 function line(n:number){let points:string[]=[];const r=10+n*3.25;for(let i=0;i<=160;i++){const t=-.3+ i/160*(Math.PI*2-.1),warp=1+.025*Math.sin(t*5+n*.42);const x=150+Math.sin(t)*r*warp,y=177-Math.cos(t)*r*1.32+7*Math.sin(t*2+n*.12);points.push(`${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`);}return points.join(' ');}
</script>
<svg class:active class="fingerprint" viewBox="0 0 300 370" fill="none" aria-hidden="true">
 <defs><linearGradient id="ridge" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e0ffd2"/><stop offset=".4" stop-color="#9be881"/><stop offset="1" stop-color="#4e9e6d"/></linearGradient><filter id="glow"><feGaussianBlur stdDeviation="2.7"/></filter></defs>
 <g stroke="#92e774" stroke-width="4" opacity=".16" filter="url(#glow)">{#each Array(30) as _,n}<path d={line(n)}/>{/each}</g>
 <g stroke="url(#ridge)" stroke-width="1.65" stroke-linecap="round">{#each Array(30) as _,n}<path d={line(n)} opacity={.96-n*.009}/>{/each}</g>
 <g fill="#d8ffb7"><circle cx="100" cy="117" r="3"/><circle cx="188" cy="156" r="3"/><circle cx="122" cy="241" r="3"/><circle cx="206" cy="218" r="3"/></g>
 <g stroke="#c8f5b3" opacity=".5"><path d="M100 117 64 97H28 M188 156l34-30h44 M122 241l-46 29H34 M206 218l24 30h35"/><circle cx="100" cy="117" r="8"/><circle cx="188" cy="156" r="8"/></g>
</svg>
<style>.fingerprint{width:100%;height:100%;max-height:370px;filter:drop-shadow(0 0 25px #89dd6122)}.active path{stroke-dasharray:900;animation:trace 1.5s ease-in-out infinite alternate}@keyframes trace{from{stroke-dashoffset:900}to{stroke-dashoffset:0}}@media(prefers-reduced-motion:reduce){.active path{animation:none}}</style>
