const fs=require('fs');const [,,dl,out]=process.argv;
const parse=l=>{const o=[];let c='',q=false;for(const ch of l){if(ch=='"'){q=!q}else if(ch==','&&!q){o.push(c);c=''}else c+=ch}o.push(c);return o};
const readCsv=f=>{const t=fs.readFileSync(f,'utf8').replace(/^﻿/,'').split(/\r?\n/).filter(Boolean);const h=parse(t[0]);return t.slice(1).map(l=>{const a=parse(l);const o={};h.forEach((k,i)=>o[k]=a[i]);return o})};
const gdp={};readCsv(dl+'/owid_gdp.csv').forEach(r=>{if(r.code)gdp[r.code+'|'+r.year]=+r.ny_gdp_pcap_pp_kd});
const gdpCode={OECD:'OWID_OECD',EU27_2020:'OWID_EU27'}; // not used if missing
// OECD
const o=readCsv(dl+'/oecd_munw.csv');const M={};const names={};
for(const r of o){const y=+r.TIME_PERIOD;if(y<2000||r.OBS_VALUE==='')continue;names[r.REF_AREA]=r['Reference area'];
 const k=r.REF_AREA+'|'+y;M[k]=M[k]||{};
 if(r.MEASURE=='MUNICIPAL'&&r.UNIT_MEASURE=='KG_PS')M[k].msw=+r.OBS_VALUE;
 if(r.UNIT_MEASURE=='PT_WST_TR'&&['LANDFILL','RECYCLING','COMPOST','INCINERATION'].includes(r.MEASURE))M[k][r.MEASURE]=+r.OBS_VALUE;}
const nm={OECD:'OECD total',EU27_2020:'EU-27',KOR:'South Korea',CHN:'China',TUR:'Türkiye',SVK:'Slovakia',OECDE:'OECD Europe',OECDA:'OECD America',OECDSO:'OECD Asia Oceania'};
const r1=(v,d=1)=>v==null||isNaN(v)?'':(+v).toFixed(d);
// Canada publishes no per-person generation figure here: derive it from treated tonnage and population.
const popC={};readCsv(dl+'/owid_pop.csv').forEach(r=>{if(r.code==='CAN')popC[r.year]=+r.population_historical});
for(const r of o){if(r.REF_AREA!=='CAN'||r.MEASURE!=='TREATMENT'||r.UNIT_MEASURE!=='T'||r.OBS_VALUE==='')continue;const y=+r.TIME_PERIOD;const k='CAN|'+y;if(M[k]&&M[k].msw==null&&popC[y])M[k].msw=(+r.OBS_VALUE)*Math.pow(10,+r.UNIT_MULT)*1000/popC[y];}
// The 38 OECD member countries; the dashboard's OECD charts show only these.
const OECD38=new Set('AUS AUT BEL CAN CHL COL CRI CZE DNK EST FIN FRA DEU GRC HUN ISL IRL ISR ITA JPN KOR LVA LTU LUX MEX NLD NZL NOR POL PRT SVK SVN ESP SWE CHE TUR GBR USA'.split(' '));
const rows=[];for(const k of Object.keys(M).sort()){const [c,y]=k.split('|');const m=M[k];if(m.msw==null||m.LANDFILL==null)continue;
 if(['OECDE','OECDA','OECDSO'].includes(c))continue;
 const g=gdp[c+'|'+y];
 rows.push([c,nm[c]||names[c],y,r1(m.msw,0),r1(m.LANDFILL),r1(m.RECYCLING),r1(m.COMPOST),r1(m.INCINERATION),r1(m.msw*m.LANDFILL/100,0),g?Math.round(g):'',c=='OECD'||c=='EU27_2020'?'aggregate':'country']);}
const esc=v=>/[",]/.test(v)?'"'+String(v).replace(/"/g,'""')+'"':v;
const HEAD='iso3,country,year,msw_kg_per_capita,landfill_pct,recycling_pct,composting_pct,incineration_pct,landfill_kg_per_capita,gdp_pc_ppp,type\n';
fs.writeFileSync(out+'/oecd_all_trends.csv',HEAD+rows.map(r=>r.map(esc).join(',')).join('\n')+'\n');
const mem=rows.filter(r=>OECD38.has(r[0])||r[0]==='OECD');
console.log('members with data',new Set(mem.map(r=>r[0])).size-1,'missing',[...OECD38].filter(c=>!mem.some(r=>r[0]===c)).join(' '));
fs.writeFileSync(out+'/oecd_landfill_trends.csv',HEAD+mem.map(r=>r.map(esc).join(',')).join('\n')+'\n');
console.log('oecd rows',rows.length, 'countries',new Set(rows.map(r=>r[0])).size);
console.log(rows.filter(r=>r[0]=='ISR').map(r=>r.join(',')).join('\n'));
console.log(rows.filter(r=>r[0]=='OECD').slice(-3).map(r=>r.join(',')).join('\n'));
// What a Waste
const w=readCsv(dl+'/waw_country.csv');const reg={EAS:'East Asia & Pacific',ECS:'Europe & Central Asia',LCN:'Latin America & Caribbean',MEA:'Middle East & North Africa',NAC:'North America',SAS:'South Asia',SSF:'Sub-Saharan Africa'};
const inc={HIC:'High income',UMC:'Upper-middle income',LMC:'Lower-middle income',LIC:'Low income'};
const n=v=>v===''||v==null?null:+v;const W=[];
for(const r of w){const pop=n(r.population_population_number_of_people),msw=n(r.total_msw_total_msw_generated_tons_year);if(!pop||!msw)continue;
 const lf=['waste_treatment_controlled_landfill_percent','waste_treatment_landfill_unspecified_percent','waste_treatment_sanitary_landfill_landfill_gas_system_percent'].map(k=>n(r[k]));
 const dump=n(r.waste_treatment_open_dump_percent);const any=lf.some(v=>v!=null)||dump!=null;if(!any)continue;
 const lfs=lf.reduce((a,b)=>a+(b||0),0);
 const kg=msw*1000/pop;
 W.push([r.iso3c,r.country_name,reg[r.region_id]||r.region_id,inc[r.income_id]||r.income_id,r1(n(r.gdp),0),pop,Math.round(msw),r1(kg,0),r1(lfs),r1(dump||0),r1(n(r.waste_treatment_recycling_percent)),r1(n(r.waste_treatment_compost_percent)),r1(n(r.waste_treatment_incineration_percent)),r1(kg*(lfs+(dump||0))/100,0)]);}
fs.writeFileSync(out+'/waw_country_landfill.csv','iso3,country,region,income_group,gdp_pc_ppp,population,msw_tonnes_per_year,msw_kg_per_capita,landfill_pct,open_dump_pct,recycling_pct,composting_pct,incineration_pct,landfill_dump_kg_per_capita\n'+W.map(r=>r.map(esc).join(',')).join('\n')+'\n');
console.log('waw rows',W.length);console.log(W.filter(r=>['ISR','USA','CHN','IND'].includes(r[0])).map(r=>r.join(',')).join('\n'));
