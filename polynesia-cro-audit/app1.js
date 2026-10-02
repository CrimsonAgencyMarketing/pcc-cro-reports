const $=(s,r=document)=>r.querySelector(s);
const el=(t,a={},...kids)=>{const e=document.createElement(t);for(const k in a){if(k==='class')e.className=a[k];else if(k==='text')e.textContent=a[k];else if(k==='html')e.innerHTML=a[k];else if(k.startsWith('on'))e.addEventListener(k.slice(2),a[k]);else e.setAttribute(k,a[k]);}kids.flat().forEach(c=>{if(c!=null)e.append(c)});return e};
const fI=x=>x==null?'n/a':Math.round(x).toLocaleString('en-US');
const fU=x=>x==null?'n/a':'$'+Math.round(x).toLocaleString('en-US');
const fR=x=>x==null||!isFinite(x)?'n/a':'$'+x.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const fP=(x,d=2)=>x==null||!isFinite(x)?'n/a':(x*100).toFixed(d)+'%';
const fK=x=>x==null?'n/a':Math.abs(x)>=1e6?'$'+(x/1e6).toFixed(2)+'M':Math.abs(x)>=1e3?'$'+(x/1e3).toFixed(0)+'K':'$'+Math.round(x);
const rps=a=>a&&a[0]?a[2]/a[0]:null, cvr=a=>a&&a[0]?a[1]/a[0]:null, aov=a=>a&&a[1]?a[2]/a[1]:null;
const dlt=(a,b)=>(a==null||b==null||!b)?null:a/b-1;
function dEl(x,goodUp=true){if(x==null||!isFinite(x))return el('span',{class:'low',text:'n/a'});const up=x>=0;return el('span',{class:(up===goodUp)?'up':'down',text:(up?'▲ +':'▼ ')+(x*100).toFixed(1)+'%'});}
const PER=D.periods;
const PLAB={L30:'Last 30 days (Aug 31 to Sep 29)',L60:'Last 60 days (Aug 1 to Sep 29)',L90:'Last 90 days (Jul 2 to Sep 29)',P90:'Prior 90 days (Apr 3 to Jul 1)',Y90:'Same 90 days last year (Jul 3 to Sep 30, 2025)',Y30:'Same 30 days last year (Sep 1 to 30, 2025)'};
const YOY={L90:'Y90',L30:'Y30',P90:'YP90'};
const CH={DI:'Direct',OS:'Organic Search',PS:'Paid Search',SO:'Paid Social',PO:'Paid Other',OG:'Organic Social',RE:'Referral',AF:'Affiliates',UN:'Unassigned',EM:'Email',OT:'Other channels'};
const LG={HP:'Root path / (www homepage + package app)',PK:'/packages (www)',PD:'Package detail pages',TK:'Ticketing pages (.asp)',NS:'(not set)',BL:'Blog and guides',FQ:'FAQ and visit info',EX:'Experience pages',OF:'Offers and promos',OT:'Other pages'};
const DV={M:'Mobile',D:'Desktop',T:'Tablet'};
const state={view:'overview',period:'L90',market:'all'};
try{const s=JSON.parse(localStorage.getItem('pcc-audit')||'{}');if(s.period&&PLAB[s.period])state.period=s.period;if(s.market)state.market=s.market;}catch(e){}
const save=()=>{try{localStorage.setItem('pcc-audit',JSON.stringify({period:state.period,market:state.market}))}catch(e){}};

