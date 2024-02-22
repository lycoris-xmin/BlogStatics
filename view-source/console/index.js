$(function () {
  // 停止
  $('body').on('click', '[data-stopPropagation]', function (e) {
    e.stopPropagation();
  });

  // 滚动条
  if ($('.lyear-scroll')[0]) {
    $('.lyear-scroll').each(function () {
      new PerfectScrollbar(this, {
        swipeEasing: false,
        suppressScrollX: true
      });
    });
  }

  // 侧边栏
  $(document).on('click', '.lyear-aside-toggler', function () {
    $('.lyear-layout-sidebar').toggleClass('lyear-aside-open');
    $('body').toggleClass('lyear-layout-sidebar-close');

    if ($('.lyear-mask-modal').length == 0) {
      $('<div class="lyear-mask-modal"></div>').prependTo('body');
    } else {
      $('.lyear-mask-modal').remove();
    }
  });

  // 遮罩层
  $(document).on('click', '.lyear-mask-modal', function () {
    $(this).remove();
    $('.lyear-layout-sidebar').toggleClass('lyear-aside-open');
    $('body').toggleClass('lyear-layout-sidebar-close');
  });

  // 侧边栏导航
  $(document).on('click', '.nav-item-has-subnav > a', function () {
    $subnavToggle = jQuery(this);
    $navHasSubnav = $subnavToggle.parent();
    $topHasSubNav = $subnavToggle.parents('.nav-item-has-subnav').last();
    $subnav = $navHasSubnav.find('.nav-subnav').first();
    $viSubHeight = $navHasSubnav.siblings().find('.nav-subnav:visible').outerHeight();
    $scrollBox = $('.lyear-layout-sidebar-info');
    $navHasSubnav.siblings().find('.nav-subnav:visible').slideUp(500).parent().removeClass('open');
    $subnav.slideToggle(300, function () {
      $navHasSubnav.toggleClass('open');

      // 新增滚动条处理
      var scrollHeight = 0;
      (pervTotal = $topHasSubNav.prevAll().length),
        (boxHeight = $scrollBox.outerHeight()),
        (innerHeight = $('.sidebar-main').outerHeight()),
        (thisScroll = $scrollBox.scrollTop()),
        (thisSubHeight = $(this).outerHeight()),
        (footHeight = 121);

      if (footHeight + innerHeight - boxHeight >= pervTotal * 48) {
        scrollHeight = pervTotal * 48;
      }
      if ($subnavToggle.parents('.nav-item-has-subnav').length == 1) {
        $scrollBox.animate({ scrollTop: scrollHeight }, 300);
      } else {
        // 子菜单操作
        if (typeof $viSubHeight != 'undefined' && $viSubHeight != null) {
          scrollHeight = thisScroll + thisSubHeight - $viSubHeight;
          $scrollBox.animate({ scrollTop: scrollHeight }, 300);
        } else {
          if (thisScroll + boxHeight - $scrollBox[0].scrollHeight == 0) {
            scrollHeight = thisScroll - thisSubHeight;
            $scrollBox.animate({ scrollTop: scrollHeight }, 300);
          }
        }
      }
    });
  });

  $(document).on('click', '.nav-item .multitabs', function () {
    $('.nav-item').removeClass('active');
    $('.nav-subnav li').removeClass('active');
    $(this).parents('li').addClass('active');
    $(this).parents('.nav-item-has-subnav').addClass('open').first().addClass('active');
  });

  // 选项卡
  const multitabsInstance = $('#iframe-content').multitabs({
    iframe: true,
    refresh: 'no', // iframe中页面是否刷新，'no'：'从不刷新'，'nav'：'点击菜单刷新'，'all'：'菜单和tab点击都刷新'
    nav: {
      backgroundColor: '#ffffff'
    },
    init: [{ ...window.lycoris.main }]
  });

  delete window.lycoris.main;

  window.lycoris.multitabs = createMultitabs();

  Object.assign(window.lycoris, createLycoris());

  function createLycoris() {
    function createRequest() {
      return $.createHttpRequest();
    }

    function createFileUpload(file, uploadType, fileName = null) {
      const request = $.createHttpRequest();
      request.url = '/staticfile/upload';
      request.formData = {
        uploadType,
        fileName
      };
      return request.post({ file });
    }

    function createEvents() {
      const that = {
        _: [],
        on: (channel, callback) => {
          const index = that._.findIndex(x => x.channel == channel);
          if (index < 0) {
            that._.push({
              channel: channel,
              callback: callback
            });
          } else {
            that._[index] = {
              channel: channel,
              callback: callback
            };
          }
        },
        unbind: channel => {
          //
          const index = that._.findIndex(x => x.channel == channel);
          if (index > -1) {
            that._.splice(index, 1);
          }
        },
        call: (channel, ...args) => {
          const index = that._.findIndex(x => x.channel == channel);
          if (index > -1) {
            that._[index].callback.apply(that, args);
          }
        }
      };

      return that;
    }

    function createTool() {
      return {
        createObjectURL: file => {
          let fileUrl = window.URL || window.webkitURL;
          return fileUrl.createObjectURL(file);
        }
      };
    }

    return {
      isDebugger: window.lycoris.isDebugger,
      console: window.lycoris.console,
      createSignalR: url => $.createSignalR(url),
      createLycoris,
      createRequest,
      fileUpload: createFileUpload,
      events: createEvents(),
      totast: $.totast,
      swal: $.sweetAlert(),
      tool: createTool(),
      go: (url, local = true) => {
        location.href = local ? `${window.lycoris.console}${url}` : url;
      },
      open: url => {
        window.open(url);
      },
      changeConsole: consolePath => {
        if (`${consolePath}/dashboard` != location.pathname) {
          location.href = location.pathname.replace(window.lycoris.console, consolePath);
        }
      },
      element: {
        update(el, callback) {
          const dom = $(el);
          if (dom && dom.length && callback && typeof callback == 'function') {
            callback.call(dom);
          }
        }
      }
    };
  }

  function createMultitabs() {
    const that = {
      instance: multitabsInstance,
      create: (title, url) => {
        if (multitabsInstance) {
          multitabsInstance.create(
            {
              iframe: true,
              title: title,
              url: url
            },
            true
          );
        }
      },
      active: url => {
        let tab = $('#iframe-content').find(`.nav-item>a[data-url="${url}"]`);
        if (tab && tab.length) {
          $(tab).trigger('click');
        }
      },
      remove: (url, activeUrl) => {
        let tab = $('#iframe-content').find(`.nav-item>a[data-url="${url}"]`);
        if (tab && tab.length) {
          tab.parent().find('i.mt-close-tab').trigger('click');
        }

        if (activeUrl) {
          setTimeout(() => {
            that.active(activeUrl);
          }, 0);
        }
      },
      getCurrentTab: function () {
        let tab = $('#iframe-content').find('.nav-item>a.active');
        if (tab && tab.length) {
          return {
            name: $(tab).text(),
            url: $(tab).attr('data-url')
          };
        }
      },
      updateCurrentTab: function (title, url) {
        let tab = $('#iframe-content').find('.nav-item>a.active');
        if (tab && tab.length) {
          tab.attr('data-url', url);
          tab.data('url', url);
          tab.text(title);
          const id = tab.data('id');
          $(`#${id}`).attr('src', url);
        }
      }
    };

    return that;
  }

  async function signalRSetup() {
    window.lycoris.signalR = $.createSignalR(`${window.lycoris.console}/hub/dashboard`, window.lycoris.isDebugger);
    await window.lycoris.signalR.connect();

    window.lycoris.signalR.on('refresh', async function () {
      location.reload();
    });

    window.lycoris.signalR.on('logout', async function () {
      await window.lycoris.swal.warn('您的帐号已在其他设备登录');
      location.href = `${window.lycoris.console}/authentication/login`;
    });
  }

  signalRSetup();

  const dialog = {
    profile: $('#user-profile-Modal').bootstrapModal(),
    password: $('#change-password-Modal').bootstrapModal()
  };

  const model = {
    profile: {
      file: void 0,
      nickName: '',
      avatar: '',
      email: '',
      qq: '',
      weChat: '',
      github: '',
      gitee: '',
      bilibili: '',
      cloudMusic: ''
    }
  };

  const bodyBusy = $('body').busy();

  $('a[profile]').on('click', async function () {
    const request = window.lycoris.createRequest();
    request.url = '/user/brief';
    const res = await request.get();
    if (res && res.resCode == 0) {
      Object.assign(model.profile, res.data);
      dialog.profile.show();
    }
  });

  $('a[change-password]').on('click', function () {
    dialog.password.show();
  });

  $('a[logout]').on('click', async function () {
    const isConfirm = await window.lycoris.swal.confirm('确定要退出登录吗？');
    if (isConfirm) {
      bodyBusy.show('正在注销中，请稍候...');

      try {
        const request = window.lycoris.createRequest();
        request.url = '/authentication/logout';
        const res = await request.post();
        if (res && res.resCode == 0) {
          bodyBusy.show('注销成功，即将返回登录页面');
          setTimeout(() => {
            window.lycoris.go('/authentication/login');
          }, 1000);
        }
      } catch {
        bodyBusy.hide();
      }
    }
  });

  dialog.profile.handleShow(function () {
    dialog.profile.find('.avatar>img').attr('src', model.profile.avatar);
    dialog.profile.find('form').formAutoFill(model.profile);
  });

  dialog.profile.find('p.more-text>span').on('click', function () {
    const that = this;
    if ($(this).hasClass('show')) {
      dialog.profile.find('div.more').slideUp(300, function () {
        $(that).removeClass('show');
      });
    } else {
      dialog.profile.find('div.more').slideDown(300, function () {
        $(that).addClass('show');
      });
    }
  });

  dialog.profile.find('.avatar>img').on('click', function () {
    $(this).next().trigger('click');
  });

  dialog.profile.find('.avatar>input').on('change', function () {
    model.profile.file = $(this)[0].files[0];

    const url = window.lycoris.tool.createObjectURL(model.profile.file);

    $(this).prev().attr('src', url);

    $(this).val('');
  });

  dialog.profile.find('button[save]').on('click', async function () {
    const json = dialog.profile.find('form').toJson();

    const keys = Object.keys(json);
    for (let p in model.profile) {
      if (keys.includes(p) && json[p] == model.profile[p]) {
        delete json[p];
      }
    }

    if (!Object.keys(json).length && model.profile.file == void 0) {
      dialog.profile.hide();
      return;
    }

    let isConfirm = true;
    if (json['email']) {
      isConfirm = await window.lycoris.swal.confirm('邮箱修改后你需要重新使用新邮箱作为帐号进行登录', '确定要修改邮箱吗？');
    }

    if (isConfirm) {
      $(this).setBusy();
      try {
        const request = window.lycoris.createRequest();
        request.url = '/user/brief/update';
        request.formData = {
          ...json
        };

        const res = model.profile.file ? await request.post({ file: model.profile.file }) : await request.post();

        if (res && res.resCode == 0) {
          model.profile.file = void 0;

          window.lycoris.totast.success('保存成功');

          if (json['email']) {
            setTimeout(async () => {
              await window.lycoris.swal.warn('由于你修改了邮箱，你需要使用新邮箱进行登录', '登录通知');
              window.lycoris.go('/authentication/login');
            }, 500);
          } else {
            dialog.profile.hide();

            $('.dropdown-profile').find('>a>img').attr('src', res.data.avatar);
            $('.dropdown-profile').find('>a>span').text(res.data.nickName);
          }
        }
      } finally {
        $(this).clearBusy();
      }
    }
  });

  this.init = function () {
    dialog.profile.find('div.more').slideUp();

    $('[data-toggle="tooltip"]').tooltip();
  };

  this.init();
});
