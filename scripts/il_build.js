const fs=require('fs');const [,,inp,out]=process.argv;
const R=JSON.parse(fs.readFileSync(inp,'utf8')).result.records;
// ITM (EPSG:2039) -> lat/lon on GRS80 (datum shift ignored, < 1 m vs WGS84 for ITM/IG05)
function itm2ll(E,N){const a=6378137,f=1/298.257222101,k0=1.0000067,lat0=31.7343936111111*Math.PI/180,lon0=35.2045169444444*Math.PI/180,FE=219529.584,FN=626907.39;
 const e2=f*(2-f),ep2=e2/(1-e2);const M=p=>a*((1-e2/4-3*e2*e2/64-5*e2**3/256)*p-(3*e2/8+3*e2*e2/32+45*e2**3/1024)*Math.sin(2*p)+(15*e2*e2/256+45*e2**3/1024)*Math.sin(4*p)-(35*e2**3/3072)*Math.sin(6*p));
 const M1=M(lat0)+(N-FN)/k0;const mu=M1/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256));const e1=(1-Math.sqrt(1-e2))/(1+Math.sqrt(1-e2));
 const p1=mu+(3*e1/2-27*e1**3/32)*Math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*Math.sin(4*mu)+(151*e1**3/96)*Math.sin(6*mu)+(1097*e1**4/512)*Math.sin(8*mu);
 const C1=ep2*Math.cos(p1)**2,T1=Math.tan(p1)**2,N1=a/Math.sqrt(1-e2*Math.sin(p1)**2),R1=a*(1-e2)/(1-e2*Math.sin(p1)**2)**1.5,D=(E-FE)/(N1*k0);
 const lat=p1-(N1*Math.tan(p1)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*D**4/24+(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*D**6/720);
 const lon=lon0+(D-(1+2*T1+C1)*D**3/6+(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*D**5/120)/Math.cos(p1);return [lat*180/Math.PI,lon*180/Math.PI];}
const EN={44249:'Te\'enim',44282:'Naser Recycling',78267:'Dia',87467:'Talia',103466:'Nimra',104346:'Ganei Hadas',108089:'Zohar',111148:'Haruvit',151740:'Bareket',153437:'Qalansawe',155210:'Ashalim',156394:'Evron',157480:'Lohamei HaGeta\'ot',166191:'Dudaim (old site)',169225:'Tut (Shfeya)',169738:'Yarka',171368:'Yeruham',177185:'Gush Halav quarry',177643:'Mitzpe Ramon',179003:'Roman Road',182965:'Tur\'an',183821:'Neot Hovav dry waste',185199:'Green Recycling',186886:'Efeh',188787:'Eichut Yeruka',192143:'Ori-Yair',241743:'Sapir dry waste',241779:'Tel Adashim',259245:'Avivit',279050:'Dimona',353611:'Dudaim (new dry-waste site)',366508:'Dudaim (new mixed-waste site)',376389:'Neot Hovav (Talor Karadi)'};
const COMPLEX={166191:'Dudaim',353611:'Dudaim',366508:'Dudaim'};
const DIST={'צפון':'North','חיפה':'Haifa','מרכז':'Central','תל אביב':'Tel Aviv','ירושלים':'Jerusalem','דרום':'South','יהודה ושומרון':'Judea and Samaria'};
const m=R.filter(r=>['מתאן','מתאן-'].includes((r.MezahemBeplitaHeb||'').trim())&&r.SugPlita==='אוויר');
const seen=new Set();const rows=[];const missing=new Set();
for(const r of m){const id=+r.MisparAtarSvivati,y=+r.ShnatDivuach;const key=id+'-'+y;if(seen.has(key))continue;seen.add(key);
 if(!EN[id])missing.add(id+' '+r.ShemAtarSvivatiMenifa);
 const [lat,lon]=itm2ll(+r.NekudatTsiunXAtarSvivatiMenifa,+r.NekudatTsiunYAtarSvivatiMenifa);
 const raw=(r.KamutPlita||'').replace(/,/g,'');const below=!/^\d+(\.\d+)?$/.test(raw);
 const he=r.ShemAtarSvivatiMenifa.trim().replace(/\s+/g,' ');
 rows.push({site_id:id,site:EN[id]||he,site_he:he,complex:COMPLEX[id]||EN[id]||he,type:/יבשה/.test(he)?'Dry and construction waste':'Mixed waste',district:DIST[(r.MachozAtarSvivati||'').trim()]||r.MachozAtarSvivati,municipality:(r.RashutMekomitAtarSvivati||'').trim(),lat:lat.toFixed(4),lon:lon.toFixed(4),year:y,methane_t:below?'':(+raw/1000).toFixed(1),below_threshold:below?1:0,method:(r.ShahamPlita||'').trim()});}
rows.sort((a,b)=>a.site_id-b.site_id||a.year-b.year);
const cols=Object.keys(rows[0]);const esc=v=>/[",\n]/.test(String(v))?'"'+String(v).replace(/"/g,'""')+'"':v;
fs.writeFileSync(out,cols.join(',')+'\n'+rows.map(r=>cols.map(c=>esc(r[c])).join(',')).join('\n')+'\n');
console.log('rows',rows.length,'missing names',[...missing]);console.log([...new Set(rows.map(r=>r.district))]);
const tot={};rows.forEach(r=>{if(r.methane_t)tot[r.year]=(tot[r.year]||0)+ +r.methane_t});console.log(tot);
console.log(rows.filter(r=>r.site_id===186886&&r.year===2025),rows.filter(r=>r.site_id===103466).slice(0,1).map(r=>r.lat+','+r.lon));