/* ---------- charts ---------- */
function niceTicks(min,max,n=4){if(min===max){max=min+1}const span=max-min;const step0=span/n;const mag=Math.pow(10,Math.floor(Math.log10(step0)));const norm=step0/mag;const step=(norm<1.5?1:norm<3?2:norm<7?5:10)*mag;const lo=Math.floor(min/step)*step,hi=Math.ceil(max/step)*step;const t=[];for(let v=lo;v<=hi+step*1e-9;v+=step)t.push(+v.toFixed(10));return t}
const NS='http://www.w3.org/2000/svg';
const sv=(t,a={})=>{const e=document.createElementNS(NS,t);for(const k in a)e.setAttribute(k,a[k]);return e};
function lineChart(host,cfg){
  host.innerHTML='';host.classList.add('chart');
  const series=cfg.series.filter(s=>s.pts.some(p=>p.y!=null));
  if(series.length>1){const lg=el('div',{class:'legend'});series.forEach(s=>{const sp=el('span');const b=el('b');b.style.setProperty('--c',`var(${s.color})`);if(s.dash)b.style.borderTopStyle='dashed';sp.append(b,document.createTextNode(s.name));lg.append(sp)});host.append(lg)}
  const W=Math.max(300,host.clientWidth||600),H=cfg.height||240,m={l:56,r:18,t:10,b:26};
  const labels=cfg.labels;const n=labels.length;
  let ys=[];series.forEach(s=>s.pts.forEach(p=>{if(p.y!=null&&isFinite(p.y))ys.push(p.y)}));
  let mn=Math.min(...ys),mx=Math.max(...ys);if(cfg.zero)mn=Math.min(0,mn);
  const ticks=niceTicks(mn,mx,4);const y0=ticks[0],y1=ticks[ticks.length-1];
  const X=i=>m.l+(n<=1?0:(W-m.l-m.r)*i/(n-1)),Y=v=>m.t+(H-m.t-m.b)*(1-(v-y0)/(y1-y0));
  const svg=sv('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':cfg.title||'Line chart'});
  ticks.forEach(t=>{svg.append(sv('line',{x1:m.l,x2:W-m.r,y1:Y(t),y2:Y(t),stroke:'var(--grid)','stroke-width':1}));const tx=sv('text',{x:m.l-8,y:Y(t)+4,'text-anchor':'end','font-size':11,fill:'var(--muted)'});tx.textContent=cfg.fmt(t);svg.append(tx)});
  const every=Math.ceil(n/Math.max(2,Math.floor((W-m.l-m.r)/64)));
  labels.forEach((l,i)=>{if(i%every===0||i===n-1&&(n-1)%every>every/2){const tx=sv('text',{x:X(i),y:H-8,'text-anchor':i===0?'start':i===n-1?'end':'middle','font-size':11,fill:'var(--muted)'});tx.textContent=l;svg.append(tx)}});
  series.forEach(s=>{let d='',pen=false,last=null;s.pts.forEach((p,i)=>{if(p.y==null||!isFinite(p.y)){pen=false;return}d+=(pen?'L':'M')+X(i).toFixed(1)+' '+Y(p.y).toFixed(1);pen=true;last=i});
    const path=sv('path',{d,fill:'none',stroke:`var(${s.color})`,'stroke-width':2,'stroke-linejoin':'round','stroke-linecap':'round'});if(s.dash)path.setAttribute('stroke-dasharray','5 4');svg.append(path);
    if(last!=null&&!s.dash)svg.append(sv('circle',{cx:X(last),cy:Y(s.pts[last].y),r:4,fill:`var(${s.color})`,stroke:'var(--surface)','stroke-width':2}))});
  if(cfg.marker!=null&&cfg.marker>=0){const mx2=X(cfg.marker);svg.append(sv('line',{x1:mx2,x2:mx2,y1:m.t,y2:H-m.b,stroke:'var(--axis)','stroke-width':1}));const right=mx2>W*0.6;const tx=sv('text',{x:mx2+(right?-5:5),y:m.t+10,'text-anchor':right?'end':'start','font-size':11,fill:'var(--ink2)'});tx.textContent=cfg.markerLabel||'';svg.append(tx)}
  const cross=sv('line',{y1:m.t,y2:H-m.b,stroke:'var(--axis)','stroke-width':1,visibility:'hidden'});svg.append(cross);
  const hit=sv('rect',{x:m.l,y:m.t,width:W-m.l-m.r,height:H-m.t-m.b,fill:'transparent',tabindex:0});svg.append(hit);host.append(svg);
  const tip=el('div',{class:'tip',hidden:''});host.append(tip);
  const show=i=>{cross.setAttribute('x1',X(i));cross.setAttribute('x2',X(i));cross.setAttribute('visibility','visible');tip.innerHTML='';tip.append(el('div',{class:'t',text:labels[i]}));series.forEach(s=>{const p=s.pts[i];if(!p||p.y==null)return;const r=el('div',{class:'r'});const k=el('span');const kk=el('span',{class:'k'});kk.style.setProperty('--c',`var(${s.color})`);k.append(kk,document.createTextNode(s.name));r.append(k,el('b',{text:cfg.fmt(p.y)}));tip.append(r)});tip.hidden=false;const px=X(i)/W*svg.clientWidth;const left=px>svg.clientWidth*0.6?px-tip.offsetWidth-10:px+10;tip.style.left=Math.max(0,left)+'px';tip.style.top=(svg.getBoundingClientRect().top-host.getBoundingClientRect().top+8)+'px'};
  let cur=n-1;
  hit.addEventListener('pointermove',e=>{const r=svg.getBoundingClientRect();const x=(e.clientX-r.left)/r.width*W;cur=Math.max(0,Math.min(n-1,Math.round((x-m.l)/((W-m.l-m.r)/Math.max(1,n-1)))));show(cur)});
  hit.addEventListener('pointerleave',()=>{tip.hidden=true;cross.setAttribute('visibility','hidden')});
  hit.addEventListener('focus',()=>show(cur));hit.addEventListener('blur',()=>{tip.hidden=true;cross.setAttribute('visibility','hidden')});
  hit.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){cur=Math.max(0,cur-1);show(cur);e.preventDefault()}if(e.key==='ArrowRight'){cur=Math.min(n-1,cur+1);show(cur);e.preventDefault()}});
}
function barChart(host,cfg){ /* horizontal bars, value at the tip */
  host.innerHTML='';host.classList.add('chart');
  const rows=cfg.rows;const W=Math.max(300,host.clientWidth||600);const labW=Math.min(190,Math.max(90,W*0.3)),valW=78,rowH=26,m={t:4,b:4};
  const H=m.t+m.b+rows.length*rowH;const mx=Math.max(...rows.map(r=>r.v||0),cfg.ref||0)||1;const bw=W-labW-valW-8;
  const svg=sv('svg',{viewBox:`0 0 ${W} ${H}`,role:'img','aria-label':cfg.title||'Bar chart'});
  svg.append(sv('line',{x1:labW,x2:labW,y1:m.t,y2:H-m.b,stroke:'var(--axis)','stroke-width':1}));
  const tip=el('div',{class:'tip',hidden:''});
  rows.forEach((r,i)=>{const y=m.t+i*rowH;const g=sv('g',{tabindex:0});
    const tl=sv('text',{x:labW-8,y:y+rowH/2+4,'text-anchor':'end','font-size':12,fill:'var(--ink2)'});tl.textContent=r.label.length>26?r.label.slice(0,25)+'…':r.label;g.append(tl);
    const w=Math.max(1,(r.v||0)/mx*bw);const h=14,by=y+(rowH-h)/2;
    g.append(sv('path',{d:`M${labW} ${by}h${Math.max(0,w-4)}a4 4 0 0 1 4 4v${h-8}a4 4 0 0 1 -4 4h-${Math.max(0,w-4)}z`,fill:`var(${r.color||cfg.color||'--s1'})`}));
    const tv=sv('text',{x:labW+w+6,y:y+rowH/2+4,'font-size':12,fill:'var(--ink)','font-weight':600});tv.textContent=cfg.fmt(r.v);g.append(tv);
    const hr=sv('rect',{x:0,y,width:W,height:rowH,fill:'transparent'});g.append(hr);
    const show=()=>{tip.innerHTML='';tip.append(el('div',{class:'t',text:r.label}));(r.tip||[]).forEach(t=>{const d=el('div',{class:'r'});d.append(el('span',{text:t[0]}),el('b',{text:t[1]}));tip.append(d)});tip.hidden=false;tip.style.left=Math.min(labW+10,Math.max(0,(svg.clientWidth||W)-tip.offsetWidth))+'px';tip.style.top=((y+rowH)/H*svg.clientHeight+4)+'px'};
    g.addEventListener('pointerenter',show);g.addEventListener('focus',show);g.addEventListener('pointerleave',()=>tip.hidden=true);g.addEventListener('blur',()=>tip.hidden=true);
    svg.append(g)});
  if(cfg.ref){const x=labW+cfg.ref/mx*bw;svg.append(sv('line',{x1:x,x2:x,y1:m.t,y2:H-m.b,stroke:'var(--ink2)','stroke-width':1}));}
  host.append(svg,tip);
  if(cfg.ref)host.append(el('div',{class:'note',text:'Vertical line: '+cfg.refLabel+' ('+cfg.fmt(cfg.ref)+')'}));
}
/* ---------- table ---------- */
function table(host,cols,rows,opt={}){
  host.innerHTML='';const wrap=el('div',{class:'tblwrap'});const t=el('table');const th=el('thead');const hr=el('tr');let sort=opt.sort!=null?opt.sort:null,dir=opt.dir||-1;
  const body=el('tbody');
  const draw=()=>{body.innerHTML='';let rs=rows.slice();if(sort!=null){const c=cols[sort];rs.sort((a,b)=>{const x=c.val(a),y=c.val(b);if(x==null&&y==null)return 0;if(x==null)return 1;if(y==null)return -1;return (typeof x==='string'?x.localeCompare(y):x-y)*dir})}
    rs.forEach(r=>{const tr=el('tr');if(opt.onRow){tr.className='click';tr.tabIndex=0;tr.addEventListener('click',()=>opt.onRow(r));tr.addEventListener('keydown',e=>{if(e.key==='Enter')opt.onRow(r)})}cols.forEach(c=>{const td=el('td');if(c.txt)td.className='txt';const v=c.cell?c.cell(r):(c.fmt?c.fmt(c.val(r)):c.val(r));if(v instanceof Node)td.append(v);else td.textContent=v==null?'n/a':v;if(opt.low&&opt.low(r))td.classList.add('low');tr.append(td)});body.append(tr)});
    Array.from(hr.children).forEach((h,i)=>{if(i===sort)h.setAttribute('aria-sort',dir<0?'descending':'ascending');else h.removeAttribute('aria-sort')})};
  cols.forEach((c,i)=>{const h=el('th',{text:c.label,tabindex:0,title:c.title||'Sort'});if(c.txt)h.className='txt';const go=()=>{if(sort===i)dir=-dir;else{sort=i;dir=c.str?1:-1}draw()};h.addEventListener('click',go);h.addEventListener('keydown',e=>{if(e.key==='Enter')go()});hr.append(h)});
  th.append(hr);t.append(th,body);wrap.append(t);host.append(wrap);draw();
}
const sel=(id,opts,val,on)=>{const s=el('select',{id});opts.forEach(o=>{const op=el('option',{value:o[0],text:o[1]});if(o[0]===val)op.selected=true;s.append(op)});s.addEventListener('change',()=>on(s.value));return s};
const lab=(t,c)=>el('label',{},t,c);
const card=(title,...kids)=>el('div',{class:'card'},title?el('h2',{text:title}):null,...kids);

