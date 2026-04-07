(function () {
  'use strict';

  var PHONE = '5511999999999';
  var isMobile = (function () {
    var ua = navigator.userAgent || navigator.vendor || window.opera;
    var touch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    var uaMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
    var small = window.innerWidth < 769;
    return uaMobile || (touch && small);
  })();

  function col(c, a) { return 'rgba(' + c + ',' + a + ')'; }

  function ptInPoly(x, y, poly) {
    var ins = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ins = !ins;
    }
    return ins;
  }

  function openWhatsApp(msg) {
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  }

  var SVG_ICONS = {
    snowflake: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v20M4.93 4.93l14.14 14.14M2 12h20M4.93 19.07L19.07 4.93"/><circle cx="12" cy="12" r="3"/></svg>',
    shield:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
    wind:      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M9.59 4.59A2 2 0 1111 8H2m10.59 11.41A2 2 0 1014 16H2m15.73-8.27A2.5 2.5 0 1119.5 12H2"/></svg>',
    sun:       '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    all:       '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>'
  };

  var CAT_ICON = { gelado: 'snowflake', frutado: 'shield', mentolado: 'wind', tropical: 'sun' };
  var CAT_COUNTS = { gelado: 4, frutado: 5, mentolado: 2, tropical: 1 };

  function init() {
    initNavbar();
    initFlavors();
    initAcquireButtons();
    initCookies();
    initScrollAnimations();
    if (!isMobile) {
      initBackground();
      initGlobe();
    }
  }

  function initBackground() {
    var wrap = document.querySelector('.fundo');
    if (!wrap) return;
    var gC = document.getElementById('gridCanvas');
    if (!gC) return;
    var gx = gC.getContext('2d');
    var CELL = 50;

    var orbDefs = [
      { x: 0.2, y: 0.3, c: '245,158,11', s: 300 },
      { x: 0.8, y: 0.7, c: '6,182,212',  s: 250 },
      { x: 0.5, y: 0.5, c: '139,92,246', s: 280 },
      { x: 0.1, y: 0.8, c: '34,197,94',  s: 220 }
    ];
    var orbs = [], pts = [], lastGridT = 0;

    function resize() {
      var w = wrap.offsetWidth;
      var h = Math.max(wrap.offsetHeight, window.innerHeight);
      gC.width = w; gC.height = h;
      orbs = orbDefs.map(function (o) {
        return { x: o.x*w, y: o.y*h, vx:(Math.random()-.5)*.3, vy:(Math.random()-.5)*.2, c:o.c, s:o.s, phase:Math.random()*Math.PI*2 };
      });
      drawGrid(); seedParticles();
    }

    function drawGrid() {
      var W = gC.width, H = gC.height;
      gx.clearRect(0,0,W,H); gx.strokeStyle='rgba(255,255,255,0.025)'; gx.lineWidth=.5;
      for (var x=0;x<=W;x+=CELL){gx.beginPath();gx.moveTo(x,0);gx.lineTo(x,H);gx.stroke();}
      for (var y=0;y<=H;y+=CELL){gx.beginPath();gx.moveTo(0,y);gx.lineTo(W,y);gx.stroke();}
    }

    function seedParticles() {
      var W=gC.width,H=gC.height;
      var COUNT=Math.max(80,Math.floor(W*H/8000));
      var split=[.18,.32,.42]; pts=[];
      for (var i=0;i<COUNT;i++){
        var r=Math.random();
        var cat=r<split[0]?'amber':r<split[1]?'teal':r<split[2]?'green':'white';
        pts.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*1.5+.5,c:cat,pulse:Math.random()*Math.PI*2});
      }
    }

    var CM={'amber':'245,158,11','teal':'6,182,212','green':'34,197,94'};

    function loop(now){
      now=now||0;
      var W=gC.width,H=gC.height,ax=gx;
      if(now-lastGridT>2000){drawGrid();lastGridT=now;}
      ax.clearRect(0,0,W,H);
      for(var o=0;o<orbs.length;o++){
        var ob=orbs[o]; ob.x+=ob.vx; ob.y+=ob.vy; ob.phase+=.008;
        if(ob.x<-ob.s) ob.x=W+ob.s; if(ob.x>W+ob.s) ob.x=-ob.s;
        if(ob.y<-ob.s) ob.y=H+ob.s; if(ob.y>H+ob.s) ob.y=-ob.s;
        var al=.018+Math.sin(ob.phase)*.008;
        var og=ax.createRadialGradient(ob.x,ob.y,0,ob.x,ob.y,ob.s);
        og.addColorStop(0,col(ob.c,al)); og.addColorStop(1,col(ob.c,0));
        ax.fillStyle=og; ax.beginPath(); ax.arc(ob.x,ob.y,ob.s,0,Math.PI*2); ax.fill();
      }
      for(var i=0;i<pts.length;i++){
        for(var j=i+1;j<pts.length;j++){
          var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
          if(d<160){
            var a=(1-d/160)*.28;
            var cs=pts[i].c!=='white'?(pts[i].c===pts[j].c?CM[pts[i].c]:'255,255,255'):(pts[j].c!=='white'?CM[pts[j].c]:'255,255,255');
            ax.beginPath(); ax.moveTo(pts[i].x,pts[i].y); ax.lineTo(pts[j].x,pts[j].y);
            ax.strokeStyle=col(cs,a); ax.lineWidth=.5; ax.stroke();
          }
        }
      }
      for(var k=0;k<pts.length;k++){
        var p=pts[k]; p.pulse+=.018;
        var ps=1+Math.sin(p.pulse)*.35;
        if(p.c!=='white'){
          var gc=CM[p.c],gS=14*ps;
          var gl=ax.createRadialGradient(p.x,p.y,0,p.x,p.y,gS);
          gl.addColorStop(0,col(gc,.18)); gl.addColorStop(.5,col(gc,.06)); gl.addColorStop(1,'rgba(0,0,0,0)');
          ax.fillStyle=gl; ax.beginPath(); ax.arc(p.x,p.y,gS,0,Math.PI*2); ax.fill();
        }
        ax.beginPath(); ax.arc(p.x,p.y,p.r*ps,0,Math.PI*2);
        ax.fillStyle=p.c==='white'?'rgba(255,255,255,.5)':'rgba(255,255,255,.9)'; ax.fill();
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
      }
      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    requestAnimationFrame(function(){ resize(); loop(); });
  }

  function initGlobe() {
    var host = document.querySelector('.hero-globe');
    if (!host) return;
    if (window.innerWidth < 900) return;

    var canvas = document.getElementById('globeCanvas');
    if (!canvas) return;
    var size = 480;
    canvas.width = canvas.height = size;
    canvas.style.cssText = 'display:block;width:480px;height:480px;border-radius:50%;';

    var ctx = canvas.getContext('2d');
    var R = size/2 - 20, cx = size/2, cy = size/2;
    var rot = 0, t = 0;

    function proj(lon, lat) {
      var ph = (lon+rot)*Math.PI/180;
      var th = (90-lat)*Math.PI/180;
      var sT=Math.sin(th),cT=Math.cos(th),sP=Math.sin(ph),cP=Math.cos(ph);
      return { x:cx+R*sT*cP, y:cy-R*cT, z:R*sT*sP };
    }
    function vis(p, m) { return p.z > -R*(m||.05); }

    var continents = {
      SA:[[-80,10],[-77,8],[-73,12],[-62,10],[-55,5],[-50,0],[-40,-3],[-35,-5],[-38,-8],[-40,-16],[-43,-22],[-52,-32],[-54,-34],[-66,-50],[-68,-53],[-72,-42],[-73,-36],[-72,-22],[-71,-14],[-75,-8],[-80,0],[-79,3],[-80,10]],
      NA:[[-130,50],[-128,52],[-140,60],[-165,70],[-140,70],[-100,62],[-85,62],[-70,60],[-66,44],[-75,38],[-80,32],[-97,26],[-115,30],[-124,42],[-130,50]],
      EU:[[-10,36],[0,44],[5,44],[3,48],[0,51],[5,54],[12,55],[22,55],[28,58],[22,70],[10,62],[5,58],[14,50],[16,48],[20,46],[25,42],[24,36],[10,36],[-10,36]],
      AF:[[-16,14],[-8,33],[10,36],[30,32],[38,28],[44,12],[48,2],[40,-10],[32,-26],[25,-34],[17,-28],[10,-10],[0,5],[-16,14]],
      AS:[[30,38],[55,45],[90,55],[130,52],[140,40],[130,34],[120,28],[105,14],[100,5],[108,5],[115,12],[120,20],[120,26],[115,34],[105,30],[90,28],[82,28],[75,28],[65,26],[52,28],[48,35],[40,40],[30,38]],
      OC:[[115,-14],[130,-12],[145,-16],[152,-26],[145,-38],[136,-35],[120,-28],[115,-14]]
    };
    var contColors = { SA:'34,197,94', NA:'6,182,212', EU:'139,92,246', AF:'245,158,11', AS:'59,130,246', OC:'20,184,166' };

    var land = [];
    function seedLand(poly, n) {
      var mn=[Infinity,Infinity],mx=[-Infinity,-Infinity];
      for(var v=0;v<poly.length;v++){mn[0]=Math.min(mn[0],poly[v][0]);mx[0]=Math.max(mx[0],poly[v][0]);mn[1]=Math.min(mn[1],poly[v][1]);mx[1]=Math.max(mx[1],poly[v][1]);}
      var c=0,tt=0;
      while(c<n && tt<n*60){
        tt++;
        var lo=mn[0]+Math.random()*(mx[0]-mn[0]);
        var la=mn[1]+Math.random()*(mx[1]-mn[1]);
        if(ptInPoly(lo,la,poly)){land.push({lon:lo+(Math.random()-.5)*2,lat:la+(Math.random()-.5)*1.5});c++;}
      }
    }
    seedLand(continents.SA,100); seedLand(continents.NA,130);
    seedLand(continents.EU,70);  seedLand(continents.AF,110);
    seedLand(continents.AS,170); seedLand(continents.OC,70);

    var cities = [
      { lon:-51.93, lat:-23.42, main:true },
      { lon:-51.16, lat:-23.31 }, { lon:-49.27, lat:-25.43 },
      { lon:-46.63, lat:-23.55 }, { lon:-43.17, lat:-22.91 },
      { lon:-47.88, lat:-15.79 }, { lon:-38.51, lat:-12.97 }
    ];

    function makeOrbit(count, speed) {
      var arr=[];
      for(var i=0;i<count;i++) arr.push({a:(i/count)*Math.PI*2,sp:speed});
      return arr;
    }
    var orb1=makeOrbit(160,.5), orb2=makeOrbit(110,-.35), orb3=makeOrbit(70,.2);

    var stars=[];
    for(var si=0;si<300;si++){
      stars.push({x:Math.random()*size,y:Math.random()*size,r:Math.random()*1.4+.2,ph:Math.random()*Math.PI*2,sp:Math.random()*.035+.008,br:Math.random()});
    }

    var nebs=[
      {ox:100,oy:-70,r:160,c:'245,158,11',a:.014,ph:0},
      {ox:-90,oy:55,r:140,c:'139,92,246',a:.012,ph:1.5},
      {ox:55,oy:120,r:130,c:'6,182,212',a:.010,ph:3},
      {ox:-120,oy:-55,r:150,c:'34,197,94',a:.009,ph:4.5}
    ];

    function drawOrbitRing(pts, tiltX, tiltY, rx, ry, baseR, offset, c) {
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(tiltX); ctx.scale(1,tiltY);
      for(var i=0;i<pts.length;i++){
        var o=pts[i]; o.a+=o.sp/60;
        var ox=Math.cos(o.a)*(baseR+offset);
        var oy=Math.sin(o.a)*(baseR+offset);
        var oa=rx+Math.sin(o.a*3+t*2)*ry;
        ctx.beginPath(); ctx.arc(ox,oy,1.3,0,Math.PI*2);
        ctx.fillStyle=col(c,oa); ctx.fill();
      }
      ctx.restore();
    }

    function draw() {
      rot+=0.1; t+=1/60;
      ctx.clearRect(0,0,size,size);

      for(var i=0;i<stars.length;i++){
        var s=stars[i]; s.ph+=s.sp;
        var tw=Math.abs(Math.sin(s.ph));
        var al=.12+tw*.5*(.5+s.br*.5);
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r*(0.8+tw*.2),0,Math.PI*2);
        ctx.fillStyle=s.br>.7?col('245,200,140',al):col('255,255,255',al); ctx.fill();
      }

      for(var ni=0;ni<nebs.length;ni++){
        var nb=nebs[ni]; nb.ph+=nb.a;
        var na=nb.a+Math.sin(nb.ph)*nb.a*.5;
        var ng=ctx.createRadialGradient(cx+nb.ox,cy+nb.oy,0,cx+nb.ox,cy+nb.oy,nb.r);
        ng.addColorStop(0,col(nb.c,na)); ng.addColorStop(1,col(nb.c,0));
        ctx.fillStyle=ng; ctx.beginPath(); ctx.arc(cx+nb.ox,cy+nb.oy,nb.r,0,Math.PI*2); ctx.fill();
      }

      drawOrbitRing(orb1, .3, .35, R, 15, .2, .12, '245,158,11');
      drawOrbitRing(orb2,-.4, .3,  R, 25, .15,.1,  '6,182,212');
      drawOrbitRing(orb3, .15,.4,  R, 38, .15,.08, '34,197,94');

      var ap=1+Math.sin(t*.8)*.04;
      for(var ag=6;ag>=0;ag--){
        var ar=(R+10+ag*14)*ap,aa=.035-ag*.004;
        var aG=ctx.createRadialGradient(cx,cy,R,cx,cy,ar);
        aG.addColorStop(0,col('245,158,11',aa)); aG.addColorStop(.4,col('139,92,246',aa*.6));
        aG.addColorStop(.7,col('6,182,212',aa*.3)); aG.addColorStop(1,'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(cx,cy,ar,0,Math.PI*2); ctx.fillStyle=aG; ctx.fill();
      }

      var oc=ctx.createRadialGradient(cx-R*.25,cy-R*.25,R*.05,cx,cy,R);
      oc.addColorStop(0,'#1a4070'); oc.addColorStop(.15,'#14305a');
      oc.addColorStop(.4,'#0e2040'); oc.addColorStop(.7,'#0a1830'); oc.addColorStop(1,'#060f20');
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle=oc; ctx.fill();

      var sp=ctx.createRadialGradient(cx-R*.35,cy-R*.3,0,cx-R*.35,cy-R*.3,R*.4);
      sp.addColorStop(0,'rgba(255,255,255,0.18)'); sp.addColorStop(.4,'rgba(130,200,255,0.06)'); sp.addColorStop(1,'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle=sp; ctx.fill();

      ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=.5;
      for(var la=-80;la<=80;la+=15){
        ctx.beginPath(); var first=true;
        for(var lo=0;lo<=360;lo+=3){
          var p=proj(lo-180,la);
          if(vis(p)){first?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y);first=false;}else first=true;
        }
        ctx.stroke();
      }
      for(var lo2=0;lo2<360;lo2+=20){
        ctx.beginPath(); first=true;
        for(var la2=-90;la2<=90;la2+=3){
          var pp=proj(lo2,la2);
          if(vis(pp)){first?ctx.moveTo(pp.x,pp.y):ctx.lineTo(pp.x,pp.y);first=false;}else first=true;
        }
        ctx.stroke();
      }

      var keys=['SA','NA','EU','AF','AS','OC'];
      for(var ci=0;ci<keys.length;ci++){
        var key=keys[ci],clr=contColors[key],poly=continents[key];
        ctx.beginPath(); var started=false;
        for(var vi=0;vi<poly.length;vi++){
          var pv=proj(poly[vi][0],poly[vi][1]);
          if(vis(pv)){started?ctx.lineTo(pv.x,pv.y):ctx.moveTo(pv.x,pv.y);started=true;}else started=false;
        }
        if(started){
          ctx.strokeStyle=col(clr,.1); ctx.lineWidth=8; ctx.stroke();
          ctx.strokeStyle=col(clr,.22); ctx.lineWidth=4; ctx.stroke();
          ctx.strokeStyle=col(clr,.7); ctx.lineWidth=1.5; ctx.stroke();
        }
      }

      for(var li=0;li<land.length;li++){
        var lp=proj(land[li].lon,land[li].lat);
        if(!vis(lp)) continue;
        var depth=.3+.7*(Math.max(0,lp.z)/R);
        var absLat=Math.abs(land[li].lat);
        var cr,cg,cb;
        if(absLat<25){cr=34;cg=200;cb=94;}
        else if(absLat<50){cr=6;cg=185;cb=215;}
        else{cr=220;cg=230;cb=245;}
        ctx.beginPath(); ctx.arc(lp.x,lp.y,1+.5*depth,0,Math.PI*2);
        ctx.fillStyle='rgba('+cr+','+cg+','+cb+','+(0.2+depth*.65)+')'; ctx.fill();
      }

      for(var cii=0;cii<cities.length;cii++){
        var city=cities[cii], cp=proj(city.lon,city.lat);
        if(!vis(cp,.12)) continue;
        var isMain=city.main;
        if(isMain){
          var wg=ctx.createRadialGradient(cp.x,cp.y,0,cp.x,cp.y,50);
          wg.addColorStop(0,'rgba(245,158,11,0.18)'); wg.addColorStop(1,'transparent');
          ctx.fillStyle=wg; ctx.beginPath(); ctx.arc(cp.x,cp.y,50,0,Math.PI*2); ctx.fill();
          for(var ring=0;ring<3;ring++){
            var ph=((t*.5+ring*.33)%1);
            ctx.beginPath(); ctx.arc(cp.x,cp.y,6+ph*32,0,Math.PI*2);
            ctx.strokeStyle=col('245,158,11',(1-ph)*.55);
            ctx.lineWidth=1.5; ctx.stroke();
          }
          var cg2=ctx.createRadialGradient(cp.x,cp.y,0,cp.x,cp.y,38);
          cg2.addColorStop(0,'rgba(245,158,11,0.5)'); cg2.addColorStop(.4,'rgba(245,158,11,0.12)'); cg2.addColorStop(1,'transparent');
          ctx.fillStyle=cg2; ctx.beginPath(); ctx.arc(cp.x,cp.y,38,0,Math.PI*2); ctx.fill();
        } else {
          var sg=ctx.createRadialGradient(cp.x,cp.y,0,cp.x,cp.y,16);
          sg.addColorStop(0,'rgba(34,197,94,0.25)'); sg.addColorStop(1,'transparent');
          ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(cp.x,cp.y,16,0,Math.PI*2); ctx.fill();
        }
        ctx.shadowColor=isMain?'#f59e0b':'rgba(34,197,94,0.5)';
        ctx.shadowBlur=isMain?18:7;
        ctx.beginPath(); ctx.arc(cp.x,cp.y,isMain?7.5:3+2*(cp.z/R),0,Math.PI*2);
        ctx.fillStyle=isMain?'#f59e0b':col('34,197,94',.6+.4*(cp.z/R));
        ctx.fill(); ctx.shadowBlur=0;
        if(isMain){
          ctx.textAlign='center';
          ctx.font='bold 12px "DM Sans",sans-serif';
          ctx.fillStyle='rgba(245,158,11,1)';
          ctx.fillText('Maringá',cp.x,cp.y-22);
          ctx.font='500 9px "DM Sans",sans-serif';
          ctx.fillStyle='rgba(34,197,94,.9)';
          ctx.fillText('Entrega grátis',cp.x,cp.y-34);
          ctx.font='400 8px "DM Sans",sans-serif';
          ctx.fillStyle='rgba(255,255,255,.35)';
          ctx.fillText('PR, Brasil',cp.x,cp.y+30);
        }
      }

      ctx.beginPath(); ctx.arc(cx,cy,R-.5,0,Math.PI*2);
      ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1.5; ctx.stroke();

      requestAnimationFrame(draw);
    }

    var obs=new IntersectionObserver(function(en){
      if(en[0].isIntersecting){draw();obs.unobserve(host);}
    },{threshold:.1});
    obs.observe(host);
  }

  function initFlavors() {
    var flavors = [
      { name:'Acai Ice',          tag:'Gelado · Frutado',        cat:'frutado',   icon:'shield'   },
      { name:'Artic Gum',         tag:'Refrescante · Mentolado', cat:'mentolado', icon:'wind'     },
      { name:'Frozen Mint',       tag:'Gelado · Intenso',        cat:'gelado',    icon:'snowflake'},
      { name:'Menthol',           tag:'Puro · Classico',         cat:'mentolado', icon:'wind'     },
      { name:'Ice Mint+',         tag:'Fresco · Gelado',         cat:'gelado',    icon:'snowflake'},
      { name:'Blueberry Lemon',   tag:'Acido · Frutado',         cat:'frutado',   icon:'shield'   },
      { name:'Grape Ice',         tag:'Gelado · Uva',            cat:'gelado',    icon:'snowflake'},
      { name:'Blueberry Frozen',  tag:'Doce · Natural',          cat:'frutado',   icon:'shield'   },
      { name:'Strawberry Kiwi',   tag:'Tropical · Acido',        cat:'frutado',   icon:'shield'   },
      { name:'Watermelon Ice',    tag:'Refrescante · Doce',      cat:'frutado',   icon:'shield'   },
      { name:'Lime Mango',        tag:'Citrico · Tropical',      cat:'tropical',  icon:'sun'      },
      { name:'Frozen Strawberry', tag:'Gelado · Morango',        cat:'gelado',    icon:'snowflake'}
    ];

    var catColors = {
      gelado:    '#06b6d4',
      frutado:   '#f59e0b',
      mentolado: '#818cf8',
      tropical:  '#22c55e'
    };
    var catNames = { gelado:'Gelado', frutado:'Frutado', mentolado:'Mentolado', tropical:'Tropical' };

    var cur = 0, activeCat = 'all';
    var outer   = document.getElementById('fwrap-outer');
    var pfName  = document.getElementById('pfName');
    var pfTag   = document.getElementById('pfTag');
    var pfDot   = document.getElementById('pfDot');
    var pfHint  = document.getElementById('pcsHint');
    var acqBtn  = document.getElementById('prodAcquireBtn');

    if (!outer) return;

    var catBar = document.createElement('div');
    catBar.className = 'cat-filter-bar';

    var cats = ['all','gelado','frutado','mentolado','tropical'];
    cats.forEach(function(ct) {
      var btn = document.createElement('button');
      btn.className = 'cat-filter' + (ct==='all'?' active':'');
      btn.setAttribute('data-cat', ct);
      var iconKey = ct==='all' ? 'all' : CAT_ICON[ct];
      var countHTML = ct!=='all' ? '<span class="cat-count">'+(CAT_COUNTS[ct]||'')+'</span>' : '';
      var label = ct==='all' ? 'Todos' : catNames[ct];
      btn.innerHTML = (SVG_ICONS[iconKey]||'') + '<span>' + label + '</span>' + countHTML;
      catBar.appendChild(btn);
    });

    outer.appendChild(catBar);

    var fwrap = document.createElement('div');
    fwrap.className = 'flavor-grid';
    fwrap.id = 'fwrap';
    outer.appendChild(fwrap);

    catBar.addEventListener('click', function(e) {
      var btn = e.target.closest('.cat-filter');
      if (!btn) return;
      catBar.querySelectorAll('.cat-filter').forEach(function(b){ b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      renderFlavors();
    });

    function renderFlavors() {
      fwrap.innerHTML = '';
      flavors.forEach(function(f, i) {
        if (activeCat !== 'all' && f.cat !== activeCat) return;
        var b = document.createElement('button');
        b.className = 'fflavor' + (i===cur ? ' active':'');
        b.setAttribute('data-cat', f.cat);
        b.setAttribute('data-idx', i);
        var iconHtml = SVG_ICONS[f.icon] || '';
        b.innerHTML = '<div class="fflavor-icon-wrap">'+iconHtml+'</div><span class="fflavor-name">'+f.name+'</span>';
        b.addEventListener('click', function(){ setFlavor(i); });
        fwrap.appendChild(b);
      });
    }

    function buildMsg(qty) {
      var f = flavors[cur];
      if (qty===1) return 'Ola! Vim pelo site Junin e quero comprar 1 unidade do Ignite V80 — sabor ' + f.name + ' (' + f.tag + ').';
      if (qty===2) return 'Ola! Vim pelo site Junin e quero o Combo Duplo (2 unidades): 1x ' + f.name + ' (+ outro sabor diferente). Como funciona a entrega?';
      return 'Ola! Vim pelo site Junin e quero saber mais sobre o Ignite V80 sabor ' + f.name + ' (' + f.tag + '). Pode me ajudar?';
    }

    function setFlavor(i) {
      cur = i;
      var f = flavors[i], cc = catColors[f.cat];
      if (pfName) pfName.textContent = f.name;
      if (pfTag)  { pfTag.textContent = f.tag; pfTag.style.color=cc; pfTag.style.borderColor='rgba('+hexToRgb(cc)+',.12)'; pfTag.style.background='rgba('+hexToRgb(cc)+',.06)'; }
      if (pfDot)  { pfDot.style.background=cc; pfDot.style.boxShadow='0 0 10px '+cc+',0 0 20px '+cc; }
      if (pfHint) pfHint.style.opacity='0';
      var img = document.getElementById('prodImg');
      if (img) {
        img.style.transform='scale(0.88) rotate(-3deg)'; img.style.opacity='.6';
        setTimeout(function(){ img.style.transform=''; img.style.opacity=''; }, 280);
      }
      renderFlavors();
    }

    function hexToRgb(hex) {
      var map = { '#f59e0b':'245,158,11', '#06b6d4':'6,182,212', '#818cf8':'129,140,248', '#22c55e':'34,197,94' };
      return map[hex] || '255,255,255';
    }

    var pImg = document.getElementById('prodImg');
    if (pImg) pImg.addEventListener('click', function(){ setFlavor((cur+1)%flavors.length); });
    if (acqBtn) acqBtn.addEventListener('click', function(){ openWhatsApp(buildMsg(0)); });
    window._junin_buildMsg = buildMsg;

    renderFlavors();
  }

  function initNavbar() {
    var navbar   = document.getElementById('navbar');
    var navMenu  = document.getElementById('navMenu');
    var navTog   = document.getElementById('navToggle');
    var navClose = document.getElementById('navClose');
    var prodSec  = document.getElementById('produtos');

    if (window.innerWidth < 769 && prodSec) prodSec.style.display = 'block';

    if (navTog && navMenu) {
      navTog.addEventListener('click', function(){
        navMenu.classList.add('open');
        navTog.style.display='none';
        if (navClose) navClose.style.display='block';
      });
    }
    if (navClose && navMenu) {
      navClose.addEventListener('click', function(){
        navMenu.classList.remove('open');
        navClose.style.display='none';
        if (navTog) navTog.style.display='';
      });
    }

    document.querySelectorAll('.nav-link').forEach(function(link){
      link.addEventListener('click', function(e){
        var h = link.getAttribute('href');
        if (!h || h.indexOf('#')!==0) return;
        e.preventDefault();
        var target = document.getElementById(h.substring(1));
        if (target) target.scrollIntoView({behavior:'smooth',block:'start'});
        document.querySelectorAll('.nav-link').forEach(function(l){ l.classList.remove('active'); });
        link.classList.add('active');
        if (navMenu){ navMenu.classList.remove('open'); if(navClose) navClose.style.display='none'; if(navTog) navTog.style.display=''; }
      });
    });

    var secsAll = document.querySelectorAll('.section');
    var nlinks  = document.querySelectorAll('.nav-link[data-section]');
    if (navbar) {
      window.addEventListener('scroll', function(){
        navbar.classList.toggle('scrolled', window.scrollY>30);
        if (!secsAll.length||!nlinks.length) return;
        var current='inicio';
        secsAll.forEach(function(s){ if(s.offsetTop && window.scrollY>=s.offsetTop-150) current=s.id; });
        nlinks.forEach(function(l){ l.classList.toggle('active', l.getAttribute('data-section')===current); });
      });
    }
  }

  function initAcquireButtons() {
    document.querySelectorAll('.acquire-btn').forEach(function(btn){
      btn.addEventListener('click', function(){
        var q = parseInt(btn.getAttribute('data-qty')) || 0;
        var msg = window._junin_buildMsg ? window._junin_buildMsg(q) : '';
        openWhatsApp(msg);
      });
    });
  }

  function initCookies() {
    var b  = document.getElementById('cookieBanner');
    if (!b) return;
    var ac = document.getElementById('cookieAccept');
    if (localStorage.getItem('cookie_consent')) return;
    setTimeout(function(){ b.classList.add('show'); }, 1500);
    if (ac) {
      ac.addEventListener('click', function(){
        localStorage.setItem('cookie_consent','true');
        b.classList.remove('show');
      });
    }
  }

  function initScrollAnimations() {
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    },{threshold:.1});
    document.querySelectorAll('[data-animate]').forEach(function(el){ obs.observe(el); });
  }

  if (document.readyState==='loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();