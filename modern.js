document.addEventListener('DOMContentLoaded', function(){

  var nav=document.querySelector('nav');
  if(nav){
    var onScroll=function(){ nav.classList.toggle('scrolled', window.scrollY>24); };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive:true});
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
