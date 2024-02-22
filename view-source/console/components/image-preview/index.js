$(function () {
  let el = void 0;

  const previewHtml = url => {
    const html = `
    <div data-preview class="image-preview flex-center-center">
      <div class="flex-center-center">
        <img src="${url}" onerror="javascript:this.src='/statics/images/404.png'" />
        <div class="close">
            <i class="mdi mdi-close mdi-24px"></i>
        </div>
      </div>
    </div>
    `;
    return html;
  };

  function getMaxZindex() {
    let highestZIndex = 0;
    let highestEl = void 0;
    const elements = document.getElementsByTagName('*');
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      var elementZIndex = parseInt(getComputedStyle(element).zIndex, 10);
      if (elementZIndex > highestZIndex) {
        highestZIndex = elementZIndex;
        highestEl = element;
      }
    }
    return {
      highestEl,
      highestZIndex
    };
  }

  window.lycoris.events.on('image-previe.show', function (url) {
    if (el && el.length) {
      el.find('img').attr('src', url);
    } else {
      const html = previewHtml(url);
      $('body').append(html);
      el = $('div.image-preview[data-preview]');

      el.find('div.close').on('click', function (e) {
        e.stopPropagation();
        el.fadeOut();
      });

      el.on('click', 'div.card', function (e) {
        e.stopPropagation();
      });

      el.on('click', function (e) {
        e.stopPropagation();
        if (e.target in el) {
          return;
        }

        el.find('div.close').trigger('click');
      });

      $(document).on('keydown.esc', function (e) {
        if (el.css('display') == 'flex') {
          e.preventDefault();
          e.stopPropagation();
          el.fadeOut();
        }
      });
    }

    const maxZindex = getMaxZindex();

    if (maxZindex.highestEl != el) {
      el.css({
        'z-index': maxZindex.highestZIndex + 1
      });
    }

    el.fadeIn().css('display', 'flex');
  });
});
