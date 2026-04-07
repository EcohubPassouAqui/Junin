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
      var xi = poly[i][0], yi = poly[i][1];
      var xj = poly[j][0], yj = poly[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) { ins = !ins; }
    }
    return ins;
  }

  function openWhatsApp(msg) {
    window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg), '_blank');
  }

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

  // BACKGROUND — Grid
  function initBackground() {
    var wrap = document.querySelector('.fundo');
    if (!wrap) return;
    var gC = document.getElementById('gridCanvas');
    if (!gC) return;
    var gx = gC.getContext('2d');
    var CELL = 50;

    var orbDefs = [
      { x: 0.2, y: 0.3, c: '245,158,11', s: 300 },
      { x: 0.8, y: 0.7, c: '6,182,212', s: 250 },
      { x: 0.5, y: 0.5, c: '139,92,246', s: 280 },
      { x: 0.1, y: 0.8, c: '34,197,94', s: 220 }
    ];
    var orbs = [];
    var pts = [];
    var lastGridT = 0;

    function resize() {
      var w = wrap.offsetWidth;
      var h = Math.max(wrap.offsetHeight, window.innerHeight);
      gC.width = w;
      gC.height = h;
      orbs = orbDefs.map(function (o) {
        return {
          x: o.x * w, y: o.y * h,
          vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.2,
          c: o.c, s: o.s, phase: Math.random() * Math.PI * 2
        };
      });
      drawGrid(); seedParticles();
    }

    function drawGrid() {
      var W = gC.width, H = gC.height;
      gx.clearRect(0, 0, W, H); gx.strokeStyle = 'rgba(255,255,255,0.025)'; gx.lineWidth = 0.5;
      for (var x = 0; x <= W; x += CELL) { gx.beginPath(); gx.moveTo(x, 0); gx.lineTo(x, H); gx.stroke(); }
      for (var y = 0; y <= H; y += CELL) { gx.beginPath(); gx.moveTo(0, y); gx.lineTo(W, y); gx.stroke(); }
    }

    function seedParticles() {
      var W = gC.width, H = gC.height;
      var COUNT = Math.max(80, Math.floor(W * H / 8000));
      var colorSplit = [0.18, 0.32, 0.42];
      pts = [];
      for (var i = 0; i < COUNT; i++) {
        var r = Math.random();
        var cat = r < colorSplit[0] ? 'amber' : r < colorSplit[1] ? 'teal' : r < colorSplit[2] ? 'green' : 'white';
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 1.5 + 0.5, c: cat, pulse: Math.random() * Math.PI * 2
        });
      }
    }

    var COLOR_MAP = { amber: '245,158,11', teal: '6,182,212', green: '34,197,94' };

    function loop(now) {
      now = now || 0;
      var W = gC.width, H = gC.height, ax = gC.getContext('2d');
      if (now - lastGridT > 2000) { drawGrid(); lastGridT = now; }
      ax.clearRect(0, 0, W, H);

      for (var o = 0; o < orbs.length; o++) {
        var ob = orbs[o];
        ob.x += ob.vx; ob.y += ob.vy; ob.phase += 0.008;
        if (ob.x < -ob.s) ob.x = W + ob.s;
        if (ob.x > W + ob.s) ob.x = -ob.s;
        if (ob.y < -ob.s) ob.y = H + ob.s;
        if (ob.y > H + ob.s) ob.y = -ob.s;
        var alpha = 0.018 + Math.sin(ob.phase) * 0.008;
        var og = ax.createRadialGradient(ob.x, ob.y, 0, ob.x, ob.y, ob.s);
        og.addColorStop(0, col(ob.c, alpha)); og.addColorStop(1, col(ob.c, 0));
        ax.fillStyle = og;
        ax.beginPath(); ax.arc(ob.x, ob.y, ob.s, 0, Math.PI * 2); ax.fill();
      }

      for (var i = 0; i < pts.length; i++) {
        for (var j = i + 1; j < pts.length; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < 160) {
            var a = (1 - d / 160) * 0.28;
            var cSame = pts[i].c !== 'white' ? (pts[i].c === pts[j].c ? COLOR_MAP[pts[i].c] : '255,255,255') : (pts[j].c !== 'white' ? COLOR_MAP[pts[j].c] : '255,255,255');
            ax.beginPath(); ax.moveTo(pts[i].x, pts[i].y); ax.lineTo(pts[j].x, pts[j].y);
            ax.strokeStyle = col(cSame, a); ax.lineWidth = 0.5; ax.stroke();
          }
        }
      }

      for (var k = 0; k < pts.length; k++) {
        var p = pts[k];
        p.pulse += 0.018;
        var ps = 1 + Math.sin(p.pulse) * 0.35;
        if (p.c !== 'white') {
          var gc = COLOR_MAP[p.c], gSize = 14 * ps;
          var gl = ax.createRadialGradient(p.x, p.y, 0, p.x, p.y, gSize);
          gl.addColorStop(0, col(gc, 0.18)); gl.addColorStop(0.5, col(gc, 0.06)); gl.addColorStop(1, 'rgba(0,0,0,0)');
          ax.fillStyle = gl; ax.beginPath(); ax.arc(p.x, p.y, gSize, 0, Math.PI * 2); ax.fill();
        }
        ax.beginPath(); ax.arc(p.x, p.y, p.r * ps, 0, Math.PI * 2);
        ax.fillStyle = p.c === 'white' ? 'rgba(255,255,255,.5)' : 'rgba(255,255,255,.9)';
        ax.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
      }
      requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    requestAnimationFrame(function () { resize(); loop(); });
  }

  // FLAVORS
  function initGlobe() {
    var host = document.querySelector('.hero-globe');
    if (!host) return;
    if (window.innerWidth < 900) return;

    var size   = 560;
    var canvas = document.createElement('canvas');
    canvas.id = 'globeCanvas';
    canvas.width = canvas.height = size;
    canvas.style.cssText = 'display:block;margin:0 auto;width:100%;height:100%';
    host.insertBefore(canvas, host.firstChild);

    var ctx = canvas.getContext('2d');
    var R   = size / 2 - 30;
    var cx  = size / 2;
    var cy  = size / 2;
    var rot = 0;
    var time = 0;

    function proj(lon, lat) {
      var ph = (lon + rot) * Math.PI / 180;
      var th = (90 - lat) * Math.PI / 180;
      var sT = Math.sin(th), cT = Math.cos(th);
      var sP = Math.sin(ph), cP = Math.cos(ph);
      return { x: cx + R * sT * cP, y: cy - R * cT, z: R * sT * sP };
    }

    function visible(p, margin) {
      return p.z > -R * (margin || 0.05);
    }

    var continents = {
      SA: [[-80,10],[-77,8],[-73,12],[-70,12],[-62,10],[-55,5],[-50,0],
           [-45,-2],[-40,-3],[-35,-5],[-38,-8],[-39,-12],[-40,-16],[-41,-20],
           [-43,-22],[-45,-23],[-47,-24],[-49,-26],[-50,-28],[-51,-30],[-52,-32],[-54,-34],
           [-58,-34],[-60,-34],[-62,-37],[-64,-40],[-64,-43],[-65,-46],[-66,-50],
           [-68,-53],[-70,-52],[-72,-48],[-72,-42],[-73,-36],[-72,-30],[-71,-22],[-70,-18],
           [-71,-14],[-72,-10],[-75,-8],[-77,-4],[-80,0],[-79,3],[-78,6],[-80,10]],
      NA: [[-130,50],[-128,52],[-130,55],[-135,58],[-140,60],[-145,62],[-150,62],
           [-155,62],[-165,65],[-168,67],[-165,70],[-160,72],[-150,72],[-140,70],[-130,68],
           [-120,68],[-110,66],[-100,62],[-92,60],[-85,62],[-78,62],[-70,60],[-62,47],
           [-66,44],[-70,42],[-72,41],[-75,38],[-78,36],[-80,32],[-82,30],[-84,28],
           [-86,29],[-88,28],[-90,28],[-92,28],[-94,28],[-97,26],[-100,28],[-103,28],
           [-105,22],[-110,24],[-115,30],[-118,34],[-120,36],[-122,38],[-124,42],
           [-125,44],[-128,48],[-130,50]],
      EU: [[-10,36],[-8,38],[-9,40],[-8,44],[-5,44],[0,44],[2,43],[3,44],[5,44],[3,48],
           [0,48],[-2,48],[0,51],[3,51],[5,52],[5,54],[8,55],[10,55],[12,55],[15,55],
           [18,55],[22,55],[25,56],[28,58],[30,60],[28,65],[26,70],[22,70],[20,68],
           [15,68],[10,62],[5,60],[5,58],[12,56],[14,54],[18,54],[15,52],[14,50],
           [14,48],[16,48],[18,48],[20,46],[22,44],[25,42],[26,42],[28,41],[26,38],
           [24,36],[20,36],[15,38],[12,38],[10,36],[5,36],[0,36],[-5,36],[-10,36]],
      AF: [[-16,14],[-17,18],[-16,22],[-13,28],[-8,33],[-5,36],[0,36],[5,37],[8,37],
           [10,36],[12,34],[15,32],[20,32],[25,32],[30,32],[33,30],[35,30],[38,28],
           [40,25],[42,18],[44,12],[48,8],[50,4],[48,2],[45,0],[42,-5],[40,-10],
           [38,-16],[35,-22],[32,-26],[28,-32],[25,-34],[20,-35],[18,-34],[17,-28],
           [16,-24],[14,-20],[12,-16],[10,-10],[8,-5],[5,0],[2,5],[0,5],[-2,5],
           [-5,5],[-8,5],[-10,6],[-13,8],[-15,10],[-16,14]],
      AS: [[30,38],[35,40],[40,42],[45,40],[50,42],[55,45],[60,50],[65,55],[70,55],
           [80,55],[90,55],[100,55],[110,52],[120,55],[130,52],[135,48],[140,46],
           [142,44],[140,40],[138,36],[135,36],[130,34],[126,34],[122,30],[120,28],
           [118,24],[115,22],[110,20],[108,18],[106,16],[105,14],[103,12],[100,14],
           [100,10],[98,8],[100,5],[102,2],[105,2],[108,5],[110,10],[112,15],[115,12],
           [118,16],[120,20],[122,22],[124,24],[120,26],[118,30],[115,34],[110,35],
           [105,30],[100,28],[95,28],[90,28],[88,22],[85,26],[82,28],[78,30],[75,28],
           [72,24],[68,24],[65,26],[62,28],[60,30],[58,25],[55,26],[52,28],[50,30],
           [48,35],[45,38],[40,40],[35,38],[30,38]],
      OC: [[115,-14],[118,-16],[122,-16],[126,-14],[130,-12],[134,-12],[137,-12],
           [140,-15],[142,-14],[145,-16],[148,-18],[150,-22],[152,-26],[154,-28],
           [152,-32],[150,-35],[148,-38],[145,-38],[140,-38],[136,-35],[134,-34],
           [130,-32],[125,-30],[120,-28],[118,-26],[115,-22],[114,-24],[113,-26],
           [114,-28],[115,-30],[116,-32],[118,-34],[120,-34],[122,-32],[125,-28],
           [128,-26],[130,-24],[132,-22],[134,-18],[136,-15],[138,-16],[140,-18],
           [142,-20],[145,-22],[148,-22],[150,-24],[152,-26],[148,-20],[144,-16],
           [140,-12],[136,-14],[132,-14],[128,-16],[124,-18],[120,-20],[118,-18],[115,-14]]
    };

    var contColors = {
      SA: '34,197,94', NA: '6,182,212', EU: '139,92,246',
      AF: '245,158,11', AS: '59,130,246', OC: '20,184,166'
    };

    // Pontos de terra
    var allLand = [];
    function seedLand(poly, n) {
      var minL = Infinity, maxL = -Infinity, minA = Infinity, maxA = -Infinity;
      for (var v = 0; v < poly.length; v++) {
        minL = Math.min(minL, poly[v][0]); maxL = Math.max(maxL, poly[v][0]);
        minA = Math.min(minA, poly[v][1]); maxA = Math.max(maxA, poly[v][1]);
      }
      var c = 0, t = 0;
      while (c < n && t < n * 80) {
        t++;
        var lo = minL + Math.random() * (maxL - minL);
        var la = minA + Math.random() * (maxA - minA);
        if (ptInPoly(lo, la, poly)) {
          allLand.push({
            lon: lo + (Math.random() - 0.5) * 2,
            lat: la + (Math.random() - 0.5) * 1.5
          });
          c++;
        }
      }
    }
    seedLand(continents.SA, 120);
    seedLand(continents.NA, 150);
    seedLand(continents.EU, 80);
    seedLand(continents.AF, 130);
    seedLand(continents.AS, 200);
    seedLand(continents.OC, 80);

    var cities = [
      { lon: -51.93, lat: -23.42, main: true },
      { lon: -51.16, lat: -23.31 },
      { lon: -49.27, lat: -25.43 },
      { lon: -46.63, lat: -23.55 },
      { lon: -43.17, lat: -22.91 },
      { lon: -47.88, lat: -15.79 },
      { lon: -38.51, lat: -12.97 }
    ];

    // Partículas orbitais
    function makeOrbitPts(count, speed) {
      var arr = [];
      for (var i = 0; i < count; i++) {
        arr.push({ a: (i / count) * Math.PI * 2, sp: speed });
      }
      return arr;
    }
    var orb1 = makeOrbitPts(150,  0.5);
    var orb2 = makeOrbitPts(100, -0.35);
    var orb3 = makeOrbitPts(60,   0.2);

    // Estrelas
    var stars = [];
    for (var si = 0; si < 280; si++) {
      stars.push({
        x: Math.random() * size,
        y: Math.random() * size,
        r: Math.random() * 1.3 + 0.2,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 0.035 + 0.008,
        br: Math.random()
      });
    }

    var nebs = [
      { ox: 120, oy: -80,  r: 180, c: '245,158,11', a: 0.014, ph: 0   },
      { ox:-100, oy: 60,   r: 150, c: '139,92,246',  a: 0.012, ph: 1.5 },
      { ox:  60, oy: 130,  r: 130, c: '6,182,212',   a: 0.010, ph: 3   },
      { ox:-130, oy: -60,  r: 160, c: '34,197,94',   a: 0.009, ph: 4.5 }
    ];

    function drawOrbitRing(pts, tiltX, tiltY, rx, ry, baseR, offset, c) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltX);
      ctx.scale(1, tiltY);
      for (var i = 0; i < pts.length; i++) {
        var o = pts[i];
        o.a += o.sp / 60;
        var ox = Math.cos(o.a) * (baseR + offset);
        var oy = Math.sin(o.a) * (baseR + offset);
        var oa = rx + Math.sin(o.a * 3 + time * 2) * ry;
        ctx.beginPath(); ctx.arc(ox, oy, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = col(c, oa);
        ctx.fill();
      }
      ctx.restore();
    }

    function draw() {
      rot  += 0.12;
      time += 1 / 60;
      ctx.clearRect(0, 0, size, size);

      // Estrelas
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.ph += s.sp;
        var tw = Math.abs(Math.sin(s.ph));
        var al = 0.15 + tw * 0.5 * (0.5 + s.br * 0.5);
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.8 + tw * 0.2), 0, Math.PI * 2);
        ctx.fillStyle = s.br > 0.7
          ? col('245,200,140', al)
          : col('255,255,255', al);
        ctx.fill();
      }

      // Nebulosas
      for (var ni = 0; ni < nebs.length; ni++) {
        var nb = nebs[ni];
        nb.ph += nb.a;
        var na = nb.a + Math.sin(nb.ph) * nb.a * 0.5;
        var ng = ctx.createRadialGradient(cx + nb.ox, cy + nb.oy, 0, cx + nb.ox, cy + nb.oy, nb.r);
        ng.addColorStop(0, col(nb.c, na));
        ng.addColorStop(1, col(nb.c, 0));
        ctx.fillStyle = ng;
        ctx.beginPath(); ctx.arc(cx + nb.ox, cy + nb.oy, nb.r, 0, Math.PI * 2); ctx.fill();
      }

      // Anéis orbitais
      drawOrbitRing(orb1,  0.3,  0.35, R, 15, 0.2, 0.12, '245,158,11');
      drawOrbitRing(orb2, -0.4,  0.3,  R, 25, 0.15, 0.1, '6,182,212');
      drawOrbitRing(orb3,  0.15, 0.4,  R, 38, 0.15, 0.08,'34,197,94');

      // Atmosfera
      var ap = 1 + Math.sin(time * 0.8) * 0.04;
      for (var ag = 6; ag >= 0; ag--) {
        var ar = (R + 10 + ag * 14) * ap;
        var aa = 0.035 - ag * 0.004;
        var aG = ctx.createRadialGradient(cx, cy, R, cx, cy, ar);
        aG.addColorStop(0,   col('245,158,11', aa));
        aG.addColorStop(0.4, col('139,92,246',  aa * 0.6));
        aG.addColorStop(0.7, col('6,182,212',   aa * 0.3));
        aG.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(cx, cy, ar, 0, Math.PI * 2);
        ctx.fillStyle = aG; ctx.fill();
      }

      // Oceano
      var ocean = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.05, cx, cy, R);
      ocean.addColorStop(0,   '#1a4070');
      ocean.addColorStop(0.15,'#14305a');
      ocean.addColorStop(0.4, '#0e2040');
      ocean.addColorStop(0.7, '#0a1830');
      ocean.addColorStop(1,   '#060f20');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = ocean; ctx.fill();

      // Specular
      var sp = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.3, 0, cx - R * 0.35, cy - R * 0.3, R * 0.4);
      sp.addColorStop(0,   'rgba(255,255,255,0.18)');
      sp.addColorStop(0.4, 'rgba(130,200,255,0.06)');
      sp.addColorStop(1,   'rgba(255,255,255,0)');
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = sp; ctx.fill();

      // Grade lat/lon
      ctx.strokeStyle = 'rgba(255,255,255,0.07)';
      ctx.lineWidth = 0.5;
      var first, p;
      for (var la = -80; la <= 80; la += 15) {
        ctx.beginPath(); first = true;
        for (var lo = 0; lo <= 360; lo += 3) {
          p = proj(lo - 180, la);
          if (visible(p)) { if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y); }
          else first = true;
        }
        ctx.stroke();
      }
      for (var lo2 = 0; lo2 < 360; lo2 += 20) {
        ctx.beginPath(); first = true;
        for (var la2 = -90; la2 <= 90; la2 += 3) {
          p = proj(lo2, la2);
          if (visible(p)) { if (first) { ctx.moveTo(p.x, p.y); first = false; } else ctx.lineTo(p.x, p.y); }
          else first = true;
        }
        ctx.stroke();
      }

      // Contornos dos continentes
      var contKeys = ['SA','NA','EU','AF','AS','OC'];
      for (var ci = 0; ci < contKeys.length; ci++) {
        var key  = contKeys[ci];
        var clr  = contColors[key];
        var poly = continents[key];
        ctx.beginPath();
        var started = false;
        for (var vi = 0; vi < poly.length; vi++) {
          p = proj(poly[vi][0], poly[vi][1]);
          if (visible(p)) {
            if (!started) { ctx.moveTo(p.x, p.y); started = true; }
            else ctx.lineTo(p.x, p.y);
          } else {
            started = false;
          }
        }
        if (started) {
          ctx.strokeStyle = col(clr, 0.12); ctx.lineWidth = 8;   ctx.stroke();
          ctx.strokeStyle = col(clr, 0.25); ctx.lineWidth = 4;   ctx.stroke();
          ctx.strokeStyle = col(clr, 0.7);  ctx.lineWidth = 1.5; ctx.stroke();
        }
      }

      // Pontos de terra
      for (var li = 0; li < allLand.length; li++) {
        p = proj(allLand[li].lon, allLand[li].lat);
        if (!visible(p)) continue;
        var depth = 0.3 + 0.7 * (Math.max(0, p.z) / R);
        var absLat = Math.abs(allLand[li].lat);
        var cr, cg, cb;
        if (absLat < 25)       { cr = 34;  cg = 200; cb = 94;  }
        else if (absLat < 50)  { cr = 6;   cg = 185; cb = 215; }
        else                   { cr = 220; cg = 230; cb = 245; }
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.0 + 0.5 * depth, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (0.2 + depth * 0.65) + ')';
        ctx.fill();
      }

      // Cidades
      for (var cii = 0; cii < cities.length; cii++) {
        var city = cities[cii];
        p = proj(city.lon, city.lat);
        if (!visible(p, 0.12)) continue;
        var isMain = city.main;

        if (isMain) {
          var wg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 45);
          wg.addColorStop(0, 'rgba(245,158,11,0.15)');
          wg.addColorStop(0.5, 'rgba(245,158,11,0.04)');
          wg.addColorStop(1, 'transparent');
          ctx.fillStyle = wg; ctx.beginPath(); ctx.arc(p.x, p.y, 45, 0, Math.PI * 2); ctx.fill();

          for (var ring = 0; ring < 3; ring++) {
            var ph = ((time * 0.5 + ring * 0.33) % 1);
            ctx.beginPath(); ctx.arc(p.x, p.y, 6 + ph * 28, 0, Math.PI * 2);
            ctx.strokeStyle = col('245,158,11', (1 - ph) * 0.5);
            ctx.lineWidth = 1.5; ctx.stroke();
          }

          var cg2 = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 35);
          cg2.addColorStop(0,   'rgba(245,158,11,0.45)');
          cg2.addColorStop(0.4, 'rgba(245,158,11,0.1)');
          cg2.addColorStop(1,   'transparent');
          ctx.fillStyle = cg2; ctx.beginPath(); ctx.arc(p.x, p.y, 35, 0, Math.PI * 2); ctx.fill();
        } else {
          var sg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 14);
          sg.addColorStop(0, 'rgba(34,197,94,0.2)');
          sg.addColorStop(1, 'transparent');
          ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill();
        }

        ctx.shadowColor = isMain ? '#f59e0b' : 'rgba(34,197,94,0.5)';
        ctx.shadowBlur  = isMain ? 16 : 6;
        ctx.beginPath(); ctx.arc(p.x, p.y, isMain ? 7 : 3 + 2 * (p.z / R), 0, Math.PI * 2);
        ctx.fillStyle = isMain
          ? '#f59e0b'
          : col('34,197,94', 0.6 + 0.4 * (p.z / R));
        ctx.fill();
        ctx.shadowBlur = 0;

        if (isMain) {
          ctx.textAlign = 'center';
          ctx.font = 'bold 12px "DM Sans",sans-serif';
          ctx.fillStyle = 'rgba(245,158,11,1)';
          ctx.fillText('Maringá', p.x, p.y - 20);
          ctx.font = '500 9px "DM Sans",sans-serif';
          ctx.fillStyle = 'rgba(34,197,94,0.85)';
          ctx.fillText('Entrega grátis', p.x, p.y - 32);
          ctx.font = '400 8px "DM Sans",sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.fillText('PR, Brasil', p.x, p.y + 30);
        }
      }

      // Borda
      ctx.beginPath(); ctx.arc(cx, cy, R - 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 2; ctx.stroke();

      requestAnimationFrame(draw);
    }

    var obs = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { draw(); obs.unobserve(host); }
    }, { threshold: 0.1 });
    obs.observe(host);
  }


  function initFlavors() {
    var flavors = [
      { name: 'Acai Ice',          tag: 'Gelado · Frutado',       cat: 'frutado',   icon: 'fa-solid fa-lemon'       },
      { name: 'Artic Gum',         tag: 'Refrescante · Mentolado', cat: 'mentolado', icon: 'fa-solid fa-snowflake'   },
      { name: 'Frozen Mint',       tag: 'Gelado · Intenso',       cat: 'gelado',    icon: 'fa-solid fa-icicles'     },
      { name: 'Menthol',           tag: 'Puro · Classico',        cat: 'mentolado', icon: 'fa-solid fa-wind'        },
      { name: 'Ice Mint+',         tag: 'Fresco · Gelado',        cat: 'gelado',    icon: 'fa-solid fa-droplet'     },
      { name: 'Blueberry Lemon',   tag: 'Acido · Frutado',        cat: 'frutado',   icon: 'fa-solid fa-lemon'       },
      { name: 'Grape Ice',         tag: 'Gelado · Uva',           cat: 'gelado',    icon: 'fa-solid fa-wine-bottle' },
      { name: 'Blueberry Frozen',  tag: 'Doce · Natural',         cat: 'frutado',   icon: 'fa-solid fa-apple-whole' },
      { name: 'Strawberry Kiwi',   tag: 'Tropical · Acido',       cat: 'frutado',   icon: 'fa-solid fa-seedling'    },
      { name: 'Watermelon Ice',    tag: 'Refrescante · Doce',     cat: 'frutado',   icon: 'fa-solid fa-water'       },
      { name: 'Lime Mango',        tag: 'Citrico · Tropical',     cat: 'tropical',  icon: 'fa-solid fa-sun'         },
      { name: 'Frozen Strawberry', tag: 'Gelado · Morango',       cat: 'gelado',    icon: 'fa-solid fa-candy-cane'  }
    ];

    var catIcons = {
      gelado: '<i class="fa-solid fa-snowflake"></i>', frutado: '<i class="fa-solid fa-lemon"></i>',
      mentolado: '<i class="fa-solid fa-wind"></i>', tropical: '<i class="fa-solid fa-sun"></i>'
    };
    var catColors = {
      gelado: '#06b6d4', frutado: '#f59e0b', mentolado: '#3b82f6', tropical: '#22c55e'
    };

    var cur = 0, activeCat = 'all';
    var fwrap = document.getElementById('fwrap');
    var pfName = document.getElementById('pfName');
    var pfTag = document.getElementById('pfTag');
    var pfDot = document.getElementById('pfDot');
    var pfHint = document.getElementById('pcsHint');
    var prodAcquireBtn = document.getElementById('prodAcquireBtn');

    var catBar = document.createElement('div');
    catBar.className = 'cat-filter-bar';
    var allBtn = document.createElement('button');
    allBtn.className = 'cat-filter active';
    allBtn.innerHTML = '<span>Todos</span>';
    allBtn.setAttribute('data-cat', 'all');
    catBar.appendChild(allBtn);

    ['gelado', 'frutado', 'mentolado', 'tropical'].forEach(function (ct) {
      var btn = document.createElement('button');
      btn.className = 'cat-filter';
      btn.setAttribute('data-cat', ct);
      btn.innerHTML = catIcons[ct] + '<span>' + ct.charAt(0).toUpperCase() + ct.slice(1) + '</span>';
      catBar.appendChild(btn);
    });

    if (fwrap && fwrap.parentNode) fwrap.parentNode.insertBefore(catBar, fwrap);

    if (fwrap) {
      flavors.forEach(function (f, i) {
        var b = document.createElement('button');
        b.className = 'fflavor' + (i === 0 ? ' active' : '');
        b.setAttribute('data-cat', f.cat);
        b.setAttribute('data-idx', i);
        b.innerHTML = '<span class="fflavor-icon"><i class="' + f.icon + '"></i></span><span class="fflavor-name">' + f.name + '</span>';
        b.addEventListener('click', function () { setFlavor(i); });
        fwrap.appendChild(b);
      });
    }

    catBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.cat-filter');
      if (!btn) return;
      catBar.querySelectorAll('.cat-filter').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-cat');
      applyCatFilter();
    });

    function applyCatFilter() {
      if (!fwrap) return;
      fwrap.querySelectorAll('.fflavor').forEach(function (b) {
        var cat = b.getAttribute('data-cat');
        b.style.display = (activeCat === 'all' || cat === activeCat) ? '' : 'none';
      });
      var curBtn = fwrap.querySelector('.fflavor[data-idx="' + cur + '"]');
      if (curBtn && curBtn.style.display === 'none') {
        var firstVisible = fwrap.querySelector('.fflavor:not([style*="display: none"])');
        if (firstVisible) {
          var idx = parseInt(firstVisible.getAttribute('data-idx'));
          if (!isNaN(idx)) setFlavor(idx);
        }
      }
    }

    function buildMsg(qty) {
      var f = flavors[cur];
      if (qty === 1) {
        return 'Ola! Vim pelo site Junin e quero comprar 1 unidade do Ignite V80 — sabor ' + f.name + ' (' + f.tag + ').';
      }
      if (qty === 2) {
        return 'Ola! Vim pelo site Junin e quero o Combo Duplo (2 unidades): 1x ' + f.name + ' (+ outro sabor diferente). Como funciona a entrega?';
      }
      return 'Ola! Vim pelo site Junin e quero saber mais sobre o Ignite V80 sabor ' + f.name + ' (' + f.tag + '). Pode me ajudar?';
    }

    function setFlavor(i) {
      cur = i;
      var f = flavors[i], cc = catColors[f.cat];
      if (pfName) pfName.textContent = f.name;
      if (pfTag) { pfTag.textContent = f.tag; pfTag.style.color = cc; }
      if (pfDot) { pfDot.style.background = cc; pfDot.style.boxShadow = '0 0 10px ' + cc + ', 0 0 20px ' + cc; }
      if (pfHint) pfHint.style.opacity = '0';
      var img = document.getElementById('prodImg');
      if (img) {
        img.style.transform = 'scale(0.88) rotate(-3deg)'; img.style.opacity = '0.6';
        setTimeout(function () { img.style.transform = ''; img.style.opacity = ''; }, 280);
      }
      if (fwrap) {
        fwrap.querySelectorAll('.fflavor').forEach(function (b, j) { b.classList.toggle('active', j === i); });
      }
    }

    var pImg = document.getElementById('prodImg');
    if (pImg) { pImg.addEventListener('click', function () { setFlavor((cur + 1) % flavors.length); }); }
    if (prodAcquireBtn) { prodAcquireBtn.addEventListener('click', function () { openWhatsApp(buildMsg(0)); }); }
    window._junin_buildMsg = buildMsg;
  }

  // NAVBAR
  function initNavbar() {
    var navbar = document.getElementById('navbar');
    var navMenu = document.getElementById('navMenu');
    var navTog = document.getElementById('navToggle');
    var navClose = document.getElementById('navClose');
    var prodSection = document.getElementById('produtos');

    if (window.innerWidth < 769) {
      prodSection.style.display = 'block';
      if (navMenu) navMenu.classList.remove('open');
    }

    if (navTog && navMenu) {
      navTog.addEventListener('click', function () {
        navMenu.classList.add('open');
        navTog.style.display = 'none';
        if (navClose) navClose.style.display = 'block';
      });
    }
    if (navClose && navMenu) {
      navClose.addEventListener('click', function () {
        navMenu.classList.remove('open');
        navClose.style.display = 'none';
        if (navTog) navTog.style.display = '';
      });
    }

    document.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var h = link.getAttribute('href');
        if (!h || h.indexOf('#') !== 0) return;
        e.preventDefault();
        var target = document.getElementById(h.substring(1));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        document.querySelectorAll('.nav-link').forEach(function (l) { l.classList.remove('active'); });
        link.classList.add('active');
        if (navMenu) { navMenu.classList.remove('open'); navClose.style.display = 'none'; if (navTog) navTog.style.display = ''; }
      });
    });

    var secsAll = document.querySelectorAll('.section');
    var nlinks = document.querySelectorAll('.nav-link[data-section]');

    if (navbar) {
      window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 30);
        if (!secsAll.length || !nlinks.length) return;
        var current = 'inicio';
        secsAll.forEach(function (s) {
          if (s.offsetTop && window.scrollY >= s.offsetTop - 150) current = s.id;
        });
        nlinks.forEach(function (l) { l.classList.toggle('active', l.getAttribute('data-section') === current); });
      });
    }

    if (window.innerWidth < 769) { prodSection.style.display = 'block'; }
  }

  // ACQUIRE BUTTONS
  function initAcquireButtons() {
    document.querySelectorAll('.acquire-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var q = parseInt(btn.getAttribute('data-qty')) || 0;
        var msg = window._junin_buildMsg ? window._junin_buildMsg(q) : '';
        openWhatsApp(msg);
      });
    });
  }

  // COOKIES
  function initCookies() {
    var b = document.getElementById('cookieBanner');
    if (!b) return;
    var ac = document.getElementById('cookieAccept');
    if (localStorage.getItem('cookie_consent')) return;
    setTimeout(function () { b.classList.add('show'); }, 1500);
    if (ac) {
      ac.addEventListener('click', function () {
        localStorage.setItem('cookie_consent', 'true');
        b.classList.remove('show');
      });
    }
  }

  // SCROLL ANIMATIONS
  function initScrollAnimations() {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('[data-animate]').forEach(function (el) { obs.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
