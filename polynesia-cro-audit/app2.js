V.channels=host=>{
  const p=state.period;const st=V.channels.st||(V.channels.st={dev:'all'});
  const bc=el('div'),tb=el('div'),tb2=el('div');
  const site=rps(tot(p,'all'));
  host.append(el('p',{class:'flag',text:'Channel uses the property primary channel group (Polynesia Channel Group). Channel tables are all traffic. Paid Social is mostly Japan and South Korea prospecting with no purchases, so its RPS says little about the site.'}),
    el('div',{class:'grid2'},card('RPS by channel, '+PER[p].label,el('p',{class:'note',text:'Channels with at least 2,000 sessions in the period.'}),bc),card('Channel by device',el('div',{class:'filters'},lab('Device',sel('c-dev',[['all','Mobile and desktop'],['mobile','Mobile'],['desktop','Desktop']],st.dev,v=>{st.dev=v;V.channels.st=st;show('channels')})),lab('Market',sel('c-mk',[['all','All traffic'],['us','US only (5 main channels)']],st.mk||'all',v=>{st.mk=v;show('channels')}))),tb2)),
    card('All channels, '+PER[p].label,tb));
  const rows=D.channel.filter(r=>r[p]);
  barChart(bc,{fmt:fR,ref:site,refLabel:'site RPS',rows:rows.filter(r=>r[p][0]>=2000).sort((a,b)=>rps(b[p])-rps(a[p])).map(r=>({label:r.k,v:rps(r[p]),tip:[['Sessions',fI(r[p][0])],['Purchases',fI(r[p][1])],['Revenue',fU(r[p][2])],['Conv. rate',fP(cvr(r[p]))]]}))});
  table(tb,[{label:'Channel',val:r=>r.k,str:1}].concat(periodCols((r,q)=>r[q],p)),rows,{sort:1,low:r=>r[p][0]<2000});
  const src=(st.mk==='us'?D.us_chdev:D.chdev);const pp=src[0][p]?p:'L90';
  const r2=src.filter(r=>st.dev==='all'||r.k.endsWith('>'+st.dev));
  table(tb2,[{label:'Channel and device ('+PER[pp].label+')',val:r=>r.k.replace('>',' · '),str:1},{label:'Sessions',val:r=>r[pp][0],fmt:fI},{label:'Purchases',val:r=>r[pp][1],fmt:fI},{label:'Conv. rate',val:r=>cvr(r[pp]),fmt:x=>fP(x)},{label:'RPS',val:r=>rps(r[pp]),fmt:fR},{label:'RPS last year',val:r=>rps(r[pp==='L30'&&r.Y30?'Y30':'Y90']),fmt:fR},{label:'RPS prior 90',val:r=>rps(r.P90),fmt:fR}],r2,{sort:1,low:r=>r[pp][1]<30});
  if(pp!==p)tb2.append(el('p',{class:'note',text:'This breakdown is available for Last 30 days, Last 90 days, Prior 90 days and last year. Showing Last 90 days.'}));
  else if(pp==='L30'&&st.mk!=='us')tb2.append(el('p',{class:'note',text:'RPS last year column shows the same 90 days last year for all traffic rows.'}));
};
V.devices=host=>{
  const p=state.period,mk=state.market;const src=mk==='us'?D.us_device:D.device;const rows=src.filter(r=>r.k!=='smart tv');
  const st=V.devices.st||(V.devices.st={f:'L30 ALL'});
  const bc=el('div'),tb=el('div'),fn=el('div');
  host.append(el('div',{class:'grid2'},card('RPS by device, '+PER[p].label+(mk==='us'?' (US only)':' (all traffic)'),bc,tb),
   card('Checkout funnel by device (US only, sessions that fired each event)',el('div',{class:'filters'},lab('Period and channel',sel('d-f',[['L30 ALL','Last 30 days, all channels'],['L30 Paid Search','Last 30 days, Paid Search'],['L90 ALL','Last 90 days, all channels'],['L90 Paid Search','Last 90 days, Paid Search']],st.f,v=>{st.f=v;show('devices')}))),fn,el('p',{class:'note',text:'The rate under each count uses the base named under the step. Date picker, add to cart and sold out events fire only on the package app. Cart, checkout, payment, place order and purchase fire on ticketing.polynesia.com. July add to cart counts are inflated by a tagging change, so Last 30 days is the cleaner read.'}))));
  barChart(bc,{fmt:fR,rows:rows.map((r,i)=>({label:r.k[0].toUpperCase()+r.k.slice(1),v:rps(r[p]),color:{mobile:'--s2',desktop:'--s1',tablet:'--s3'}[r.k],tip:[['Sessions',fI(r[p][0])],['Purchases',fI(r[p][1])],['Revenue',fU(r[p][2])]]}))});
  const T=rows.reduce((a,r)=>[a[0]+r[p][0],a[1]+r[p][1],a[2]+r[p][2]],[0,0,0]);
  table(tb,[{label:'Device',val:r=>r.k,str:1},{label:'Share of sessions',val:r=>r[p][0]/T[0],fmt:x=>fP(x,1)},{label:'Share of revenue',val:r=>r[p][2]/T[2],fmt:x=>fP(x,1)}].concat(periodCols((r,q)=>r[q],p)),rows);
  const m=D.us_funnel.find(r=>r.seg===st.f+'>mobile'),d=D.us_funnel.find(r=>r.seg===st.f+'>desktop');
  const steps=[['session_start','Sessions',null,''],['modal_open','Opened date picker or dialog','session_start','of sessions'],['date_select','Picked a date','modal_open','of sessions that opened it'],['add_to_cart','Added to order','session_start','of sessions'],['begin_checkout','Began checkout','add_to_cart','of add to order sessions'],['add_payment_info','Chose payment','begin_checkout','of checkout sessions'],['place_order','Clicked place order','add_payment_info','of payment sessions'],['purchase','Purchased','place_order','of place order sessions']];
  const g=el('div',{class:'steps'});['Step','Mobile','Desktop','Gap'].forEach(h=>g.append(el('div',{class:'h',text:h})));
  steps.forEach((s,i)=>{const pm=s[2]?m[s[0]]/m[s[2]]:1,pd=s[2]?d[s[0]]/d[s[2]]:1;const cell=(v,r,c)=>{const b=el('div',{class:'bar'});b.style.setProperty('--c',`var(${c})`);b.style.width=Math.min(100,r*100)+'%';return el('div',{class:'barcell'},el('span',{text:fI(v)+(s[2]?'  ('+fP(r,1)+')':'')}),b)};
    g.append(el('div',{},s[1],s[3]?el('div',{class:'note',text:s[3]}):null),cell(m[s[0]],pm,'--s2'),cell(d[s[0]],pd,'--s1'),el('div',{text:s[2]?((pm-pd)*100).toFixed(1)+' pts':''}))});
  fn.append(g);
};
V.pages=host=>{
  const p=state.period;const st=V.pages.st||(V.pages.st={g:'',min:1000});
  const grp=k=>k==='/'?'HP':k==='/packages'?'PK':k.startsWith('/packages/')?'PD':/\.asp$/i.test(k)?'TK':k==='(not set)'?'NS':k.startsWith('/blog')?'BL':(k.startsWith('/faq')||k==='/know-before-you-go')?'FQ':['/win-a-dream-trip-to-hawaii','/residents'].includes(k)?'OF':['/dining','/villages','/ha-show','/hukilau-lunch-buffet','/best-hawaii-luau'].includes(k)?'EX':'OT';
  const tb=el('div'),tg=el('div'),th=el('div');
  const fl=el('div',{class:'filters'},lab('Landing page group',sel('p-g',[['','All groups']].concat(Object.entries(LG)),st.g,v=>{st.g=v;show('pages')})),lab('Minimum sessions',sel('p-min',[['0','0'],['1000','1,000'],['3000','3,000'],['10000','10,000']],String(st.min),v=>{st.min=+v;show('pages')})));
  host.append(el('p',{class:'flag',text:'Landing page is a path without hostname. The root path / mixes the www homepage with the root of the five package app subdomains, and GA cannot split revenue between them because purchases happen on ticketing.polynesia.com.'}),
   card('Top landing pages, '+PER[p].label+' (all traffic)',fl,tb),
   el('div',{class:'grid2'},card('Landing page groups by channel and device ('+(['L30','L90','P90','Y90'].includes(p)?PER[p].label:'Last 90 days')+')',el('p',{class:'note',text:'Built from segments with at least 500 sessions in the last 90 days (97% of sessions).'}),tg),
   card('Package app variants and hosts, last 30 days (sessions that fired each event)',el('p',{class:'note',text:'Five subdomains serve the package app. They do not send the same events: pack sends no add to cart, and only package and pkg send purchase redirect. Compare variants on step rates only after tagging is aligned.'}),th)));
  const rows=D.lp.filter(r=>(!st.g||grp(r.k)===st.g)&&r[p][0]>=st.min);
  table(tb,[{label:'Landing page',val:r=>r.k,str:1},{label:'Group',val:r=>LG[grp(r.k)].split(' (')[0],str:1}].concat(periodCols((r,q)=>r[q],p)),rows,{sort:2,low:r=>r[p][1]<30});
  const pi={L90:3,P90:6,Y90:9,L30:12}[p]||3;const agg={};D.seg.forEach(r=>{const a=agg[r[2]]||(agg[r[2]]={k:r[2],c:[0,0,0],y:[0,0,0],pr:[0,0,0]});for(let i=0;i<3;i++){a.c[i]+=r[pi+i];a.y[i]+=r[9+i];a.pr[i]+=r[6+i]}});
  table(tg,[{label:'Group',val:r=>LG[r.k],str:1},{label:'Sessions',val:r=>r.c[0],fmt:fI},{label:'Purchases',val:r=>r.c[1],fmt:fI},{label:'Revenue',val:r=>r.c[2],fmt:fU},{label:'Conv. rate',val:r=>cvr(r.c),fmt:x=>fP(x)},{label:'RPS',val:r=>rps(r.c),fmt:fR},{label:'RPS last year',val:r=>rps(r.y),fmt:fR},{label:'RPS prior 90',val:r=>rps(r.pr),fmt:fR}],Object.values(agg),{sort:1});
  table(th,[{label:'Host',val:r=>r.host,str:1},{label:'Device',val:r=>r.device,str:1},{label:'Page view sessions',val:r=>r.page_view,fmt:fI},{label:'Date picker',val:r=>r.modal_open,fmt:fI},{label:'Date picked',val:r=>r.date_select,fmt:fI},{label:'Add to cart',val:r=>r.add_to_cart,fmt:fI},{label:'Sold out view',val:r=>r.sold_out_view,fmt:fI},{label:'Availability error',val:r=>r.availability_fetch_error,fmt:fI},{label:'Begin checkout',val:r=>r.begin_checkout,fmt:fI},{label:'Purchase',val:r=>r.purchase,fmt:fI}],D.host);
};
V.segments=host=>{
  const st=V.segments.st||(V.segments.st={ch:'',dv:'',lg:'',min:500,p:['L30','L90','P90','Y90'].includes(state.period)?state.period:'L90'});
  if(['L30','L90','P90','Y90'].includes(state.period))st.p=state.period;
  const pi={L90:3,P90:6,Y90:9,L30:12}[st.p];const tb=el('div');const site=rps(tot(st.p,'all'));
  const re=v=>{V.segments.st=st;show('segments')};
  const fl=el('div',{class:'filters'},lab('Channel',sel('s-ch',[['','All channels']].concat(Object.entries(CH)),st.ch,v=>{st.ch=v;re()})),lab('Device',sel('s-dv',[['','All devices']].concat(Object.entries(DV)),st.dv,v=>{st.dv=v;re()})),lab('Landing page group',sel('s-lg',[['','All groups']].concat(Object.entries(LG)),st.lg,v=>{st.lg=v;re()})),lab('Minimum sessions',sel('s-min',[['0','0'],['500','500'],['2000','2,000'],['5000','5,000']],String(st.min),v=>{st.min=+v;re()})));
  const rows=D.seg.filter(r=>(!st.ch||r[0]===st.ch)&&(!st.dv||r[1]===st.dv)&&(!st.lg||r[2]===st.lg)&&r[pi]>=st.min);
  const g=(r,i)=>[r[i],r[i+1],r[i+2]];
  const T=rows.reduce((a,r)=>[a[0]+r[pi],a[1]+r[pi+1],a[2]+r[pi+2]],[0,0,0]);
  host.append(card('Channel to device to landing page group, '+PER[st.p].label+' (all traffic)',fl,el('p',{class:'note',text:`${rows.length} segments shown: ${fI(T[0])} sessions, ${fI(T[1])} purchases, ${fU(T[2])} revenue, RPS ${fR(rps(T))}. Site RPS for the period is ${fR(site)}. Rows with fewer than 30 purchases are grayed: treat their rates as low volume. Only segments with at least 500 sessions in the last 90 days are included. Exposure = sessions x (site RPS minus segment RPS), shown only where the segment is below site RPS. It is context, not recoverable revenue.`}),tb));
  table(tb,[{label:'Channel',val:r=>CH[r[0]],str:1},{label:'Device',val:r=>DV[r[1]],str:1},{label:'Landing page group',val:r=>LG[r[2]].split(' (')[0],str:1},{label:'Sessions',val:r=>r[pi],fmt:fI},{label:'Purchases',val:r=>r[pi+1],fmt:fI},{label:'Revenue',val:r=>r[pi+2],fmt:fU},{label:'Conv. rate',val:r=>cvr(g(r,pi)),fmt:x=>fP(x)},{label:'RPS',val:r=>rps(g(r,pi)),fmt:fR},{label:'RPS vs site',val:r=>dlt(rps(g(r,pi)),site),cell:r=>dEl(dlt(rps(g(r,pi)),site))},{label:'RPS prior 90',val:r=>rps(g(r,6)),fmt:fR},{label:'RPS last year',val:r=>rps(g(r,9)),fmt:fR},{label:'RPS YoY',val:r=>dlt(rps(g(r,3)),rps(g(r,9))),cell:r=>dEl(dlt(rps(g(r,3)),rps(g(r,9))))},{label:'Exposure vs site RPS',val:r=>{const x=(site-rps(g(r,pi)))*r[pi];return x>0?x:null},fmt:x=>x==null?'':fU(x)}],rows,{sort:3,low:r=>r[pi+1]<30});
  if(st.p!==state.period)host.prepend(el('p',{class:'note',text:'Segment data exists for Last 30 days, Last 90 days, Prior 90 days and last year. Showing '+PER[st.p].label+'.'}));
};
V.dow=host=>{
  const st=V.dow.st||(V.dow.st={b:D.dow[0].block});const blocks=[...new Set(D.dow.map(r=>r.block))];
  const rows=D.dow.filter(r=>r.block===st.b);const T=rows.reduce((a,r)=>[a[0]+r.sessions,a[1]+r.purchases,a[2]+r.revenue],[0,0,0]);
  const bc=el('div'),tb=el('div');
  host.append(card('RPS by day of week (US only, 12 full weeks)',el('div',{class:'filters'},lab('Day of week window',sel('w-b',blocks.map(b=>[b,b]),st.b,v=>{st.b=v;show('dow')}))),bc,tb,
   el('div',{class:'prose'},el('p',{text:'Reading: Sunday beats the weekly average in 10 of 12 weeks in the last 90 days and in the prior 90 days (8 of 12 last year), driven by a higher average order value. No day is below the weekly average often enough to call a problem. The weakest days change between windows. Verdict: no day of week CRO issue. Evidence for Sunday strength: moderate. Evidence for any weak day: insufficient.'}))));
  barChart(bc,{fmt:fR,ref:rps(T),refLabel:'window average',rows:rows.map(r=>({label:r.dow,v:r.revenue/r.sessions,tip:[['Sessions',fI(r.sessions)],['Purchases',fI(r.purchases)],['Revenue',fU(r.revenue)]]}))});
  table(tb,[{label:'Day',val:r=>r.dow,str:1},{label:'Sessions',val:r=>r.sessions,fmt:fI},{label:'Purchases',val:r=>r.purchases,fmt:fI},{label:'Revenue',val:r=>r.revenue,fmt:fU},{label:'Conv. rate',val:r=>r.purchases/r.sessions,fmt:x=>fP(x)},{label:'AOV',val:r=>r.revenue/r.purchases,fmt:fU},{label:'RPS',val:r=>r.revenue/r.sessions,fmt:fR},{label:'Weeks below weekly average (of 12)',val:r=>r.weeks_below_week_avg,fmt:fI}],rows);
};
const pill=e=>{const p=el('span',{class:'pill '+e});p.append(el('i'),document.createTextNode(e));return p};
V.opps=host=>{
  const st=V.opps.st||(V.opps.st={type:'',ev:'',open:null});
  const types=[...new Set(OPPS.map(o=>o.type))];
  const fl=el('div',{class:'filters'},lab('Opportunity type',sel('o-t',[['','All types']].concat(types.map(t=>[t,t])),st.type,v=>{st.type=v;show('opps')})),lab('Evidence strength',sel('o-e',[['','All'],['Strong','Strong'],['Moderate','Moderate'],['Directional','Directional'],['Insufficient','Insufficient']],st.ev,v=>{st.ev=v;show('opps')})));
  const tb=el('div'),det=el('div');
  const rows=OPPS.filter(o=>(!st.type||o.type===st.type)&&(!st.ev||o.evidence===st.ev));
  host.append(card('CRO opportunities',fl,el('p',{class:'note',text:'Select a row for the full record. Exposure is potential revenue exposure against the stated comparison, not guaranteed incremental revenue. Evidence scale: Strong = clear, persistent and no credible tracking explanation. Moderate = clear and persistent, one alternative explanation remains. Directional = seen on the site or in data, impact not yet measurable.'}),tb,rows.length?null:el('p',{class:'note',text:'No opportunity matches these filters. None is rated Strong or Insufficient.'})),det);
  table(tb,[{label:'Rank',val:o=>o.priority},{label:'Issue',val:o=>o.name,str:1,txt:1},{label:'Type',val:o=>o.type,str:1},{label:'Evidence',val:o=>o.evidence,str:1,cell:o=>pill(o.evidence)},{label:'Device',val:o=>o.device,str:1},{label:'Channel',val:o=>o.channel,str:1},{label:'Sessions',val:o=>o.sessions,fmt:fI},{label:'Purchases',val:o=>o.purchases,fmt:x=>x==null?'Unable to verify':fI(x)},{label:'Revenue',val:o=>o.revenue,fmt:x=>x==null?'Unable to verify':fU(x)},{label:'RPS',val:o=>o.rps,fmt:x=>x==null?'n/a':fR(x)},{label:'Comparison RPS',val:o=>o.comp_rps,fmt:x=>x==null?'n/a':fR(x)},{label:'RPS gap',val:o=>o.rps_gap,fmt:x=>x==null?'n/a':fR(x)},{label:'Exposure',val:o=>o.exposure,fmt:x=>x==null?'Not quantified':fU(x)},{label:'Exposure period',val:o=>o.exposure_period,str:1},{label:'Basis',val:o=>o.basis+', '+o.market,str:1}],rows,{sort:0,dir:1,onRow:o=>{st.open=o.id;draw()}});
  function draw(){det.innerHTML='';const o=OPPS.find(x=>x.id===st.open)||rows[0];if(!o)return;det.append(oppCard(o))}
  draw();
};
function oppCard(o,chartHost){
  const kv=el('dl',{class:'kv'});const add=(k,v)=>{kv.append(el('dt',{text:k}),el('dd',{},v instanceof Node?v:document.createTextNode(v))) };
  add('Segment',o.segment+' ('+o.market+', '+PER[o.basis].label+')');add('Channel',o.channel);add('Device',o.device);add('Page type',o.page);
  add('Sessions',fI(o.sessions));add('Purchases',o.purchases==null?'Unable to verify':fI(o.purchases));add('Revenue',o.revenue==null?'Unable to verify':fU(o.revenue));
  add('RPS',o.rps==null?'n/a':fR(o.rps));add('Comparison RPS',(o.comp_rps==null?'':fR(o.comp_rps)+'. ')+o.comp_label);add('RPS gap',o.rps_gap==null?'n/a':fR(o.rps_gap));
  add('30 day trend',o.trend30);add('90 day trend',o.trend90);add('Year over year',o.trendYoY);
  add('Evidence strength',pill(o.evidence));add('Website validation',o.validation);
  add('Verified data',o.verified);add('Observed website behavior',o.observed);add('Hypothesis',o.hypothesis);add('CRO opportunity',o.opportunity);
  add('Next investigation',o.next_step);add('Suggested experiment',o.experiment);
  add('Potential revenue exposure',(o.exposure==null?'':fU(o.exposure)+' '+o.exposure_period+'. ')+o.exposure_note.replace(/\.?$/,'.')+(o.exposure==null?'':' Not guaranteed incremental revenue.'));
  add('What would show this is wrong',o.disprove);
  const q=el('div',{class:'qc'});o.qc.forEach(c=>{const m={pass:'Pass',fail:'Fail',partial:'Partial',na:'n/a'}[c[1]];q.append(el('div',{},el('span',{class:'m '+c[1],text:m}),el('span',{text:c[0]+(c[2]?'. '+c[2]:'')})))});
  return el('div',{class:'card'},el('span',{class:'eyebrow',text:o.id+' · priority '+o.priority+' · '+o.type}),el('h2',{text:o.name}),chartHost||null,kv,el('h3',{text:'Final quality control'}),q);
}
V.deep=host=>{
  host.append(el('p',{class:'sub',text:'Each record separates what GA4 shows, what was seen on the live site on Oct 1, 2026, the hypothesis, and the test. Charts show the evidence behind the first, second, fourth and fifth items.'}));
  OPPS.slice().sort((a,b)=>a.priority-b.priority).forEach(o=>{const ch=el('div');host.append(oppCard(o,ch));
    if(o.id==='OPP-1'){const w=D.wk_checkout;lineChart(ch,{labels:w.map(r=>wkLabel(r[0])),fmt:x=>fP(x,0),title:'Place order to purchase rate',series:[{name:'Desktop',color:'--s1',pts:w.map(r=>({y:r[6]/r[5]}))},{name:'Mobile',color:'--s2',pts:w.map(r=>({y:r[2]/r[1]}))}],marker:6,markerLabel:'Event changes'});ch.append(el('p',{class:'note',text:'Share of sessions with a place order event that also recorded a purchase, by week, all traffic.'}))}
    if(o.id==='OPP-2'){const w=D.us_funnel;const f=s=>w.find(r=>r.seg===s);const m=f('L30 ALL>mobile'),d=f('L30 ALL>desktop');barChart(ch,{fmt:x=>fP(x,1),title:'Add to order to checkout',rows:[{label:'Desktop, last 30 days',v:d.begin_checkout/d.add_to_cart,color:'--s1',tip:[['Added to order',fI(d.add_to_cart)],['Began checkout',fI(d.begin_checkout)]]},{label:'Mobile, last 30 days',v:m.begin_checkout/m.add_to_cart,color:'--s2',tip:[['Added to order',fI(m.add_to_cart)],['Began checkout',fI(m.begin_checkout)]]}]});ch.append(el('p',{class:'note',text:'Share of US sessions with an add to cart event that reached begin checkout.'}))}
    if(o.id==='OPP-4'){const w=D.wk_app.filter(r=>r[0]>='20260525');lineChart(ch,{labels:w.map(r=>wkLabel(r[0])),fmt:fI,zero:1,title:'Sessions with a sold out view',series:[{name:'Mobile',color:'--s2',pts:w.map(r=>({y:r[2]}))},{name:'Desktop',color:'--s1',pts:w.map(r=>({y:r[6]}))}]});ch.append(el('p',{class:'note',text:'Sessions per week that saw a sold out state, all traffic.'}))}
    if(o.id==='OPP-5'){const ty=D.wk.PD.filter(r=>r[0].startsWith('2026')),ly=D.wk.PD.filter(r=>r[0].startsWith('2025'));lineChart(ch,{labels:ty.map(r=>wkLabel(r[0])),fmt:x=>fP(x,1),title:'US desktop paid search conversion rate',series:[{name:'2026',color:'--s1',pts:ty.map(r=>({y:r[2]/r[1]}))},{name:'2025',color:'--s1',dash:1,pts:ly.map(r=>({y:r[2]/r[1]}))}],marker:5,markerLabel:'App rollout starts'});ch.append(el('p',{class:'note',text:'Weekly purchase conversion rate, US Paid Search desktop, this year vs the same weeks last year.'}))}
  });
};
V.quality=host=>{host.append(el('div',{class:'card'},el('h2',{text:'Data quality notes'}),el('div',{class:'prose',html:`
<h3>How the data was pulled</h3>
<ul>
<li><b>Source.</b> GA4 property polynesia.com (ID 315504728), read on Oct 1, 2026 through the same reporting backend the GA4 interface uses. No sampling flag and no truncation flag came back on any query. The Traffic acquisition report total for Jul 2 to Sep 29 (693,568 sessions, $8,362,061.32) matches the totals used here.</li>
<li><b>Sep 30 is excluded.</b> GA4 reported Sep 29 as the latest fully processed day, and Sep 30 looked incomplete (5,808 sessions vs about 6,500 to 7,000 on comparable days).</li>
<li><b>Year over year uses a 364 day shift</b> so weekdays line up: Jul 3 to Sep 30, 2025 for the 90 day view and Sep 1 to 30, 2025 for the 30 day view.</li>
<li><b>Sessions are estimated by GA4.</b> The Sessions metric is a distinct count, so rows do not add up exactly. Breakdown sums land between 1.9% under and 1.8% over the reported totals. Purchases and revenue reconcile exactly in every breakdown.</li>
<li><b>Channel</b> is the property primary channel group (Polynesia Channel Group). The GA4 default grouping shows an AI Assistant channel (5,434 sessions, 314 purchases, $176,903, RPS $32.55 in the last 90 days) that the custom group folds into other channels.</li>
<li><b>Transfer check.</b> Tables were read in small pages and checked against checksums computed inside GA4: period totals, channel, device, channel by device, landing pages, all monthly series, all weekly series and the segment explorer. The US device, US channel by device, US funnel, day of week, weekly checkout, host and market tables reconcile internally (purchases and revenue add up to the verified totals), but the browser connection dropped before their final checksum pass.</li>
</ul>
<h3>Things that distort the numbers</h3>
<ul>
<li><b>Landing page has no hostname.</b> The root path / combines the www homepage with the root of five package app subdomains (package, packages, pkgs, pkg, pack). In the last 90 days about 65,000 Paid Search sessions and 56,000 Direct sessions started on those subdomain roots.</li>
<li><b>Revenue cannot be split by app variant.</b> All purchases fire on ticketing.polynesia.com, so GA4 has no way to tie revenue to a subdomain.</li>
<li><b>Direct is inflated.</b> About 56,000 sessions in the last 90 days started on package app subdomain roots with channel Direct. These are almost certainly paid or redirected visits that lost their source. Unassigned purchases rose from about 30 a month to 172 in Sep 2026.</li>
<li><b>Likely non human traffic.</b> Direct desktop in the last 90 days includes Singapore (10,516 sessions, 6 purchases), country not set (4,197, 0), Switzerland (1,968, 0), Austria (1,469, 0) and Vietnam (1,184, 0). Aug 2025 holds a Referral spike of 98,661 sessions, mostly US desktop in the weeks of Aug 4 and Aug 11, 2025, which lowers last year RPS.</li>
<li><b>Paid Social is mostly foreign prospecting.</b> Last 90 days: Japan 69,955 sessions and 0 purchases, South Korea 9,885 and 0, United States 24,638 and 50.</li>
<li><b>Ghost sessions.</b> Sessions with landing page (not set) rose from about 4,000 to 5,000 a month to 14,000 to 16,000 a month after the package app launched (40,747 in the last 90 days, 0 purchases). In the last 30 days 2,775 of 4,653 sessions with an availability fetch error had no page view, which fits idle tabs polling in the background.</li>
<li><b>Sessions that start at checkout.</b> At least 2,486 of 15,342 purchases (16%) in the last 90 days happened in sessions whose landing page was a ticketing page (BundleSelect.asp, login.asp, basket.asp). These sessions lose their original channel.</li>
<li><b>March 2026 tracking gap.</b> Sessions fell to 110,020, content pages nearly vanished (Blog 82 sessions, /packages 754) and Paid Search fell to 16,694 sessions while Direct and Organic purchases jumped. Paid Search volume returned in the week of Apr 13. Treat channel and landing page data for March to mid April 2026 as unreliable.</li>
<li><b>Funnel events changed meaning.</b> Add to cart events ran 26,000 to 48,000 a month through March 2026, then 437,257 in June, 521,349 in July, 201,854 in August and 74,991 in September. Begin checkout dropped from 22,920 in Jul 2025 to 13,674 in Aug 2025. Place order matched purchase 97% to 99% of the time until mid May 2026 and no longer does.</li>
<li><b>Variants send different events.</b> The pack subdomain sends no add to cart. Only package and pkg send purchase redirect. Sold out view did not fire on pack even with every card marked Fully Booked. View cart and begin checkout reach GA4 only from the ticketing hostname.</li>
<li><b>Housekeeping.</b> An event named G-501BHQ9B93 fired 153,530 times in 90 days. Hostnames localhost (274 sessions), prep (197) and newstaging (164) appear in production data. A Google Tag Manager tag throws jQuery is not defined on the package app.</li>
</ul>
<h3>Limits of the website inspection</h3>
<ul>
<li>Inspected on Oct 1, 2026 in desktop Chrome with a narrow window. No real phone was used, so mobile layout findings need a device check.</li>
<li>No payment was submitted and no personal data was entered. The payment form itself was not tested.</li>
<li>The inspection changed the saved visit date in this browser from Sep 29 to Oct 15. The test cart was cleared afterward.</li>
</ul>
`})))};
V.backlog=host=>{host.append(el('div',{class:'card'},el('h2',{text:'Investigation backlog'}),el('p',{class:'note',text:'Promising areas that need more analysis before they become experiments.'}),el('div',{class:'prose',html:`
<ol>
<li><b>Japan and South Korea paid social landing experience.</b> 79,840 sessions and no purchases in 90 days. Check language, landing page and whether those markets can book online at all (polynesia.jp exists). Decide whether these campaigns belong in conversion reporting.</li>
<li><b>Package app variant comparison.</b> Five subdomains run in parallel and GA4 cannot attribute revenue to them. Pass the variant to the purchase event or add a landing hostname dimension, then compare RPS by variant.</li>
<li><b>www /packages vs package app root for Paid Search.</b> US Paid Search desktop RPS was $34.98 on /packages vs $42.08 on the root path in the last 90 days, but the prior 90 days showed the reverse ($53.50 vs $46.45). Needs a campaign controlled comparison before it means anything.</li>
<li><b>Availability fetch error.</b> Confirm with Sentry whether errors reach active users or only idle tabs. Stop polling when the tab is hidden so ghost sessions stop inflating desktop sessions.</li>
<li><b>Sessions that restart at checkout.</b> Fix cross domain and session continuity between the package app and ticketing so purchases keep their channel. This also settles how much of the mobile place order gap is tracking.</li>
<li><b>Affiliate partner mix.</b> Affiliate conversion fell from 5.4% to 3.5% year over year. New partners explain it: CSconsultancy (1,583 sessions, 11 purchases), Partnermatic (1,313, 7), Skimlinks (519, 0), Takeads (440, 2). Rakuten and Capital One still convert at 8% to 10%. A partner management item, not a site test.</li>
<li><b>Blog and guides.</b> Organic blog sessions grew from about 6,000 to 45,000 per 90 days year over year with 27 purchases. Test a contextual package offer on recipe and culture articles, with modest expectations.</li>
<li><b>Promo messaging.</b> A banner reading Ends Sept 30, 2026 was still shown on Oct 1 for a past date. Check promo end handling.</li>
<li><b>Guest count and cart state.</b> After a reload the cart kept two adult tickets while the guest counter showed zero adults. Check whether this confuses repeat visitors.</li>
<li><b>Sunday strength.</b> Sunday RPS beats the weekly average in 10 of 12 weeks through a higher order value. Worth a look at what Sunday buyers choose before using it in promo timing.</li>
<li><b>Email.</b> 152 purchases at an average order near $127 in 90 days, far below the site average of $545. Check which offers email promotes.</li>
<li><b>Tablet.</b> 12,943 sessions and 380 purchases in 90 days. Too small for its own test.</li>
</ol>
`})))};

