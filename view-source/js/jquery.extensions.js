$(function () {
  $.fn.toJson = function () {
    var obj = {};

    const el = $(this);

    el.find('input').each(function (index, item) {
      // 判断元素的类型
      if (
        item.type == 'text' ||
        item.type == 'password' ||
        item.type == 'select-one' ||
        item.type == 'tel' ||
        item.type == 'search' ||
        item.type == 'range' ||
        item.type == 'number' ||
        item.type == 'month' ||
        item.type == 'email' ||
        item.type == 'datetime-local' ||
        item.type == 'datetime' ||
        item.type == 'date' ||
        item.type == 'color'
      ) {
        let propName = $(item).attr('name');

        if (propName) {
          if (propName.endsWith('[]')) {
            propName = propName.substring(0, propName.length - 2);
            if (obj.hasOwnProperty(propName)) {
              obj[propName].push($(item).val());
            } else {
              obj[propName] = [$(item).val()];
            }
          } else {
            if ($(item).hasClass('js-tags-input')) {
              let val = $(item).val();
              if (val) {
                val = val
                  .split(',')
                  .map(x => {
                    return x.trimStart().trimEnd();
                  })
                  .filter(x => x != void 0 && x != '');
              }
              obj[propName] = val || [];
            } else {
              obj[propName] = $(item).val();
            }
          }
        }
      } else if (item.type == 'checkbox') {
        if ($(item).attr('name')) {
          // 获取到复选框选中的元素
          var checkboxEl = $('input[name=' + $(item).attr('name') + ']:checked');
          if (checkboxEl && checkboxEl.length) {
            var checkboxArr = [];
            // 取出复选框选中的值
            const dataType = $(item).data('type') || '';

            checkboxEl.each(function (idx, itm) {
              let val = $(itm).val();

              if (dataType == 'boolean') {
                if (typeof val == 'string') {
                  val = Boolean(val === 'on');
                }
              }

              checkboxArr.push(val);
            });

            if (checkboxArr) {
              if (checkboxArr.length > 1) {
                obj[$(item).attr('name')] = checkboxArr.join(',');
              } else {
                obj[$(item).attr('name')] = checkboxArr[0];
              }
            }
          }
        }
      } else if (item.type == 'radio') {
        // 获取到单选框选中的值
        var radio_val = $('input[name=' + $(item).attr('name') + ']:checked').val();
        if (radio_val) {
          obj[$(item).attr('name')] = radio_val;
        }
      }
    });

    el.find('select').each(function (index, item) {
      let propertyName = $(item).attr('name');
      if (propertyName) {
        let value = $(item).val();
        if ($(item).data('type') === 'number') {
          obj[propertyName] = value === '' ? null : parseInt(value);
        } else if ($(item).data('type') === 'boolean') {
          obj[propertyName] = value === '' ? null : value === 'true' ? true : false;
        } else {
          obj[propertyName] = value;
        }
      }
    });

    el.find('textarea').each(function (index, item) {
      let propertyName = $(item).attr('name');
      if (propertyName) {
        obj[propertyName] = $(item).val();
      }
    });

    return obj;
  };

  $.fn.shake = function (shakes = 2, distance = 10, duration = 400) {
    for (let i = 0; i < shakes; i++) {
      $(this)
        .animate({ left: distance * -1 }, duration / shakes / 4)
        .animate({ left: distance }, duration / shakes / 2)
        .animate({ left: 0 }, duration / shakes / 4);
    }
  };

  $.fn.busy = function () {
    const that = this;
    let busy = void 0;

    function createLoadingHtml(id) {
      let html = `
      <div class="lycoris-loading flex-center-center" data-id="${id}">
        <div class="flex-center-center">
          <i class="mdi mdi-loading mdi-spin"></i>
          <span class="text"></span>
        </div>
      </div>
      `;

      return html;
    }

    this.show = function (text = '加载中，请稍候...') {
      text = text || '加载中，请稍候...';

      busy.find('span.text').text(text);
      if (!busy.hasClass('show')) {
        busy.addClass('show');
      }
    };

    this.hide = function () {
      busy.removeClass('show');
    };

    this.init = function () {
      const loading = $('div.lycoris-loading');

      let id = 0;
      for (let item of loading) {
        const dataId = parseInt($(item).data('id'));
        if (id < dataId) {
          id = dataId;
        }
      }

      id++;

      const html = createLoadingHtml(id);
      $(that).append(html);

      busy = $(`div.lycoris-loading[data-id="${id}"]`);
    };

    this.init();

    return this;
  };

  $.fn.lineBusy = function () {
    const that = this;
    let busy = void 0;

    function createLoadingHtml(id) {
      let html = `
      <div class="line-loading-preloader" data-id="${id}"> 
        <div class="line-loading-preloader-inner"></div>
      </div>
      `;

      return html;
    }

    this.show = function (text) {
      text = text || '';
      const el = busy.find('span.loading-text');
      if (text) {
        if (!el || el.length == 0) {
          busy.append(`<span class="loading-text">${text}</span>`);
        } else {
          el.text(text);
        }
      }

      busy.addClass('show-loading');
    };

    this.hide = function () {
      busy.removeClass('show-loading');
      const el = busy.find('span.loading-text');
      if (el && el.length) {
        el.text('');
      }
    };

    this.destroy = function () {
      busy.remove();
    };

    this.init = function () {
      const loading = $('div.line-loading-preloader');

      let id = 0;

      if (loading && loading.length) {
        for (let item of loading) {
          const dataId = parseInt($(item).data('id'));
          if (id < dataId) {
            id = dataId;
          }
        }

        id++;
      }

      const html = createLoadingHtml(id);

      $(that).append(html);

      busy = $(`div.line-loading-preloader[data-id="${id}"]`);
    };

    this.init();

    return this;
  };

  $.fn.lycorisTooltip = function () {
    const els = [...$(this)];

    if (els && els.length) {
      $(this).css('position', 'relative');

      for (let el of els) {
        const placement = $(el).data('placement') || 'top';

        const placementCalss = placement === 'bottom' ? 'tooltip-bottom' : 'tooltip-top';

        let html = `
        <div class="l-tooltip ${placementCalss}">
          <div class="tooltip-content flex-center-center">
            <span>${$(el).data('original-title')}</span>
          </div>
        </div>
        `;
        $(el).append(html);

        $(el).hover(
          function () {
            $(el).find('div.l-tooltip').fadeIn(200);
          },
          function () {
            $(el).find('div.l-tooltip').fadeOut(200);
          }
        );
      }
    }
  };

  $.fn.formAutoFill = function (data, handle) {
    const dataKeys = Object.keys(data);
    const keys = Object.keys(handle || {});

    $(this)
      .find('input[name]')
      .each((i, el) => {
        if ($(el).attr('type') != 'file') {
          const name = $(el).attr('name');
          let val = dataKeys.includes(name) ? data[name] : '';

          if (name) {
            const tagInput = $(el).hasClass('js-tags-input');

            if (tagInput && Array.isArray(val)) {
              val = val.join(',');
            }

            $(el).val(val);

            if (tagInput && keys.includes('taginput') && typeof handle['taginput'] == 'function') {
              handle['taginput'](el, name, val);
            }
          }
        }
      });

    $(this)
      .find('textarea[name]')
      .each((i, el) => {
        const name = $(el).attr('name');
        let val = dataKeys.includes(name) ? data[name] : '';
        if (name && val) {
          $(el).val(val);
        }
      });
  };

  $.fn.setBusy = function () {
    const el = $(this)[0];

    $(el).attr('disabled', 'disabled');
  };

  $.fn.clearBusy = function () {
    const el = $(this)[0];

    $(el).removeAttr('disabled');
  };

  /**
   * @function 防抖
   * @param {*} callback
   * @param {*} wait 毫秒
   * @param {*} immediate
   * @returns
   */
  $.debounce = function (callback, wait, immediate) {
    var timeout;
    return function () {
      var context = this;
      var args = arguments;

      if (timeout) clearTimeout(timeout);

      if (immediate) {
        // 判断是否执行过
        var flag = !timeout;
        timeout = setTimeout(function () {
          callback.apply(context, args);
        }, wait);

        if (flag) callback.apply(context, args);
      } else {
        timeout = setTimeout(function () {
          callback.apply(context, args);
        }, wait);
      }
    };
  };

  /**
   * @function 节流
   * @param {*} callback
   * @param {*} delay 毫秒
   * @param {*} immediate
   * @returns
   */
  $.throttle = function (callback, delay, immediate = true) {
    var timer,
      context,
      iNow,
      firstTime = +new Date(),
      args = [];
    return function () {
      clearTimeout(timer);
      context = this;
      iNow = +new Date();
      args = Array.prototype.slice.call(arguments);
      // 判断是否是第一次执行
      if (immediate) {
        immediate = false;
        callback.apply(context, args);
      } else {
        // 第二次执行的时候判断时间差
        if (iNow - firstTime > delay) {
          firstTime = iNow;
          callback.apply(context, args);
        } else {
          // 判断是否是最后一次执行
          timer = setTimeout(function () {
            callback.apply(context, args);
          }, delay);
        }
      }
    };
  };

  $.lycorisTotast = function () {
    function createTotastHtml(type, text) {
      let coloerType = 'info';
      if (type == 'success') {
        coloerType = 'success';
      } else if (type == 'error') {
        coloerType = 'danger';
      } else if (type == 'warning') {
        coloerType = 'warning';
      }

      const html = `
      <div class="totast-container ${coloerType}">
        <div class="totast-body flex-center-center">
          <div class="totast-content">${text}</div>
          <div class="close">
            <div>
              <span class="mdi mdi-close"></span>
            </div>
          </div>
        </div>
      </div>
       `;

      return html;
    }

    this.success = function (text) {
      const html = createTotastHtml('success', text);
      _show(html);
    };

    this.warn = function (text) {
      const html = createTotastHtml('warning', text);
      _show(html);
    };

    this.info = function (text) {
      const html = createTotastHtml('info', text);
      _show(html);
    };

    this.error = function (text) {
      const html = createTotastHtml('error', text);
      _show(html);
    };

    _show = function (html) {
      const el = $(html);
      const pageHeader = $('.page-header');
      if (pageHeader && pageHeader.length > 0) {
        $('.page-header').append(el);
      } else {
        $('body').append(el);
      }

      $(el)
        .find('.mdi-close')
        .on('click', function () {
          if (el && $(el).length) {
            $(el).css('animation', 'reverse-slide-in-top 0.75s both').css('-webkit-animation', 'reverse-slide-in-top 0.75s both').css('-moz-animation', 'reverse-slide-in-top 0.75s both');

            setTimeout(() => {
              $(el).remove();
            }, 500);
          }
        });

      setTimeout(() => {
        $(el).css('animation', 'reverse-slide-in-top 0.75s both').css('-webkit-animation', 'reverse-slide-in-top 0.75s both').css('-moz-animation', 'reverse-slide-in-top 0.75s both');

        setTimeout(() => {
          $(el).remove();
        }, 500);
      }, 2500);
    };

    return this;
  };

  $.getMaxPageIndex = function (total, pageSze) {
    return Math.ceil(total / pageSze);
  };

  /**
   * @function 获取当前页码显示数组
   * @param {*} currentPage 当前页码
   * @param {*} maxPageIndex 最大页码
   * @param {Number} maxPageNumber 页码显示个数
   * @returns {Array} 当前页码显示数组
   */
  $.getPageNumber = function (currentPage, maxPageIndex, maxPageNumber = 7) {
    let startPage = 1,
      endPage = 0;

    if (maxPageIndex > maxPageNumber) {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = maxPageNumber;
      } else if (currentPage + 3 > maxPageIndex) {
        startPage = maxPageIndex - maxPageNumber;
        endPage = maxPageIndex;
      } else {
        startPage = Math.max(1, currentPage - 3);
        endPage = Math.min(maxPageIndex, currentPage + 3);
      }
    } else {
      startPage = 1;
      endPage = maxPageIndex;
    }

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  $.scroll = {
    lock: function () {
      let widthBar = 17,
        root = document.documentElement;
      if (typeof window.innerWidth == 'number') {
        widthBar = window.innerWidth - root.clientWidth;
      }
      root.style.overflow = 'hidden';
      root.style.borderRight = widthBar + 'px solid transparent';
    },
    unlock: function () {
      let root = document.documentElement;
      root.style.overflow = '';
      root.style.borderRight = '';
    },
    toTop: function () {
      $('html, body').animate({ scrollTop: 0 }, 'slow');
    }
  };

  $.regex = {
    password: function (val) {
      let regex = /^(?![a-zA-Z]+$)(?![A-Z0-9]+$)(?![A-Z\W_!@#$%^&*`~()-+=]+$)(?![a-z0-9]+$)(?![a-z\W_!@#$%^&*`~()-+=]+$)(?![0-9\W_!@#$%^&*`~()-+=]+$)[a-zA-Z0-9\W_!@#$%^&*`~()-+=]/;
      return regex.test(val);
    },
    email: function (val) {
      let regex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      //let regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return regex.test(val);
    },
    idcard: function (val) {
      let regex =
        /^\d{6}((((((19|20)\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(((19|20)\d{2})(0[13578]|1[02])31)|((19|20)\d{2})02(0[1-9]|1\d|2[0-8])|((((19|20)([13579][26]|[2468][048]|0[48]))|(2000))0229))\d{3})|((((\d{2})(0[13-9]|1[012])(0[1-9]|[12]\d|30))|((\d{2})(0[13578]|1[02])31)|((\d{2})02(0[1-9]|1\d|2[0-8]))|(([13579][26]|[2468][048]|0[048])0229))\d{2}))(\d|X|x)$/;
      return regex.test(val);
    },
    url: function (val) {
      // var urlReg = /^(http|https):\/\/[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,5}(\/[^\s]*)?$/;
      let urlReg = /^((http|https):\/\/)?([^!@#$%^&*?.\s-]([^!@#$%^&*?.\s]{0,63}[^!@#$%^&*?.\s])?\.)+[a-z]{2,6}\/?/;
      return urlReg.test(val);
    },
    ip: function (val) {
      var ipReg = /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/;
      return ipReg.test(val);
    }
  };

  $.copyText = (function () {
    if (navigator.clipboard) {
      return text => {
        navigator.clipboard
          .writeText(text)
          .then(() => {})
          .catch(() => {
            const input = document.createElement(input);
            input.setAttribute('value', text);
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
          });
      };
    } else {
      return text => {
        const input = document.createElement(input);
        input.setAttribute('value', text);
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      };
    }
  })();

  $.getUserAgentImg = function (agentFlag) {
    const res = {
      url: './statics/icon/browser/edge.png',
      title: '未知'
    };

    switch (agentFlag) {
      case 0:
        {
          res.url = './statics/icon/browser/edge.png';
          res.title = 'Microsoft Edge';
        }
        break;
      case 1:
        {
          res.url = './statics/icon/browser/chrome.png';
          res.title = 'Chrome';
        }
        break;
      case 2:
        {
          res.url = './statics/icon/browser/safari.png';
          res.title = 'Safari';
        }
        break;
      case 3:
        {
          res.url = './statics/icon/browser/uc.png';
          res.title = 'UC浏览器';
        }
        break;
      case 4:
        {
          res.url = './statics/icon/browser/baidu.png';
          res.title = '百度浏览器';
        }
        break;
      case 5:
        {
          res.url = './statics/icon/browser/qq.png';
          res.title = 'QQ浏览器';
        }
        break;
      case 6:
        {
          res.url = './statics/icon/browser/liebao.png';
          res.title = '猎豹浏览器';
        }
        break;
      case 7:
        {
          res.url = './statics/icon/browser/firefox.png';
          res.title = '火狐浏览器';
        }
        break;
      case 8:
        {
          res.url = './statics/icon/browser/360.png';
          res.title = '360安全浏览器';
        }
        break;
      case 9:
        {
          res.url = './statics/icon/browser/360.png';
          res.title = '360极速浏览器';
        }
        break;
      case 10:
        {
          res.url = './statics/icon/browser/opera.png';
          res.title = 'Opera';
        }
        break;
      case 11:
        {
          res.url = './statics/icon/browser/android.png';
          res.title = '小米浏览器';
        }
        break;
      case 12:
        {
          res.url = './statics/icon/browser/android.png';
          res.title = '微信浏览器';
        }
        break;
      case 13:
        {
          res.url = './statics/icon/browser/android.png';
          res.title = '手机QQ浏览器';
        }
        break;
      case 14:
        {
          res.url = './statics/icon/browser/android.png';
          res.title = '手机百度浏览器';
        }
        break;
      case 15:
        {
          res.url = './statics/icon/browser/ie.png';
          res.title = 'IE浏览器';
        }
        break;
      case 16:
        {
          res.url = './statics/icon/browser/android.png';
          res.title = '安卓浏览器';
        }
        break;
      default:
        break;
    }

    return res;
  };

  $.formatNumber = function (num) {
    if (num < 1000) {
      return num.toString().indexOf('.') > -1 ? num.toFixed(1) : num;
    } else {
      return (num / 1000).toFixed(1) + 'K';
    }
  };

  $.highlightKeyword = function (content, keyword) {
    // 创建正则表达式，使用全局搜索(g)和忽略大小写(i)
    const regex = new RegExp(keyword, 'gi');

    // 用<span>标签包裹匹配的关键词
    const highlightedContent = content.replace(regex, function (match) {
      return `<span style="color: var(--color-danger);padding:0 3px;">${match}</span>`;
    });

    return highlightedContent;
  };

  $.lycorisImagePreviewer = function (srcList) {
    const _srcList = srcList || [];
    _index = 0;
    _deg = 0;
    _scale = 1;
    _viewer = void 0;

    this.show = function (arg) {
      _imgReset();

      let index = parseInt(arg);

      if (isNaN(index) && typeof arg === 'string') {
        _viewer.find('img').attr('src', arg);
      } else if (_srcList.length - 1 >= index) {
        _index = index;
        _viewer.find('img').attr('src', _srcList[_index]);
      }

      _viewer.fadeIn(300, function () {
        const img = $(this).find('img');
        img.show().addClass('show');
        setTimeout(() => {
          img.removeClass('show');
        }, 500);
      });
    };

    this.hide = function () {
      _close();
    };

    this.zoom = function (step) {
      _zoom(step);
    };

    _init = function () {
      if (_viewer) {
        return;
      }

      let html = `
      <div class="image-viewer">
        <div class="image-viewer-mask">
          <span class="icon"><i class="mdi mdi-close"></i></span>`;

      if (_srcList && _srcList.length > 0) {
        html = html.concat(`<span class="icon"><i class="mdi mdi-chevron-left" data-index="-1"></i>
                            </span><span class="icon"><i class="mdi mdi-chevron-right" data-index="1"></i></span>`);
      }

      html = html.concat(`
          <div class="image-canvas">
              <img src="" class="transition"/>
          </div>

          <div class="icon-panel">
              <span class="mdi mdi-magnify-minus-outline" title="缩小"></span>
              <span class="mdi mdi-magnify-plus-outline" title="放大"></span>
              <span class="mdi mdi-backup-restore" title="还原"></span>
              <span class="mdi mdi-format-rotate-90" title="向左旋转"></span>
              <span class="mdi mdi-format-rotate-90 mdi-rotate-180" title="向右旋转"></span>
          </div>
        </div>
      </div>
      `);

      $('body').append(html);

      _viewer = $('div.image-viewer');

      _viewer.on('click', function () {
        _close();
      });

      _viewer.find('.icon,.icon>.mdi').on('click', function (e) {
        e.stopPropagation();

        if ($(this).hasClass('mdi-close')) {
          _close();
          return;
        } else if ($(this).hasClass('mdi-chevron-left') || $(this).hasClass('mdi-chevron-right')) {
          _change.call(this);
          return;
        }
      });

      _viewer.find('.icon-panel,.icon-panel>.mdi').on('click', function (e) {
        e.stopPropagation();

        if (!$(this).hasClass('mdi')) {
          return;
        }

        if ($(this).hasClass('mdi-format-rotate-90')) {
          _roate.call(this, $(this).hasClass('mdi-rotate-180') ? 1 : -1);
          return;
        }

        if ($(this).hasClass('mdi-magnify-minus-outline') || $(this).hasClass('mdi-magnify-plus-outline')) {
          _zoom.call(this, $(this).hasClass('mdi-magnify-minus-outline') ? -1 : 1);
          return;
        }

        _viewer.find('img').css('transform', 'scale(1) rotate(0deg)');
        _deg = 0;
        _scale = 1;
      });

      let _deltaY = 0;

      const mouseScroll = $.debounce(function (deltaY) {
        deltaY = deltaY / 100;

        if (deltaY > 5) {
          deltaY = 5;
        } else if (deltaY < -5) {
          deltaY = -5;
        }

        _zoom(-1 * deltaY);

        _deltaY = 0;
      }, 50);

      _viewer.on('mousewheel ', function (e) {
        e.preventDefault();
        e.stopPropagation();

        _deltaY += e.originalEvent.deltaY;

        mouseScroll(_deltaY);
      });
    };

    const _change = $.throttle(function () {
      if ($(this).hasClass('mdi-chevron-left')) {
        if (_index == 0) {
          return;
        }
        _index--;
      } else {
        if (_index == _srcList.length - 1) {
          return;
        }
        _index++;
      }

      _viewer.find('img').fadeOut(300, function () {
        _imgReset();

        _viewer.find('img').attr('src', _srcList[_index]);

        $(this).fadeIn(300);
      });
    }, 300);

    const _zoom = $.throttle(function (step) {
      _scale += step * 0.1;
      if (_scale < 0) {
        _scale = 0.1;
      }

      let css = `scale(${_scale})`;
      if (_deg > 0) {
        css = css.concat(` rotate(${_deg}deg)`);
      }

      _viewer.find('img').css('transform', css);
    }, 300);

    const _roate = $.throttle(function (step) {
      _deg += step * 90;

      let css = `rotate(${_deg}deg)`;
      if (_scale > 0) {
        css = css.concat(` scale(${_scale})`);
      }

      _viewer.find('img').css('transform', css);
    }, 300);

    function _close() {
      _viewer.fadeOut(300, function () {
        $(this).find('img').hide();
      });
    }

    function _imgReset() {
      _deg = 0;
      _scale = 1;
      _viewer.find('img').removeClass('transition');
      _viewer.find('img').css('transform', '');
      setTimeout(() => {
        _viewer.find('img').addClass('transition');
      }, 0);
    }

    _init();

    return this;
  };

  $.uuid = function () {
    let s = [];
    var hexDigits = '0123456789abcdef';
    for (var i = 0; i < 36; i++) {
      let start = Math.floor(Math.random() * 0x10);
      s[i] = hexDigits.substring(start, start + 1);
    }
    s[14] = '4';
    let index = (s[19] & 0x3) | 0x8;
    s[19] = hexDigits.substring(index, index + 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    var uuid = s.join('');
    return uuid.replaceAll('-', '');
  };
});
