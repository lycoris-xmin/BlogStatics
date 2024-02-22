$(function () {
  const doms = {
    post: {
      busy: $('div.post-list').lineBusy(),
      body: $('div.post-list').find('ul')
    },
    category: $('.category'),
    pagination: $('div.pagination-btn').find('ul.pagination')
  };

  const model = {
    pageIndex: 1,
    pageSize: 10,
    category: void 0,
    maxPageIndex: 1
  };

  const debounceGetPostList = $.debounce(getPostList, 500);

  doms.category.find('li').on('click', function () {
    //
    if ($(this).hasClass('active')) {
      return;
    }

    doms.category.find('.active').removeClass('active');
    $(this).addClass('active');

    model.category = $(this).attr('data-category');

    debounceGetPostList();
  });

  doms.category.find('.mdi').on('click', function () {
    const card = $(this).parent().parent();
    const height = $(this).parent().prev()[0].getBoundingClientRect().height;

    if ($(this).hasClass('show')) {
      $(this).removeClass('show');
      card.css('height', '72px');
    } else {
      $(this).addClass('show');
      card.css('height', `${height + 40}px`);
    }
  });

  function createPostCardHtml(list) {
    let html = '';

    if (list && list.length) {
      for (let item of list) {
        html = html.concat(`
        <li class="card">
          <div class="icon">
              <img data-src="${item.icon}" onerror="javascript:this.src='/statics/images/404.png'" class="lazyload"/>
          </div>
          <div class="post">
            <div>
                <div class="title flex-start-center">
                    <span class="post-badge post-badge-${item.type == 0 ? 'primary' : 'purple'}">${item.type == 0 ? '原创' : '转载'}</span>
                    <a href="/post/${item.id}">${item.title}</a>
                </div>
                <div class="info">
                    <p class="info-text">${item.info}</p>
                    <div class="flex-start-center">
                        <div class="${item.categoryName ? 'category-link' : ''}">${item.categoryName || '未分类'}</div>

                        <div class="has-icon"><i class="mdi mdi-cards-heart"></i><span class="value">${item.browse}</span></div>

                        <div class="has-icon"><i class="mdi mdi-comment"></i><span class="value">${item.comment}</span></div>

                        ${createTags(item.tags)}
                    </div>
                </div>
            </div>
          </div>
        </li>
        `);
      }
    }

    function createTags(tags) {
      let h = '';
      if (tags && tags.length) {
        h = h.concat('<div class="tags">');

        for (let tag of tags) {
          h = h.concat(`<span>${tag}</span>`);
        }

        h = h.concat('</div>');
      }

      return h;
    }

    return html;
  }

  async function getPostList() {
    doms.post.busy.show();
    doms.post.body.html('');
    try {
      const request = $.createHttpRequest();
      request.url = '/post/list';
      request.data = {
        pageIndex: model.pageIndex,
        pageSize: model.pageSize
      };

      if (model.category) {
        request.data.category = model.category;
      }

      const res = await request.get();
      if (res && res.resCode == 0) {
        model.maxPageIndex = $.getMaxPageIndex(res.data.count, model.pageSize);

        const html = createPostCardHtml(res.data.list);
        if (html) {
          doms.post.body.html(html);
          window.lycoris.lazysizes();
        }
      }
    } finally {
      doms.post.busy.hide();
    }
  }

  function createPagination(currentPage) {
    currentPage = currentPage || 1;
    if (model.maxPageIndex > 1) {
      const pageArray = $.getPageNumber(currentPage, model.maxPageIndex);

      let html = '';

      html = `
    <li class="page-item page-btn" data-index="-1">
      <span class="page-link">上一页</span>
    </li>
    `;

      for (let item of pageArray) {
        html += `
      <li class="page-item page-number ${item == currentPage ? 'active' : ''}" data-index="${item}">
        <span class="page-link">${item}</span>
      </li>
      `;
      }

      html += `
    <li class="page-item page-btn" data-index="1">
      <span class="page-link">下一页</span>
    </li>
    `;

      doms.pagination.html(html);

      registerPaginationClick();
    } else {
      doms.pagination.parent().remove();
    }
  }

  function registerPaginationClick() {
    doms.pagination.find('>li.page-number').on('click', async function () {
      const pageIndex = $(this).data('index');
      if (model.pageIndex != pageIndex) {
        model.pageIndex = pageIndex;
        if (model.maxPageIndex > pageIndex) {
          createPagination($(this).data('index'));
        } else {
          doms.pagination.find('>li.page-number').removeClass('active');
          $(this).addClass('active');
        }

        await getPostList();
      }
    });

    doms.pagination.find('>li.page-btn').on('click', function () {
      const index = parseInt($(this).data('index'));

      let pageIndex = model.pageIndex + index;
      if (pageIndex < 1 || pageIndex > model.maxPageIndex) {
        return;
      }

      doms.pagination.find(`>li.page-number[data-index="${pageIndex}"]`).trigger('click');
    });
  }

  function clockInit() {
    try {
      const size = parseInt($('div.clock').find('.column').css('font-size').replace('px', ''));
      let columns = [...$('div.clock').find('.column')];
      let d, c;
      let classList = ['visible', 'close', 'far', 'far', 'distant', 'distant'];
      let use24HourClock = true;

      function padClock(p, n) {
        return p + ('0' + n).slice(-2);
      }

      function getClock() {
        d = new Date();
        return [use24HourClock ? d.getHours() : d.getHours() % 12 || 12, d.getMinutes(), d.getSeconds()].reduce(padClock, '');
      }

      function getClass(n, i2) {
        return classList.find((class_, classIndex) => Math.abs(n - i2) === classIndex) || '';
      }

      const h = $('div.clock').height();

      setInterval(() => {
        c = getClock();

        columns.forEach((ele, i) => {
          let n = +c[i];
          let offset = -n * size;
          ele.style.transform = `translateY(calc(${h / 2}px + ${offset}px - ${size / 2}px))`;
          Array.from(ele.children).forEach((ele2, i2) => {
            ele2.className = 'num ' + getClass(n, i2);
          });
        });
      }, 200 + Math.E * 10);
    } catch (error) {
      console.error(error);
    }
  }

  async function getPostRecommendList() {
    try {
      const request = $.createHttpRequest();
      request.url = '/post/recommend/list';
      const res = await request.get();
      if (res && res.resCode == 0) {
        return res.data.list;
      }
      return [];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async function carouselInit() {
    const carousel = $('div.carousel');
    let scrollTimer = void 0;
    let list = await getPostRecommendList();

    if (list && list.length) {
      if (list.length < 3) {
        list = [...list, ...list];
      }

      let html = '';

      list.forEach(x => (html = html.concat(createCarouselitem(x))));

      carousel.find('.wrap').html(html);

      const width = carousel.find('div.carousel-item').width();

      carousel.find('.wrap').css('left', `-${width}px`);

      carousel
        .parent()
        .find('div.carousel-prev>span')
        .on('click', () => {
          if (scrollTimer) {
            clearTimeout(scrollTimer);
          }

          slide(-1, width);

          scrollTimer = setTimeout(() => {
            autoScroll(width);
          }, 4500);
        });

      carousel
        .parent()
        .find('div.carousel-next>span')
        .on('click', () => {
          if (scrollTimer) {
            clearTimeout(scrollTimer);
          }

          slide(1, width);

          scrollTimer = setTimeout(() => {
            autoScroll(width);
          }, 4500);
        });

      scrollTimer = setTimeout(() => {
        autoScroll(width);
      }, 4500);
    }

    function slide(direction, width) {
      if (carousel.hasClass('transition')) {
        return;
      }

      carousel.addClass('transition');

      const wrap = carousel.find('div.wrap');
      wrap.css('transform', `translateX(${-direction * width}px)`);

      $('.carousel-item:nth-child(3)').addClass('active');

      setTimeout(() => {
        if (direction < 0) {
          $('.carousel-item:first').before($('.carousel-item:last'));
        } else if (direction > 0) {
          $('.carousel-item:last').after($('.carousel-item:first'));
        }

        carousel.removeClass('transition');
        wrap.css('transform', 'translateX(0px)');

        setTimeout(() => {
          $('.carousel-item:nth-child(2)').removeClass('active');
        }, 500);
      }, 750);
    }

    function createCarouselitem(data) {
      return `
      <div class="carousel-item">
        <div class="carousel-bg" style="background-image: url(${data.icon ? data.icon : '/statics/images/404.png'})">
        </div>
        <div class="carousel-container">
          <div>
              <a href="/post/${data.id}"><h2 title="${data.title}">${data.title}</h2></a>
              <p>${data.info}</p>
          </div>
        </div>
      </div>
      `;
    }

    function autoScroll(width) {
      slide(1, width);
      scrollTimer = setTimeout(() => {
        autoScroll(width);
      }, 5500);
    }

    carousel
      .parent()
      .find('div.line-loading-preloader')
      .fadeOut(function () {
        $(this).remove();
      });
  }

  this.init = async function () {
    if (doms.category.find('.category-list').height() < 35) {
      doms.category.find('.mdi').parent().remove();
    }

    clockInit();

    carouselInit();

    try {
      await getPostList();
      if (model.maxPageIndex > 1) {
        createPagination(model.pageIndex);
      } else {
        doms.pagination.remove();
      }
    } finally {
      window.lycoris.loading.hide();
    }

    window.lycoris.record('首页');
  };

  this.init();
});
