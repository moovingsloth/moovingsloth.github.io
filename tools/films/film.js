// Deterministic timeline: every CSS animation is paused and driven by seek(t).
(function(){
  const scenes=[...document.querySelectorAll('.scene')];let acc=0;
  scenes.forEach((s,i)=>{s._start=acc;s._dur=parseFloat(s.dataset.dur);s.style.setProperty('--dur',s._dur+'s');acc+=s._dur;if(i===scenes.length-1)s.classList.add('last');});
  window.FILM={total:acc,scenes:scenes.map(s=>[s._start,s._dur])};
  let anims=null;
  function collect(){anims=document.getAnimations().map(a=>{let el=a.effect.target;return [a,el.closest('.scene')]});}
  window.seek=function(t){
    if(!anims)collect();
    scenes.forEach(s=>s.classList.toggle('on',t>=s._start&&t<s._start+s._dur+1e-6));
    anims.forEach(([a,s])=>{if(s)a.currentTime=Math.max(0,(t-s._start)*1000);});
    document.querySelectorAll('[data-count]').forEach(el=>{
      const s=el.closest('.scene');const lt=t-s._start;const [from,to,st,du,dec]=el.dataset.count.split(',').map(Number);
      let p=Math.min(1,Math.max(0,(lt-st)/du));p=1-Math.pow(1-p,3);
      el.textContent=(from+(to-from)*p).toLocaleString('en-US',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0});});
    if(window.onSeek)scenes.forEach(s=>{if(s.classList.contains('on'))window.onSeek(s.id,t-s._start)});
  };
  document.fonts.ready.then(()=>{seek(0);window.READY=true;});
})();
