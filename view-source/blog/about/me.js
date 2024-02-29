$(function () {
  const wraper = $('div.wraper');
  const menus = $('ul.menus').find('li');
  const sectionWrap = $('div.section-wrap');

  let scrolling = false;
  let progressSelect = void 0;
  const mouse = {
    x: 0,
    y: 0
  };

  let clientOrign = localStorage.getItem('clientOrign');

  if (!clientOrign) {
    clientOrign = $.uuid();
    localStorage.setItem('clientOrign', clientOrign);
  }

  const db = $.indexDb('lycoris-blog', 'blog');

  menus.on('click', function (e) {
    if (scrolling) {
      return;
    }

    scrolling = true;

    $('div.section')
      .find('.section-body')
      .fadeOut(300, function () {
        $(this).removeClass('animation');
      });

    if (e.target == e.currentTarget) {
      menus.removeClass('active');
      $(this).addClass('active');

      const id = $(this).find('a').attr('href');

      sectionWrap.removeClass('author info skill hobby contactus').addClass(id.replace('#', ''));

      setTimeout(() => {
        $(id)
          .find('.section-body')
          .fadeIn(300, function () {
            if (id == '#skill') {
              $(this)
                .find('.skill-item>div')
                .each((i, el) => {
                  if (el.scrollTop > 0) {
                    el.scrollTop = 0;
                  }
                });

              checkMouseMove();
            }
          })
          .addClass('animation');
      }, 500);
    }

    if (scrolling) {
      setTimeout(() => {
        scrolling = false;
      }, 1000);
    }
  });

  menus.find('a').on('click', function () {
    $(this).parent().trigger('click');
  });

  const wraperScroll = $.debounce(function (e) {
    if (progressSelect) {
      return;
    }

    const parent = $(e.target)
      .parents()
      .filter(function () {
        return $(this).hasClass('progress');
      });

    if (parent && parent.length) {
      if (parent.parent().height() < parent[0].scrollHeight) {
        return;
      }
    }

    e.preventDefault();

    if (e.originalEvent.deltaY > 0) {
      const next = menus.parent().find('li.active').next();

      if (!next || !next.length || next.hasClass('slide')) {
        return;
      }

      next.trigger('click');
    } else {
      const prev = menus.parent().find('li.active').prev();
      if (!prev || !prev.length) {
        return;
      }

      prev.trigger('click');
    }
  }, 200);

  wraper.mousemove(
    $.debounce(function (e) {
      mouse.x = e.pageX;
      mouse.y = e.pageY;

      if (sectionWrap.hasClass('skill')) {
        checkMouseMove();
      }
    }, 100)
  );

  wraper.on('wheel', function (e) {
    if (scrolling) {
      return;
    }

    wraperScroll.call(this, e);
  });

  function checkMouseMove() {
    let _progressSelect = void 0;

    const el = isMouseInElement($('.skill-item>div'));

    if (el) {
      _progressSelect = el;
      el.select();
    }

    progressSelect = _progressSelect;
  }

  function isMouseInElement(element) {
    let result = void 0;
    if (element && element.length) {
      if (element.length == 1) {
        // 获取元素的位置和大小
        var rect = element[0].getBoundingClientRect();
        // 判断鼠标位置是否在元素内
        if (mouse.x >= rect.left && mouse.x <= rect.right && mouse.y >= rect.top && mouse.y <= rect.bottom) {
          result = element;
        }
      }

      element.each((i, el) => {
        // 获取元素的位置和大小
        var rect = el.getBoundingClientRect();
        // 判断鼠标位置是否在元素内
        if (mouse.x >= rect.left && mouse.x <= rect.right && mouse.y >= rect.top && mouse.y <= rect.bottom) {
          result = $(el);
          return;
        }
      });

      return result;
    }
  }

  async function getInfo() {
    try {
      const info = await getAboutSettings('info');
      if (info) {
        for (let key in info) {
          const p = $('#info').find(`p[${key}]`);
          if (p && p.length) {
            const value = info[key];

            if (key == 'tags') {
              let html = `<span>博主很懒，并没有设置标签</span>`;
              if (value && value.length) {
                html = '';
                for (let data of value) {
                  html = html.concat(`<span>${data}</span>`);
                }
              }

              p.html(html);
            } else if (key == 'sex') {
              p.text(value == 0 ? '保密' : value == 1 ? '男' : '女');
            } else {
              p.text(value);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getSkill() {
    try {
      const skill = await getAboutSettings('skill');
      if (skill) {
        for (let key in skill) {
          if (skill[key] && skill[key].length) {
            const progress = $(`div.progress[data-type="${key}"]`);

            let html = '';
            for (let data of skill[key]) {
              html = html.concat(`
              <div>
                <p>${data.name}</p>
                <div class="progress__item">
                  <div class="progress__bar" style="width:${data.proficiency}%"></div>
                </div>
              </div>
              `);
            }

            progress.html(html);
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getContact() {
    try {
      const contact = await getAboutSettings('contact');
      if (contact.qq) {
        $('#qq-qrcode').find('.qrcode').html(`<img src="${contact.qq}" onerror="javascript:this.src='/statics/images/404.png'" />`);
      } else {
        $('#qq-qrcode').remove();
      }

      if (contact.weChat) {
        $('#wechat-qrcode').find('.qrcode').html(`<img src="${contact.weChat}" onerror="javascript:this.src='/statics/images/404.png'" />`);
      } else {
        $('#wechat-qrcode').remove();
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getLink() {
    try {
      const request = $.createHttpRequest();
      request.url = '/user/owner/link';
      const res = await request.get();
      if (res && res.resCode == 0) {
        for (let key in res.data) {
          const link = $('.other-link').find(`a[${key}]`);
          if (link && link.length) {
            link.attr('href', res.data[key]).attr('target', '_blank');
            const img = link.find('img');
            img.attr('src', img.attr('data-src'));
            img.removeAttr('data-src');
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function getAboutSettings(type) {
    const request = $.createHttpRequest();
    request.url = `/home/about/me/${type}`;
    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    } else {
      return void 0;
    }
  }

  async function record(pageName) {
    const data = {
      clientOrign: clientOrign,
      route: `${location.pathname}${location.search}`,
      pageName: pageName,
      referer: document.referrer,
      isPost: false
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
  }

  this.init = function () {
    getInfo();

    window.onresize = () => {
      location.reload();
    };

    getSkill();

    getContact();

    getLink();

    record('关于我');
  };

  this.init();
});