const TABS=[['overview','Overview'],['trend','RPS trend'],['channels','Channels'],['devices','Devices'],['pages','Landing pages'],['segments','Segment explorer'],['dow','Day of week'],['opps','Opportunities'],['deep','Deep dives'],['quality','Data quality'],['backlog','Backlog']];
const USES={overview:['period','market'],trend:[],channels:['period'],devices:['period','market'],pages:['period'],segments:['period'],dow:[],opps:[],deep:[],quality:[],backlog:[]};
function show(v){state.view=v;const host=$('#views');host.innerHTML='';const sec=el('div',{class:'view',role:'tabpanel'});host.append(sec);
  Array.from($('#tabs').children).forEach(b=>b.setAttribute('aria-selected',b.dataset.v===v?'true':'false'));
  const u=USES[v];$('#f-period').disabled=!u.includes('period');$('#f-market').disabled=!u.includes('market');
  $('#gnote').textContent=u.length===0?'This view has its own controls.':(!u.includes('market')?'Market filter does not apply to this view.':'');
  V[v](sec);}
function init(){const tabs=$('#tabs');TABS.forEach(([k,l])=>{const b=el('button',{class:'tab',role:'tab','data-v':k,text:l,id:'tab-'+k});b.addEventListener('click',()=>{show(k);try{history.replaceState(null,'','#'+k)}catch(e){}});tabs.append(b)});
  const ps=$('#f-period');['L30','L60','L90','P90','Y90'].forEach(p=>{const o=el('option',{value:p,text:PLAB[p]});if(p===state.period)o.selected=true;ps.append(o)});
  ps.addEventListener('change',()=>{state.period=ps.value;save();show(state.view)});
  const ms=$('#f-market');ms.value=state.market;ms.addEventListener('change',()=>{state.market=ms.value;save();show(state.view)});
  const h=(location.hash||'').slice(1);show(V[h]?h:'overview');
  let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>show(state.view),200)});}
init();
