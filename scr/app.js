/* =====================================================
   JUNIN SHOP - JAVASCRIPT
   ===================================================== */
(function(){
'use strict';

function init(){

    /* ══════════════════════════════════════
       1. CANVAS BACKGROUND — Grid + Particles
       Modelo direto: fundo wrapper com resize confiavel
    ══════════════════════════════════════ */
    (function(){
        var wrap = document.querySelector('.fundo');
        if(!wrap) return;
        var gC = document.getElementById('gridCanvas');
        var pC = document.getElementById('particlesCanvas');
        if(!gC || !pC) return;
        var gx = gC.getContext('2d');
        var px = pC.getContext('2d');
        var CELL = 34;

        function resize(){
            var w = wrap.offsetWidth;
            var h = Math.max(wrap.offsetHeight, window.innerHeight);
            gC.width = pC.width = w;
            gC.height = pC.height = h;
            drawGrid();
        }

        function drawGrid(){
            var W = gC.width, H = gC.height;
            gx.clearRect(0,0,W,H);
            gx.fillStyle = '#0e0e0e';
            gx.fillRect(0,0,W,H);
            gx.strokeStyle = 'rgba(255,255,255,0.055)';
            gx.lineWidth = 0.5;
            for(var x = 0; x <= W; x += CELL){ gx.beginPath(); gx.moveTo(x,0); gx.lineTo(x,H); gx.stroke(); }
            for(var y = 0; y <= H; y += CELL){ gx.beginPath(); gx.moveTo(0,y); gx.lineTo(W,y); gx.stroke(); }
        }

        // Pontos animados (aleatorios)
        var pts = [];
        function seed(){
            var COUNT = Math.max(50, Math.floor(pC.width * pC.height / 12000));
            pts = [];
            var W = pC.width, H = pC.height;
            for(var i = 0; i < COUNT; i++){
                var r = Math.random();
                pts.push({
                    x: Math.random()*W, y: Math.random()*H,
                    vx: (Math.random()-.5)*.35, vy: (Math.random()-.5)*.35,
                    r: Math.random()*1.4+.4,
                    c: r<.12?'amber':r<.22?'teal':r<.30?'green':'white'
                });
            }
        }
        function col(p,a){
            var map = {
                amber: 'rgba(245,158,11,'+a+')',
                teal:  'rgba(6,182,212,'+a+')',
                green: 'rgba(34,197,94,'+a+')',
                white: 'rgba(255,255,255,'+a+')'
            };
            return map[p.c];
        }

        function loop(){
            var W = pC.width, H = pC.height;
            px.clearRect(0,0,W,H);

            // Linhas de conexao
            for(var i=0;i<pts.length;i++){
                for(var j=i+1;j<pts.length;j++){
                    var dx = pts[i].x-pts[j].x;
                    var dy = pts[i].y-pts[j].y;
                    var d  = Math.sqrt(dx*dx+dy*dy);
                    if(d<130){
                        var a = (1-d/130)*.2;
                        px.beginPath();
                        px.moveTo(pts[i].x, pts[i].y);
                        px.lineTo(pts[j].x, pts[j].y);
                        px.strokeStyle = 'rgba(255,255,255,'+a+')';
                        px.lineWidth = 0.5;
                        px.stroke();
                    }
                }
            }

            // Pontos + glow
            for(var k=0;k<pts.length;k++){
                var p = pts[k];
                // glow
                if(p.c !== 'white'){
                    var gl = px.createRadialGradient(p.x,p.y,0,p.x,p.y,10);
                    gl.addColorStop(0, col(p,.15));
                    gl.addColorStop(1, 'rgba(0,0,0,0)');
                    px.fillStyle = gl;
                    px.beginPath(); px.arc(p.x,p.y,10,0,Math.PI*2); px.fill();
                }
                px.beginPath(); px.arc(p.x,p.y,p.r,0,Math.PI*2);
                px.fillStyle = col(p, p.c==='white'?.55:.9); px.fill();

                p.x += p.vx; p.y += p.vy;
                if(p.x<0||p.x>W) p.vx*=-1;
                if(p.y<0||p.y>H) p.vy*=-1;
            }
            requestAnimationFrame(loop);
        }

        window.addEventListener('resize', function(){ resize(); seed(); });
        // init on next tick after layout
        requestAnimationFrame(function(){ resize(); seed(); loop(); });
    })();


    /* ══════════════════════════════════════
       2. PRODUCTS TAB BAR
    ══════════════════════════════════════ */
    (function(){
        var tabBar=document.getElementById('prodTabBar');
        if(!tabBar) return;
        tabBar.querySelectorAll('.prod-tab').forEach(function(tab){
            tab.addEventListener('click',function(){
                tabBar.querySelectorAll('.prod-tab').forEach(function(t){t.classList.remove('active')});
                tab.classList.add('active');
                document.querySelectorAll('.prod-tab-panel').forEach(function(p){p.classList.remove('active')});
                document.getElementById(tab.getAttribute('data-panel')).classList.add('active');
            });
        });
    })();


    /* ══════════════════════════════════════
       3. GLOBO TERRA — Canvas com Maringa pin
       Injetado dentro de .hero-globe
    ══════════════════════════════════════ */
    (function(){
        var host = document.querySelector('.hero-globe');
        if(!host) return;
        if(window.innerWidth < 900) return;

        var size = 480;
        var C = document.createElement('canvas');
        C.width = size; C.height = size;
        host.insertBefore(C, host.firstChild);

        var ctx = C.getContext('2d');
        var R = size/2 - 16;
        var cx = size/2, cy = size/2;
        var rot = 0;
        var time = 0;

        // Continentes como nuvem de pontos
        var land = [];
        function region(poly, n){
            var minL=Infinity,maxL=-Infinity,minA=Infinity,maxA=-Infinity;
            poly.forEach(function(v){minL=Math.min(minL,v[0]);maxL=Math.max(maxL,v[0]);minA=Math.min(minA,v[1]);maxA=Math.max(maxA,v[1])});
            var c=0,t=0;
            while(c<n && t<n*60){t++;
                var lo=minL+Math.random()*(maxL-minL), la=minA+Math.random()*(maxA-minA);
                if(ptInPoly(lo,la,poly)){land.push({lon:lo+(Math.random()-.5)*4, lat:la+(Math.random()-.5)*3});c++}
            }
        }
        function ptInPoly(x,y,p){
            var ins=false;
            for(var i=0,j=p.length-1;i<p.length;j=i++){
                var xi=p[i][0],yi=p[i][1],xj=p[j][0],yj=p[j][1];
                if(((yi>y)!==(yj>y)) && (x<(xj-xi)*(y-yi)/(yj-yi)+xi)) ins=!ins;
            }
            return ins;
        }

        var SA=[[-80,10],[-35,-5],[-35,-15],[-40,-23],[-50,-30],[-55,-33],[-68,-52],[-74,-48],[-72,-35],[-70,-18],[-78,-2],[-80,10]];
        var NA=[[-130,50],[-120,60],[-100,65],[-85,70],[-75,62],[-60,47],[-75,35],[-82,30],[-90,28],[-97,26],[-105,22],[-115,30],[-125,42],[-130,50]];
        var EU=[[-10,36],[0,38],[5,44],[0,52],[5,54],[10,55],[20,55],[30,60],[28,45],[20,36],[10,36],[-10,36]];
        var AF=[[-15,12],[-17,20],[-13,28],[-5,36],[10,37],[30,32],[33,30],[40,12],[40,-5],[35,-15],[30,-25],[18,-35],[12,-18],[8,5],[2,5],[-10,8],[-15,12]];
        var AS=[[30,38],[50,42],[60,55],[80,55],[100,55],[110,50],[120,55],[135,45],[130,35],[110,22],[95,15],[88,22],[80,28],[68,24],[60,38],[40,42],[30,38]];
        var OC=[[115,-14],[130,-12],[140,-15],[148,-20],[153,-27],[150,-35],[140,-38],[130,-34],[118,-22],[115,-14]];
        region(SA,50); region(NA,60); region(EU,35); region(AF,55); region(AS,80); region(OC,28);

        // Cidades Brasil
        var cities = [
            {n:'Maringá', lon:-51.93, lat:-23.42, main:true},
            {n:'Londrina', lon:-51.16, lat:-23.31},
            {n:'Curitiba', lon:-49.27, lat:-25.43},
            {n:'S. Paulo', lon:-46.63, lat:-23.55},
            {n:'Rio', lon:-43.17, lat:-22.91}
        ];

        function proj(lon,lat){
            var ph=(lon+rot)*Math.PI/180, th=(90-lat)*Math.PI/180;
            var sT=Math.sin(th),cT=Math.cos(th),sP=Math.sin(ph),cP=Math.cos(ph);
            return { x:cx+R*sT*cP, y:cy-R*cT, z:R*sT*sP };
        }

        function draw(){
            rot += .15;
            time += 1/60;
            ctx.clearRect(0,0,size,size);

            // Esfera base
            var bg=ctx.createRadialGradient(cx-R*.2,cy-R*.2,R*.1,cx,cy,R);
            bg.addColorStop(0,'rgba(22,24,42,.95)'); bg.addColorStop(1,'rgba(8,8,16,.98)');
            ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
            ctx.fillStyle=bg; ctx.fill();

            // Grade
            ctx.strokeStyle='rgba(255,255,255,.035)'; ctx.lineWidth=.5;
            for(var la=-80;la<=80;la+=20){
                ctx.beginPath();
                var f=true;
                for(var lo=0;lo<=360;lo+=5){
                    var p=proj(lo-180,la);
                    if(p.z>-R*.1){if(f){ctx.moveTo(p.x,p.y);f=false}else ctx.lineTo(p.x,p.y)}
                }
                ctx.stroke();
            }
            for(var lo2=0;lo2<360;lo2+=30){
                ctx.beginPath(); f=true;
                for(var la2=-90;la2<=90;la2+=5){
                    var p2=proj(lo2,la2);
                    if(p2.z>-R*.1){if(f){ctx.moveTo(p2.x,p2.y);f=false}else ctx.lineTo(p2.x,p2.y)}
                }
                ctx.stroke();
            }

            // Pontos dos continentes
            for(var i=0;i<land.length;i++){
                var p=proj(land[i].lon,land[i].lat);
                if(p.z>0){
                    ctx.beginPath(); ctx.arc(p.x,p.y,1.2,0,Math.PI*2);
                    ctx.fillStyle='rgba(255,255,255,'+(0.2+0.4*(p.z/R))+')'; ctx.fill();
                }
            }

            // Cidades
            cities.forEach(function(city){
                var p=proj(city.lon,city.lat);
                if(p.z>20){
                    var sz=2.5+1.5*(p.z/R);
                    var isMain=city.main;

                    if(isMain){
                        // Triple pulse rings
                        for(var ring=0;ring<3;ring++){
                            var ph=((time*.8+ring*.33)%1);
                            var rr=6+ph*18, ra=(1-ph)*.55;
                            ctx.beginPath(); ctx.arc(p.x,p.y,rr,0,Math.PI*2);
                            ctx.strokeStyle='rgba(245,158,11,'+ra+')'; ctx.lineWidth=1.5; ctx.stroke();
                        }
                        // Glow
                        var gg=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,22);
                        gg.addColorStop(0,'rgba(245,158,11,.3)'); gg.addColorStop(1,'transparent');
                        ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(p.x,p.y,22,0,Math.PI*2); ctx.fill();
                    }

                    ctx.shadowColor=isMain?'#f59e0b':'rgba(34,197,94,.5)';
                    ctx.shadowBlur=isMain?10:4;
                    ctx.beginPath(); ctx.arc(p.x,p.y,isMain?5:sz,0,Math.PI*2);
                    ctx.fillStyle=isMain?'#f59e0b':'rgba(34,197,94,'+(0.5+0.5*(p.z/R))+')';
                    ctx.fill();
                    ctx.shadowBlur=0;

                    if(isMain){
                        ctx.font='600 10px "DM Sans",sans-serif';
                        ctx.fillStyle='rgba(245,158,11,.9)'; ctx.textAlign='center';
                        ctx.fillText('Maringá',p.x,p.y-14);
                        ctx.font='500 8px "DM Sans",sans-serif';
                        ctx.fillStyle='rgba(34,197,94,.7)';
                        ctx.fillText('Entrega grátis',p.x,p.y-24);
                    }
                }
            });

            // Rim atmosfera
            ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
            ctx.strokeStyle='rgba(245,158,11,.12)'; ctx.lineWidth=1.5; ctx.stroke();
            requestAnimationFrame(draw);
        }

        // Start globe after hero is visible
        var obs = new IntersectionObserver(function(en){
            if(en[0].isIntersecting){ draw(); obs.unobserve(host); }
        },{threshold:.1});
        obs.observe(host);

    })();


    /* ══════════════════════════════════════
       3. FLAVOR BUTTONS
    ══════════════════════════════════════ */
    var flavors = [
        {name:'Acai Ice',         tag:'Gelado · Frutado',       cat:'frutado'},
        {name:'Artic Gum',        tag:'Refrescante · Mentolado', cat:'mentolado'},
        {name:'Frozen Mint',      tag:'Gelado · Intenso',       cat:'gelado'},
        {name:'Menthol',          tag:'Puro · Classico',        cat:'mentolado'},
        {name:'Ice Mint+',        tag:'Fresco · Gelado',        cat:'gelado'},
        {name:'Blueberry Lemon',  tag:'Acido · Frutado',        cat:'frutado'},
        {name:'Grape Ice',        tag:'Gelado · Uva',           cat:'gelado'},
        {name:'Blueberry Frozen', tag:'Doce · Natural',         cat:'frutado'},
        {name:'Strawberry Kiwi',  tag:'Tropical · Acido',       cat:'frutado'},
        {name:'Watermelon Ice',   tag:'Refrescante · Doce',     cat:'frutado'},
        {name:'Lime Mango',       tag:'Citrico · Tropical',     cat:'tropical'},
        {name:'Frozen Strawberry',tag:'Gelado · Morango',       cat:'gelado'}
    ];
    var catColors = { gelado:'#06b6d4', frutado:'#f59e0b', mentolado:'#3b82f6', tropical:'#22c55e' };
    var cur = 0;
    var fwrap = document.getElementById('fwrap');
    var pfName = document.getElementById('pfName');
    var pfTag  = document.getElementById('pfTag');
    var pfDot  = document.getElementById('pfDot');
    var pfHint = document.getElementById('pcsHint');
    var prodAcquireBtn = document.getElementById('prodAcquireBtn');
    var zapQty = 0; // 0 = sem quantidade, 1 = 1un, 2 = 2un

    if(fwrap){
        flavors.forEach(function(f,i){
            var b = document.createElement('button');
            b.className = 'fflavor'+(i===0?' active':'');
            b.setAttribute('data-cat', f.cat);
            b.innerHTML = '<span class="fflavor-name">'+f.name+'</span>';
            b.addEventListener('click',function(){setFlavor(i)});
            fwrap.appendChild(b);
        });
    }

    // Build WhatsApp message based on current flavor + qty
    function buildZapMsg(){
        var f=flavors[cur];
        if(zapQty===0){
            return 'Ola! Vim pelo site Junin Shop e quero saber mais sobre o Ignite V80 sabor '+f.name+' ('+f.tag+'). Pode me ajudar?';
        } else if(zapQty===1){
            return 'Ola! Vim pelo site Junin Shop e quero comprar 1 unidade do Ignite V80 — sabor '+f.name+' ('+f.tag+').';
        } else {
            return 'Ola! Vim pelo site Junin Shop e quero o Combo Duplo (2 unidades): 1x '+f.name+' (+ outro sabor diferente). Como funciona a entrega?';
        }
    }

    function setFlavor(i){
        cur=i;
        var f=flavors[i];
        // Update flavor display
        if(pfName) pfName.textContent = f.name;
        if(pfTag) pfTag.textContent = f.tag;
        if(pfDot){
            var cc=catColors[f.cat];
            pfDot.style.background=cc;
        }
        if(pfTag) pfTag.style.color = catColors[f.cat];
        // Animate image
        var img=document.getElementById('prodImg');
        if(img){img.style.transform='scale(0.88) rotate(-3deg)';img.style.opacity='.6';setTimeout(function(){img.style.transform='';img.style.opacity=''},280)}
        // Update active state
        document.querySelectorAll('.fflavor').forEach(function(b,j){b.classList.toggle('active',j===i)});
        // Hide hint
        if(pfHint) pfHint.style.opacity='0';
    }
    var pImg=document.getElementById('prodImg');
    if(pImg) pImg.addEventListener('click',function(){setFlavor((cur+1)%flavors.length)});


    /* ══════════════════════════════════════
       4. NAVBAR
    ══════════════════════════════════════ */
    var navbar = document.getElementById('navbar');
    var navMenu = document.getElementById('navMenu');
    var navTog = document.getElementById('navToggle');

    if(navTog && navMenu) navTog.addEventListener('click',function(){navMenu.classList.toggle('open')});

    document.querySelectorAll('.nav-link').forEach(function(link){
        link.addEventListener('click',function(e){
            var h=link.getAttribute('href');
            if(!h||!h.startsWith('#')) return;
            e.preventDefault();
            var t=document.getElementById(h.slice(1));
            if(t) t.scrollIntoView({behavior:'smooth',block:'start'});
            document.querySelectorAll('.nav-link').forEach(function(l){l.classList.remove('active')});
            link.classList.add('active');
            if(navMenu) navMenu.classList.remove('open');
        });
    });

    // Scroll spy vars + merged scroll handler
    var secsAll=document.querySelectorAll('.section');
    var nlinksAll=document.querySelectorAll('.nav-link[data-section]');

    if(navbar) window.addEventListener('scroll',function(){
        navbar.classList.toggle('scrolled',window.scrollY>30);
        if(secsAll.length && nlinksAll.length){
            var c='inicio';
            secsAll.forEach(function(s){if(window.scrollY>=s.offsetTop-150)c=s.id});
            nlinksAll.forEach(function(l){l.classList.toggle('active',l.dataset.section===c)});
        }
    });

    // Scroll animations
    var sObs=new IntersectionObserver(function(en){
        en.forEach(function(e){if(e.isIntersecting){e.target.classList.add('visible');sObs.unobserve(e.target)}});
    },{threshold:.1});
    document.querySelectorAll('[data-animate]').forEach(function(el){sObs.observe(el)});


    /* ══════════════════════════════════════
       6. ADQUIRE BUTTONS — direct WhatsApp
    ══════════════════════════════════════ */
    // Product main "Adquirir Agora" button
    if(prodAcquireBtn) prodAcquireBtn.addEventListener('click',function(){
        var msg=buildZapMsg();
        window.open('https://wa.me/554499663436?text='+encodeURIComponent(msg),'_blank');
    });
    // Offer card "Adquirir" buttons
    document.querySelectorAll('.acquire-btn').forEach(function(btn){
        btn.addEventListener('click',function(){
            var q=parseInt(btn.getAttribute('data-qty'))||0;
            zapQty=q;
            var msg=buildZapMsg();
            window.open('https://wa.me/554499663436?text='+encodeURIComponent(msg),'_blank');
        });
    });


    /* ══════════════════════════════════════
       5. COOKIES
    ══════════════════════════════════════ */
    (function(){
        var b=document.getElementById('cookieBanner');
        if(!b) return;
        var ac=document.getElementById('cookieAccept');
        var st=document.getElementById('cookieSettings');
        var pn=document.getElementById('cookieSettingsPnl');
        var an=document.getElementById('cookieAnalytics');
        var ok=localStorage.getItem('cookie_consent');
        if(ok){if(an&&localStorage.getItem('cookie_analytics')==='true')an.classList.add('on');return}
        setTimeout(function(){b.classList.add('show')},1500);
        if(ac) ac.addEventListener('click',function(){
            var a=an&&an.classList.contains('on');
            localStorage.setItem('cookie_consent','true');
            localStorage.setItem('cookie_analytics',a?'true':'false');
            b.classList.remove('show');
        });
        if(st) st.addEventListener('click',function(){pn.classList.toggle('open')});
        if(an) an.addEventListener('click',function(){an.classList.toggle('on')});
    })();

} // end init

if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init)}
else{init()}

})();
