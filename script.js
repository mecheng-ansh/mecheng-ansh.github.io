/* ============================================================
   ANSH PANJABI — PORTFOLIO
   Shared behaviour: nav, mobile menu, scroll reveal,
   contact form, and the 3D gear hero.
   ============================================================ */

document.documentElement.classList.remove('no-js');
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', function () {

  /* ---- nav background on scroll ---- */
  var nav = document.querySelector('.nav');
  function onScroll(){ if(nav){ nav.classList.toggle('scrolled', window.scrollY > 24); } }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive:true });

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.nav-toggle');
  var overlay = document.querySelector('.nav-overlay');
  function closeMenu(){ if(overlay){ overlay.classList.remove('open'); document.body.classList.remove('menu-open'); toggle && toggle.setAttribute('aria-expanded','false'); } }
  if (toggle && overlay) {
    toggle.addEventListener('click', function(){
      var open = overlay.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    overlay.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') closeMenu(); });
  }

  /* ---- scroll reveal ---- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold:0.12, rootMargin:'0px 0px -8% 0px' });
    reveals.forEach(function(el){ io.observe(el); });
  } else {
    reveals.forEach(function(el){ el.classList.add('in'); });
  }

  /* ---- footer year ---- */
  var y = document.getElementById('year'); if(y){ y.textContent = new Date().getFullYear(); }

  /* ---- contact form -> opens email client, no backend needed ---- */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var name = (form.querySelector('#cf-name')||{}).value || '';
      var from = (form.querySelector('#cf-email')||{}).value || '';
      var msg  = (form.querySelector('#cf-msg')||{}).value || '';
      var subject = encodeURIComponent('Portfolio enquiry from ' + (name || 'someone'));
      var body = encodeURIComponent(msg + '\n\n' + name + (from ? '\n' + from : ''));
      window.location.href = 'mailto:ansh.panjabi99@gmail.com?subject=' + subject + '&body=' + body;
    });
  }

  /* ---- 3D gear hero ---- */
  initGear();
});

function initGear(){
  var canvas = document.getElementById('gear-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:true, alpha:true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  function sizeTo(){
    var w = canvas.clientWidth || canvas.parentElement.clientWidth;
    var h = canvas.clientHeight || canvas.parentElement.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  /* build a gear profile */
  function gearShape(teeth, tip, root, hole){
    var shape = new THREE.Shape();
    var step = (Math.PI * 2) / teeth;
    for (var i = 0; i < teeth; i++){
      var b = i * step;
      var a1 = b, r1 = root;
      var a2 = b + step * 0.20, r2 = tip;
      var a3 = b + step * 0.55, r3 = tip;
      var a4 = b + step * 0.75, r4 = root;
      if (i === 0) shape.moveTo(Math.cos(a1)*r1, Math.sin(a1)*r1);
      else shape.lineTo(Math.cos(a1)*r1, Math.sin(a1)*r1);
      shape.lineTo(Math.cos(a2)*r2, Math.sin(a2)*r2);
      shape.lineTo(Math.cos(a3)*r3, Math.sin(a3)*r3);
      shape.lineTo(Math.cos(a4)*r4, Math.sin(a4)*r4);
    }
    shape.closePath();
    var h = new THREE.Path();
    h.absarc(0, 0, hole, 0, Math.PI * 2, true);
    shape.holes.push(h);
    return shape;
  }

  var geo = new THREE.ExtrudeGeometry(gearShape(16, 1.45, 1.18, 0.5), {
    depth: 0.5, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.05, bevelSegments: 2, curveSegments: 24
  });
  geo.center();

  var metal = new THREE.MeshStandardMaterial({ color:0x222838, metalness:0.92, roughness:0.34, emissive:0x0a1a18, emissiveIntensity:0.4 });
  var gear = new THREE.Mesh(geo, metal);

  var edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geo, 32),
    new THREE.LineBasicMaterial({ color:0x34F0CB, transparent:true, opacity:0.55 })
  );

  var group = new THREE.Group();
  group.add(gear); group.add(edges);
  group.rotation.x = -0.45;
  scene.add(group);

  /* lights */
  scene.add(new THREE.AmbientLight(0x3a4358, 0.7));
  var key = new THREE.DirectionalLight(0xcdd9ff, 1.1); key.position.set(3, 4, 5); scene.add(key);
  var pA = new THREE.PointLight(0x34F0CB, 1.5, 18); pA.position.set(-4, -1, 3); scene.add(pA);
  var pB = new THREE.PointLight(0x6E7BFF, 1.0, 18); pB.position.set(3, -3, 2); scene.add(pB);

  sizeTo();
  window.addEventListener('resize', sizeTo);

  /* mouse parallax */
  var tx = 0, ty = 0, cx = 0, cy = 0;
  if (!reduce) {
    var host = canvas.closest('.hero') || document.body;
    host.addEventListener('pointermove', function(e){
      var r = host.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 0.5;
    });
  }

  var t = 0;
  function loop(){
    requestAnimationFrame(loop);
    if (document.hidden) return;
    t += 0.016;
    if (!reduce){
      group.rotation.z += 0.006;
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      group.rotation.y = cx;
      group.rotation.x = -0.45 + cy;
      group.position.y = Math.sin(t) * 0.06;
    } else {
      group.rotation.z = 0.3;
    }
    renderer.render(scene, camera);
  }
  loop();
}


