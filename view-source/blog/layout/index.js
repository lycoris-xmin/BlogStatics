$(function () {
  const page = {
    header: $('body>div.page-header'),
    search: $('body>div.page-header').find('div.action').find('.mdi-magnify'),
    searchOvalay: $('body>div.search-overlay'),
    searchInput: $('body>div.search-overlay').find('input'),
    searchResult: $('body>div.search-overlay').find('div.search-result'),
    totastContainer: $('.totast-container')
  };

  const model = {
    mousedownTarget: false,
    mouseupTarget: false
  };

  let clientOrign = localStorage.getItem('clientOrign');

  if (!clientOrign) {
    clientOrign = $.uuid();
    localStorage.setItem('clientOrign', clientOrign);
  }

  const db = $.indexDb('lycoris-blog', 'blog');

  window.lycoris = {
    loading: {
      show: function () {
        $('body').addClass('loading');
      },
      hide: function () {
        setTimeout(() => {
          $('body').removeClass('loading');
          const title = $('div.header-title>div>p');
          if (title && title.length) {
            title.addClass('focus-in');
          }
        }, 300);
      }
    },
    totast: $.lycorisTotast(),
    route: {
      toLoginPage: url => {
        url = url || `${location.pathname}${location.search}`;
        location.href = `/authentication/login?redirect=${url}`;
      }
    },
    record: async function (pageName, isPost = false) {
      const data = {
        clientOrign: clientOrign,
        route: `${location.pathname}${location.search}`,
        pageName: pageName,
        referer: document.referrer,
        isPost: isPost
      };

      const result = await db.query(tmp => {
        return tmp.route == data.route;
      });

      if (result && result.length && result[0].time + 300000 > +new Date()) {
        return;
      }

      try {
        const request = $.createHttpRequest();
        request.url = '/home/browse/record';
        request.data = data;
        await request.post();

        if (result && result.length) {
          result[0].time = +new Date();
          db.update(result[0]);
        } else {
          db.create({ route: data.route, time: +new Date() });
        }
      } catch (err) {
        console.error(err);
      }
    },
    lazysizes: function () {
      lazySizes.loader.checkElems();
    }
  };

  $(window).on('scroll', $.throttle(pageHeaderSticky, 200));

  function pageHeaderSticky() {
    // 获取页面滑动距离
    const scrollDistance = window.scrollY || window.pageYOffset;

    if (scrollDistance > 0) {
      if ($('.page-header').hasClass('sticky-header')) {
        return;
      }

      $('.page-header').addClass('sticky-header');
    } else {
      if (!$('.page-header').hasClass('sticky-header')) {
        return;
      }

      $('.page-header').removeClass('sticky-header');
    }
  }

  page.header.find('span.login').on('click', function () {
    window.lycoris.route.toLoginPage();
  });

  page.search.on('click', function () {
    page.searchOvalay.addClass('search-overlay-show');

    setTimeout(() => {
      page.searchOvalay.find('input').trigger('focus');
    }, 300);
  });

  page.searchOvalay.find('>div.card').on('click', function (e) {
    e.stopPropagation();
  });

  page.searchOvalay.on('click', function () {
    if (model.mousedownTarget && model.mouseupTarget) {
      $(this).removeClass('search-overlay-show').addClass('search-overlay-hide');
      setTimeout(() => {
        $(this).find('input').val('');
        page.searchResult.addClass('no-result');
        page.searchResult.find('ul').html('');
      }, 300);
    }

    model.mousedownTarget = model.mouseupTarget = false;
  });

  page.searchOvalay.on('mousedown', function (e) {
    model.mousedownTarget = e.target === e.currentTarget;
  });

  page.searchOvalay.on('mouseup', function (e) {
    model.mouseupTarget = e.target === e.currentTarget;
  });

  const searchResult = page.searchResult.lineBusy();

  function createResultHtml(list, keyword) {
    let html = '';
    if (list && list.length) {
      //
      for (let item of list) {
        html = html.concat(`
        <li>
          <div>
            <div class="result-header flex-start-center">
                <span class="post-badge post-badge-primary">原创</span>
                <a class="post-link" href="/post/${item.id}">${$.highlightKeyword(item.title, keyword)}</a>
            </div>
            <div class="result-info">
                ${$.highlightKeyword(item.info, keyword)}
            </div>
          </div>
        </li>
        `);
      }
    }

    if (!html) {
      page.searchResult.addClass('no-result');
    } else {
      page.searchResult.removeClass('no-result');
    }

    page.searchResult.find('ul').html(html);
  }

  const handleSearchInput = $.debounce(async () => {
    let val = page.searchInput.val();
    val = val.trimEnd().trimStart();
    if (val) {
      searchResult.show();
      try {
        // 查询数据
        const request = $.createHttpRequest();
        request.url = '/post/search';
        request.data = {
          keyword: val
        };

        const res = await request.get();
        if (res && res.resCode == 0) {
          createResultHtml(res.data.list, val);
        }
      } finally {
        searchResult.hide();
      }
    }
  }, 500);

  page.searchInput.on('input', handleSearchInput);

  function searchOvalayKeydown(code) {
    if (code != 27 && code != 13 && code != 40 && code != 38) {
      return;
    }

    if (code == 27) {
      if (page.searchOvalay.hasClass('search-overlay-show')) {
        model.mousedownTarget = model.mouseupTarget = true;
        page.searchOvalay.trigger('click');
      }
      return;
    }

    const result = page.searchOvalay.find('div.search-result');
    if (result.hasClass('no-result')) {
      return;
    }

    const activeReulst = result.find('li.active');

    if (code == 40) {
      // 下
      if (activeReulst && activeReulst.length > 0) {
        const next = activeReulst.next();
        if (next && next.length) {
          activeReulst.removeClass('active');
          next.addClass('active');

          if (!isElementWithinParentViewport($('ul.result'), next, 'bottom')) {
            searchResultSmoothScrollTo($('ul.result'), next, 500, 'bottom');
          }
        }
      } else {
        page.searchInput.trigger('blur');
        $(result.find('li:first')).addClass('active');
      }
    } else if (code == 38) {
      // 上
      if (activeReulst && activeReulst.length > 0) {
        const prev = activeReulst.prev();
        if (prev && prev.length) {
          prev.addClass('active');

          if (!isElementWithinParentViewport($('ul.result'), prev, 'top')) {
            searchResultSmoothScrollTo($('ul.result'), prev, 500, 'top');
          }
        } else {
          page.searchInput.trigger('focus');
          setTimeout(() => {
            let val = page.searchInput.val();
            page.searchInput[0].setSelectionRange(val.length, val.length);
          }, 0);
        }

        activeReulst.removeClass('active');
      }
    } else if (code == 13) {
      // enter
      location.href = activeReulst.find('a.post-link').attr('href');
    }
  }

  function getScriptJson() {
    try {
      if ($('script[layout]').length) {
        const jsonText = $('script[layout]').text();
        let val = JSON.parse(jsonText);
        if (val) {
          window.lycoris.online = val.online == void 0 || typeof val.online != 'boolean' ? false : val.online;
        }
      } else {
        window.lycoris.online = false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  function isElementWithinParentViewport($parent, $child, position) {
    if (position == 'top') {
      // 获取子元素相对于父元素的顶部位置
      var childTopOffset = $child.offset().top - $parent.offset().top;

      if (childTopOffset < 0) {
        return false;
      }

      // 获取父元素的滚动位置
      var parentScrollTop = $parent.scrollTop();

      // 如果子元素的顶部位置加上子元素的高度仍然小于或等于父元素的滚动位置加上父元素的可视高度，则子元素顶部在可视区域内
      if (childTopOffset + $child.outerHeight() <= parentScrollTop + $parent.height()) {
        return true;
      }

      // 否则，不在可视区域内
      return false;
    } else {
      var childOffset = $child.offset();
      var childBottom = childOffset.top + $child.outerHeight();

      var parentOffset = $parent.offset();
      var parentBottom = parentOffset.top + $parent.outerHeight();

      // 判断子元素的底部是否在父元素的可视区域内
      return childBottom <= parentBottom && childBottom >= parentOffset.top;
    }
  }

  let scrollTop = 0;

  function searchResultSmoothScrollTo($parent, $child, duration, position) {
    // 确保父元素和子元素存在
    if (position == 'top') {
      scrollTop = 0;

      // 计算子元素相对于父元素的顶部位置
      var childTopOffset = $child.offset().top - $parent.offset().top;

      // 使用 animate 方法实现平滑滚动
      $parent.animate(
        {
          scrollTop: $parent.scrollTop() + childTopOffset
        },
        duration
      );
    } else {
      // 计算子元素相对于父元素的偏移量
      const childOffset = $child.offset().top - $parent.offset().top;

      // 获取子元素的高度
      const childHeight = $child.outerHeight();

      // 获取父元素的总高度（包括滚动条可滚动的内容）
      const parentHeight = $parent.height();

      // 计算需要滚动的位置
      scrollTop += childOffset + childHeight - parentHeight;

      // 使用 animate 方法实现平滑滚动
      $parent.animate(
        {
          scrollTop: scrollTop
        },
        duration
      );
    }
  }

  $(document).on('keydown', function (e) {
    searchOvalayKeydown(e.which);
  });

  $('a[route-link]').on('click', function () {
    const url = $(this).data('href');
    if (url == location.pathname) {
      window.lycoris.totast.info('你已经在此页面了');
      return;
    }

    location.href = url;
  });

  page.header.find('div>img').on('click', function () {
    if (location.pathname == '/') {
      return;
    }

    location.href = '/';
  });

  page.header.find('a[logout]').on('click', async function () {
    $(this).setBusy();
    try {
      const request = $.createHttpRequest();
      request.url = '/authentication/Logout';
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('退出成功');
        setTimeout(() => {
          location.reload();
        }, 1000);
      }
    } finally {
      $(this).clearBusy();
    }
  });

  window.onresize = $.debounce(function () {
    location.reload();
  }, 500);

  this.init = function () {
    pageHeaderSticky();
    getScriptJson();
  };

  this.init();
});
