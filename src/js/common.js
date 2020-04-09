import device from "current-device";
import { disablePageScroll, enablePageScroll } from 'scroll-lock';
import slick from "slick-carousel";
import 'lazysizes';
lazySizes.cfg.lazyClass = 'lazy';
lazySizes.cfg.loadedClass = 'loaded';
lazySizes.cfg.init = false;
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
gsap.registerPlugin(ScrollToPlugin);
document.addEventListener('lazybeforeunveil', function(e){
  let el = e.target.tagName,
      bg = e.target.getAttribute('data-src');
  if(el!=='IMG') {
    let bg = e.target.getAttribute('data-src');
    e.target.style.backgroundImage = 'url(' + bg + ')';
  }
});



$(document).ready(function(){
  hoverTouchEvents();
  header();
  scroll();
  nav.init();
  services();
})

window.onload = function() {
  lazySizes.init();
  preloader.hide();
  if(device.desktop()) {
    parallax();
    $(window).on('scroll', function() {
      parallax();
    })
  }
};


//preloader
let preloader = {
  element: $('.preloader'),
  hide: function() {
    let $this = preloader.element,
        $item = $this.find('.preloader__item'),
        speed = 1;
    gsap.timeline()
      .to($item, {duration:speed, attr:{y:0}, ease:'power2.out'})
      .to($item, {duration:speed, attr:{y:'-100%'}, ease:'power2.out'})
      .to($this, {duration:speed, autoAlpha:0, ease:'power2.out'}, `-=${speed}`)
      .fromTo('.wrapper', {autoAlpha:0}, {duration:speed, autoAlpha:1, ease:'power2.in'}, `-=${speed}`)
  }
}

//hover/touch custom events
function hoverTouchEvents() {
  $(document).on('mouseenter mouseleave touchstart touchend mousedown mouseup', 'a, button, .js-touch-hover', function(event) {
    if(event.type=='touchstart' && !device.desktop()) {
      $(this).addClass('touch');
    } else if(event.type=='mouseenter' && device.desktop()) {
      $(this).addClass('hover');
    } else if(event.type=='mousedown' && device.desktop()) {
      $(this).addClass('mousedown');
    } else if(event.type=='mouseup' && device.desktop()) {
      $(this).removeClass('mousedown');
    } else {
      $(this).removeClass('touch');
      $(this).removeClass('hover');
      $(this).removeClass('mousedown');
    }
  })
}

function header() {
  let $header = $('.header'), 
      height = $header.height();

  check();
  $(window).scroll(function() {
    check();
  });

  function check() {
    let scroll = $(window).scrollTop();
    if(($(window).width()<=1024 && scroll>0) || ($(window).width()>1024 && scroll>height)){
      $header.addClass('fixed');
    } else {
      $header.removeClass('fixed');
    }
  }
  
}

function scroll() {
  let $button = $('.scrollTo'),
      $section = $('.section'),
      $header = $('.header'),
      height = $header.height(),
      inscroll = false,
      animation;

  $button.on('click', function(event) {
    event.preventDefault();

    let $block = $(this).attr('href');

    if($block.length>0) {

      inscroll = true;

      $button.removeClass('active');
      $button.filter(`[href='${$block}']`).addClass('active');

      if(animation!==undefined) {
        animation.pause();
      }
      if(nav.state) {
        nav.close();
      }
      animation = gsap.to(window, {duration: 1, scrollTo:{y:$block, offsetY:height}, ease:'power2.inOut', onComplete: function() {
        inscroll = false;
      }});

    }

  })

  check();
  $(window).on('scroll', function() {
    check();
  });

  function check() {
    if(!inscroll) {
      let position = $(window).scrollTop();
      $section.each(function() {
        let top = $(this).offset().top - height,
            bottom = top + $(this).outerHeight();

        if (position >= top && position <= bottom) {
          $button.removeClass('active');
          $button.filter(`[href='#${$(this).attr('id')}']`).addClass('active');
        }
      }); 
    }
  }
  
}

//navigation
let nav = {
  el: $('.nav'),
  toggle: $('.nav-toggle'),
  state: false,
  available: true,
  init: function() {

    nav.animation = gsap.timeline({paused:true})
      .to(nav.toggle.find('span:first-child'), {duration:0.5, y:8, ease:'power2.in'})
      .to(nav.toggle.find('span:last-child'), {duration:0.5, y:-8, ease:'power2.in'}, '-=0.5')
      .set(nav.toggle.find('span:nth-child(2)'),{scaleX:0})
      .to(nav.toggle.find('span:first-child'), {duration:0.5, rotation:45, ease:'power2.out'})
      .to(nav.toggle.find('span:last-child'), {duration:0.5, rotation:135, ease:'power2.out'}, '-=0.5')
      .fromTo(nav.el.find('.nav__item'), {autoAlpha:0}, {immediateRender:false, autoAlpha:1,ease:'power2.inOut', duration:0.8, stagger:{amount:0.2,from:'end'}}, '-=1')
      .fromTo(nav.el.find('.nav__item'), {y:-200}, {immediateRender:false, y:0,ease:'power2.out', duration:0.8, stagger:{amount:0.2,from:'end'}}, '-=1')
    
    nav.toggle.on('click', function(event){
      event.preventDefault();
      if(nav.available==true) {
        nav.available=false;
        if(nav.state==false) {
          nav.open();
        } else {
          nav.close();
        }
      }
    })

    $(window).on('resize',()=>{
      if($(window).width()>1024 && this.state==true) {
        nav.close();
      }
    })

  },
  open: function() {
    nav.state=true;
    nav.animation.play();
    nav.toggle.addClass('disabled');
    //disable page scrolling
    disablePageScroll();
    $('.header').addClass('nav-active');
    nav.animation.eventCallback("onComplete",()=>{
      nav.available=true;
    });
  },
  close: function() {
    nav.state=false;
    nav.animation.reverse();
    //enable page scrolling
    enablePageScroll();
    setTimeout(function(){
      $('.header').removeClass('nav-active');
    },500)
    nav.animation.eventCallback("onReverseComplete",()=>{
      nav.available=true;
      nav.toggle.removeClass('disabled');
    });
  }
}

function parallax() {
  let scene = $('.background');
  scene.each(function() {
    let y = $(this).parents('.section').offset().top,
        scroll = $(window).scrollTop(),
        val = (scroll-y)/4;
    $(this).css('transform', `translate3d(0, ${val}px, 0)`)
  })
}

function services() {
  let $block = $('.services-block'),
      $parralax,
      $interval;

  $block.on('click', function() {
    $(this).toggleClass('active');
    $(this).find('.services-block__content').slideToggle(250);

    clearInterval($parralax);
    clearTimeout($interval)
    $parralax = setInterval(function() {
      parallax()
    }, 10)
    $interval = setTimeout(function() {
      clearInterval($parralax)
    },250)
  })
}