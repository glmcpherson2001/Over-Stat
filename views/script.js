
// Slideshow Code
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {
  let i;
  let slides = document.getElementsByClassName("mySlides");
  let slideContainer = document.querySelector('.slideshow-container');
  let dots = document.getElementsByClassName("dot");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  for (i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }
  var slideType = document.activeElement.id;
  if (slideIndex === 1){
    slideContainer.style.backgroundImage = "url(slideshow_imgs/tank_slide.png)"
    }
  else if(slideIndex === 2){
    slideContainer.style.backgroundImage = "url(slideshow_imgs/damage_slide.jpg)"
  }
  else if (slideIndex === 3){
    slideContainer.style.backgroundImage = "url(slideshow_imgs/support_slide.png)"
  }
  slides[slideIndex-1].style.display = "flex";
  dots[slideIndex-1].className += " active";
}

setInterval(function() {
  plusSlides(1);
}, 10000);