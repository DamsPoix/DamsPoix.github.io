document.addEventListener('DOMContentLoaded', function(){

  var nav=document.querySelector('nav');
  if(nav){
    var onScroll=function(){ nav.classList.toggle('scrolled', window.scrollY>24); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
  }

  var navToggle=document.getElementById('navToggle');
  var navMenu=document.getElementById('navMenu');
  var navBackdrop=document.getElementById('navBackdrop');
  if(navToggle && navMenu){
    var closeMenu=function(){
      navToggle.classList.remove('open');
      navMenu.classList.remove('open');
      if(navBackdrop) navBackdrop.classList.remove('open');
      document.body.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded','false');
    };
    var openMenu=function(){
      navToggle.classList.add('open');
      navMenu.classList.add('open');
      if(navBackdrop) navBackdrop.classList.add('open');
      document.body.classList.add('nav-open');
      navToggle.setAttribute('aria-expanded','true');
    };
    navToggle.addEventListener('click', function(){
      if(navMenu.classList.contains('open')) closeMenu(); else openMenu();
    });
    if(navBackdrop) navBackdrop.addEventListener('click', closeMenu);
    navMenu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', closeMenu); });
    window.addEventListener('resize', function(){ if(window.innerWidth>680) closeMenu(); });
  }

  document.querySelectorAll('a[href$=".html"]').forEach(function(a){
    var href=a.getAttribute('href');
    if(!href || href.indexOf('http')===0 || a.target==='_blank') return;
    a.addEventListener('click', function(e){
      if(e.metaKey||e.ctrlKey||e.shiftKey||e.button!==0) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(function(){ window.location.href=href; }, 300);
    });
  });

  if(window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray('.reveal').forEach(function(el){
      gsap.fromTo(el, {opacity:0,y:30}, {
        opacity:1, y:0, duration:.9, ease:'power3.out',
        scrollTrigger:{trigger:el, start:'top 88%'}
      });
    });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('reveal-ready'); });
  }
});
