(function() {

    var windowH = $(window).height(),
    documElem = $(document),
        slideDownPage = $('.welcome-msg'),
        content = $('.content'),
        btns = $('.btn'),
        animSpeed = 500;

    slideDownPage.css({
        height: windowH + 'px',
        top: -windowH + 'px'
    });

    btns.on('click', function(e) {
      if ( $(this).hasClass('artist') ) {
          slideDownPage.animate({'top': 0}, animSpeed);
          content.animate({'margin-top': windowH + "px"}, animSpeed);
      }
      else {
          slideDownPage.animate({ 'top': -windowH + 'px'}, animSpeed);
          content.animate({ 'margin-top': 0}, animSpeed); 
      }
      e.preventDefault();
    });
    
    documElem.on('scroll', function() {
if ( $(this).scrollTop() > slideDownPage.height() && slideDownPage.css('top') === '0px' ) {
    slideDownPage.css('top', -windowH + 'px');
    content.css('margin-top', 0);
    documElem.scrollTop(0);
}
    });



})();