/* ---------- data helpers ---------- */
function tot(p,market){if(market==='us'){const t=D.us_totals[p];return t?[t.s,t.p,t.r]:null}const t=D.totals[p];return t?[t.s,t.p,t.r]:null}
function monthLabel(ym){const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return mo[+ym.slice(4,6)-1]+' '+ym.slice(2,4)}
function wkLabel(w){const mo=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];return mo[+w.slice(4,6)-1]+' '+(+w.slice(6,8))}
const METRICS={rps:['Revenue per session',r=>r[3]/r[1],fR],cvr:['Purchase conversion rate',r=>r[2]/r[1],x=>fP(x,2)],aov:['Average order value',r=>r[2]?r[3]/r[2]:null,fU],s:['Sessions',r=>r[1],fI],p:['Purchases',r=>r[2],fI],r:['Revenue',r=>r[3],fK]};

/* ---------- views ---------- */
const V={};
V.overview=host=>{
  const p=state.period,mk=state.market;const t=tot(p,mk);const y=YOY[p]&&(mk==='us'&&YOY[p]==='YP90'?null:tot(YOY[p],mk));const pr=p==='L90'?tot('P90',mk):null;
  const sum=el('div',{class:'card'},el('h2',{text:'Executive summary'}),el('div',{class:'prose',html:`<ol>
  <li><b>Baseline.</b> Last 90 days: 693,568 sessions, 15,342 purchases, $8,362,061 revenue, RPS $12.06. That is 12% below the same 90 days last year ($13.76) and 32% below the prior 90 days ($17.80, spring is seasonally stronger).</li>
  <li><b>Most of the year over year drop is traffic mix and measurement, not the site.</b> US purchases are flat (13,652 vs 13,665). International sessions grew from 70,434 to 175,410 while purchases fell from 2,578 to 1,583. Paid Social sent 69,955 sessions from Japan and 9,885 from South Korea with zero purchases.</li>
  <li><b>The package app launch is the real inflection.</b> It rolled out from late May to mid June 2026 on five subdomains. Since then US paid search and organic conversion runs 16% to 32% below the seasonal pattern of last year. In the last 30 days US desktop paid search converted at 5.79% vs 7.04% a year earlier.</li>
  <li><b>Mobile is 68% of sessions and 45% of revenue.</b> US mobile RPS is $10.35 vs $25.16 on desktop. Two steps carry measurable mobile gaps: place order to purchase (81.8% vs 91.5%) and add to order to checkout (26.9% vs 37.6%).</li>
  <li><b>One defect is verified on the live site.</b> Returning visitors whose saved visit date has passed see every package as Fully Booked.</li>
  <li><b>Day of week is not a problem.</b> Sunday is consistently the strongest day. No weekday is persistently weak.</li>
  </ol><p class="note">Six opportunities are listed in the Opportunities tab. None is rated Strong: each has a named alternative explanation that still needs to be ruled out.</p>`}));
  const k=el('div',{class:'kpis'});
  const mkK=(label,val,d1,d2,hero)=>{const e=el('div',{class:'kpi'+(hero?' hero':'')},el('div',{class:'lab',text:label}),el('div',{class:'val',text:val}));if(d1)e.append(el('div',{class:'dl'},d1[1],' vs last year'));if(d2)e.append(el('div',{class:'dl'},d2[1],' vs prior 90 days'));return e};
  const mk2=(f,good=true)=>[y?[0,dEl(dlt(f(t),f(y)),good)]:null,pr?[0,dEl(dlt(f(t),f(pr)),good)]:null];
  if(t){k.append(mkK('Revenue per session',fR(rps(t)),...mk2(rps),true),mkK('Sessions',fI(t[0]),...mk2(a=>a[0])),mkK('Purchases',fI(t[1]),...mk2(a=>a[1])),mkK('Revenue',fU(t[2]),...mk2(a=>a[2])),mkK('Conversion rate',fP(cvr(t)),...mk2(cvr)),mkK('Average order value',fU(aov(t)),...mk2(aov)))}
  const tr=el('div');const src=mk==='us'?D.ym_us:D.ym_all;
  const c1=card('Monthly RPS, Jan 2024 to Sep 2026'+(mk==='us'?' (US only)':' (all traffic)'),el('p',{class:'note',text:'Sep 2026 covers Sep 1 to 29. Mar 2026 is distorted by a tracking gap (see Data quality).'}),tr);
  const mkt=el('div');const rows=D.market.filter(r=>r.period===(['L30','L90','P90','Y90'].includes(p)?p:'L90'));
  const c2=card('Market split, '+(['L30','L90','P90','Y90'].includes(p)?PER[p].label:'Last 90 days'),el('p',{class:'note',text:'Suspect traffic = Singapore, Switzerland, Austria, Vietnam, China and country (not set). Session sums differ slightly from totals because GA4 estimates sessions.'}),mkt);
  host.append(k,sum,el('div',{class:'grid2'},c1,c2));
  lineChart(tr,{labels:src.map(r=>monthLabel(r[0])),fmt:fR,series:[{name:'RPS',color:'--s1',pts:src.map(r=>({y:r[3]/r[1]}))}],marker:src.findIndex(r=>r[0]==='202606'),markerLabel:'Package app live'});
  table(mkt,[{label:'Market',val:r=>r.market,str:1},{label:'Sessions',val:r=>r.sessions,fmt:fI},{label:'Purchases',val:r=>r.purchases,fmt:fI},{label:'Revenue',val:r=>r.revenue,fmt:fU},{label:'Conv. rate',val:r=>r.purchases/r.sessions,fmt:x=>fP(x)},{label:'RPS',val:r=>r.revenue/r.sessions,fmt:fR}],rows);
};
V.trend=host=>{
  const st=V.trend.st||(V.trend.st={dim:'ch',metric:'rps',wk:'U'});
  const fl=el('div',{class:'filters'},lab('Metric',sel('t-metric',Object.entries(METRICS).map(([k,v])=>[k,v[0]]),st.metric,v=>{st.metric=v;render()})),lab('Break down by',sel('t-dim',[['ch','Channel'],['dev','Device'],['lp','Landing page group'],['all','Overall, 33 months']],st.dim,v=>{st.dim=v;st.pick=null;render()})));
  const pickRow=el('div',{class:'filters'});const ch=el('div');const tb=el('div');const wkc=el('div');
  const c1=card('Monthly trend',fl,pickRow,ch,el('details',{},el('summary',{text:'Table view'}),tb));
  const fl2=el('div',{class:'filters'},lab('Weekly series (US only)',sel('t-wk',[['U','All channels'],['P','Paid Search']],st.wk,v=>{st.wk=v;render()})));
  const c2=card('Weekly trend, Apr 13 to Sep 27, this year vs last year',fl2,el('p',{class:'note',text:'Weeks start Monday. Last year is shifted 364 days so weekdays align. The week of Aug 11, 2025 contains a referral spike of low quality desktop sessions.'}),wkc);
  host.append(c1,c2);
  function render(){
    const M=METRICS[st.metric];pickRow.innerHTML='';let series=[],labels=[];
    const cols=['--s1','--s2','--s3','--s4'];
    if(st.dim==='all'){labels=D.ym_all.map(r=>monthLabel(r[0]));series=[{name:'All traffic',color:'--s1',pts:D.ym_all.map(r=>({y:M[1](r)}))},{name:'US only',color:'--s2',pts:D.ym_us.map(r=>({y:M[1](r)}))}]}
    else{const src=st.dim==='ch'?D.m_ch:st.dim==='dev'?D.m_dev:D.m_lp;const names=st.dim==='ch'?CH:st.dim==='dev'?DV:LG;const keys=Object.keys(src);
      const def=st.dim==='ch'?['PS','DI','OS']:st.dim==='dev'?['M','D','T']:['HP','PK','TK'];st.pick=st.pick||def;
      if(st.dim!=='dev'){for(let i=0;i<Math.min(4,keys.length);i++){const opts=[['','None']].concat(keys.map(k=>[k,names[k]]));pickRow.append(lab('Series '+(i+1),sel('t-pick'+i,opts,st.pick[i]||'',v=>{st.pick[i]=v;render()})))}}
      const picks=st.pick.filter(Boolean);labels=src[keys[0]].map(r=>monthLabel(r[0]));series=picks.map((k,i)=>({name:names[k],color:cols[i],pts:src[k].map(r=>({y:M[1](r)}))}))}
    lineChart(ch,{labels,fmt:M[2],series,title:M[0],zero:['s','p','r'].includes(st.metric)});
    const rows=labels.map((l,i)=>({l,v:series.map(s=>s.pts[i].y)}));
    table(tb,[{label:'Month',val:r=>r.l,str:1}].concat(series.map((s,i)=>({label:s.name,val:r=>r.v[i],fmt:M[2]}))),rows);
    const d=st.wk==='U'?'UD':'PD',mo=st.wk==='U'?'UM':'PM';const ty=k=>D.wk[k].filter(r=>r[0].startsWith('2026')),ly=k=>D.wk[k].filter(r=>r[0].startsWith('2025'));
    lineChart(wkc,{labels:ty(d).map(r=>wkLabel(r[0])),fmt:M[2],zero:['s','p','r'].includes(st.metric),series:[{name:'Desktop 2026',color:'--s1',pts:ty(d).map(r=>({y:M[1](r)}))},{name:'Desktop 2025',color:'--s1',dash:1,pts:ly(d).map(r=>({y:M[1](r)}))},{name:'Mobile 2026',color:'--s2',pts:ty(mo).map(r=>({y:M[1](r)}))},{name:'Mobile 2025',color:'--s2',dash:1,pts:ly(mo).map(r=>({y:M[1](r)}))}],marker:5,markerLabel:'App rollout starts'});
  }
  render();
};
function periodCols(get,p){const y=YOY[p]==='YP90'?null:YOY[p];const cols=[{label:'Sessions',val:r=>get(r,p)&&get(r,p)[0],fmt:fI},{label:'Purchases',val:r=>get(r,p)&&get(r,p)[1],fmt:fI},{label:'Revenue',val:r=>get(r,p)&&get(r,p)[2],fmt:fU},{label:'Conv. rate',val:r=>cvr(get(r,p)),fmt:x=>fP(x)},{label:'AOV',val:r=>aov(get(r,p)),fmt:fU},{label:'RPS',val:r=>rps(get(r,p)),fmt:fR}];
  if(y)cols.push({label:'RPS last year',val:r=>rps(get(r,y)),fmt:fR},{label:'RPS YoY',val:r=>dlt(rps(get(r,p)),rps(get(r,y))),cell:r=>dEl(dlt(rps(get(r,p)),rps(get(r,y))))});
  if(p==='L90')cols.push({label:'RPS vs prior 90',val:r=>dlt(rps(get(r,p)),rps(get(r,'P90'))),cell:r=>dEl(dlt(rps(get(r,p)),rps(get(r,'P90'))))});
  return cols}
