import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';import {readFileSync,writeFileSync} from 'node:fs';
const root=fileURLToPath(new URL('..',import.meta.url)),output=root+'/lab/results/lighthouse.json',url=process.argv[2]??'http://127.0.0.1:4318';
const result=spawnSync('npx',['--yes','lighthouse@13.5.0',url,'--chrome-flags=--headless --no-sandbox','--only-categories=performance,accessibility,best-practices','--output=json','--output-path='+output,'--quiet'],{stdio:'inherit',env:process.env});
if(result.status)process.exit(result.status);
const report=JSON.parse(readFileSync(output,'utf8'));const scores=Object.fromEntries(Object.entries(report.categories).map(([name,value])=>[name,Math.round(value.score*100)]));
writeFileSync(root+'/lab/results/lighthouse-summary.json',JSON.stringify({url,fetchTime:report.fetchTime,lighthouseVersion:report.lighthouseVersion,formFactor:report.configSettings.formFactor,scores,simulatedMobile:true,realDevice:false},null,2)+'\n');console.log(scores);
if(Object.values(scores).some(score=>score<95))process.exit(1);