/* ---- drawing-pack slideshows ---- */
(function(){
  document.querySelectorAll('[data-slides]').forEach(function(frame){
    var slides = frame.querySelectorAll('.slide');
    if(slides.length < 2) return;
    var count = frame.querySelector('.slide-count');
    var i = 0;
    function show(n){
      i = (n + slides.length) % slides.length;
      slides.forEach(function(el, k){ el.classList.toggle('active', k === i); });
      if(count) count.textContent = (i + 1) + ' / ' + slides.length;
    }
    var prev = frame.querySelector('.prev');
    var next = frame.querySelector('.next');
    if(prev) prev.addEventListener('click', function(e){ e.preventDefault(); show(i - 1); });
    if(next) next.addEventListener('click', function(e){ e.preventDefault(); show(i + 1); });
    show(0);
  });
})();

/* ---- fullscreen lightbox for frame images and videos ---- */
(function(){
  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = '<button class="lb-close" aria-label="Close">&#215;</button>' +
    '<button class="lb-btn lb-prev" aria-label="Previous">&#8249;</button>' +
    '<div class="lb-stage"></div>' +
    '<button class="lb-btn lb-next" aria-label="Next">&#8250;</button>' +
    '<span class="lb-count mono"></span>';
  document.body.appendChild(overlay);

  var stage = overlay.querySelector('.lb-stage');
  var lbCount = overlay.querySelector('.lb-count');
  var prevBtn = overlay.querySelector('.lb-prev');
  var nextBtn = overlay.querySelector('.lb-next');
  var group = [], idx = 0;

  function clearStage(){
    var v = stage.querySelector('video');
    if(v){ v.pause(); v.removeAttribute('src'); v.load(); }
    stage.innerHTML = '';
  }
  function render(){
    clearStage();
    var el = group[idx];
    var node;
    if(el.tagName === 'VIDEO'){
      node = document.createElement('video');
      node.src = el.getAttribute('data-full') || el.getAttribute('src');
      node.controls = true; node.autoplay = true; node.loop = true;
      node.muted = true; node.playsInline = true;
    } else {
      node = document.createElement('img');
      node.src = el.src; node.alt = el.alt || '';
    }
    node.className = 'lb-img';
    stage.appendChild(node);
    var multi = group.length > 1;
    lbCount.textContent = multi ? (idx + 1) + ' / ' + group.length : '';
    prevBtn.style.display = multi ? 'grid' : 'none';
    nextBtn.style.display = multi ? 'grid' : 'none';
    lbCount.style.display = multi ? 'block' : 'none';
  }
  function openLb(items, i){ group = items; idx = i; render(); overlay.classList.add('on'); document.body.style.overflow = 'hidden'; }
  function closeLb(){ clearStage(); overlay.classList.remove('on'); document.body.style.overflow = ''; }

  prevBtn.addEventListener('click', function(e){ e.stopPropagation(); idx = (idx - 1 + group.length) % group.length; render(); });
  nextBtn.addEventListener('click', function(e){ e.stopPropagation(); idx = (idx + 1) % group.length; render(); });
  overlay.querySelector('.lb-close').addEventListener('click', closeLb);
  overlay.addEventListener('click', function(e){ if(e.target === overlay) closeLb(); });
  document.addEventListener('keydown', function(e){
    if(!overlay.classList.contains('on')) return;
    if(e.key === 'Escape') closeLb();
    if(e.key === 'ArrowLeft') prevBtn.click();
    if(e.key === 'ArrowRight') nextBtn.click();
  });

  document.querySelectorAll('.frame').forEach(function(frame){
    var items = Array.prototype.slice.call(frame.querySelectorAll('img, video'));
    items.forEach(function(el, i){
      el.addEventListener('click', function(){ openLb(items, i); });
    });
  });
})();