$(function () {
  const container = $('#container');
  const icons = $('div.social-icons').find('a');

  window.lycoris = {
    totast: $.lycorisTotast()
  };
  const model = {
    redirect: '/'
  };

  $('#register').on('click', function () {
    container.addClass('active');
  });

  $('#login').on('click', function () {
    container.removeClass('active');
  });

  $('button.register').on('click', function () {
    // 注册操作
    const form = $(this).parent();
  });

  $('button.login').on('click', async function () {
    // 登录操作
    const form = $(this).parent();
    const data = {
      email: form.find('input[name="email"]').val(),
      password: form.find('input[name="password"]').val()
    };

    if (!data.email) {
      window.lycoris.totast.warn('邮箱不能为空！');
      return;
    }

    if (!data.password) {
      window.lycoris.totast.warn('密码不能为空！');
      return;
    }

    try {
      const request = $.createHttpRequest();
      request.url = '/login/validate';
      request.data = data;

      let res = await request.post();

      if (res && res.resCode == 0) {
        request.url = '/login/oathcode';
        request.data = {
          email: data.email,
          oathCode: res.data.oathCode,
          remember: true
        };

        res = await request.post();

        if (res && res.resCode == 0) {
          location.href = model.redirect;
        }
      }
    } catch (error) {}
  });

  icons.on('click', function () {
    const type = $(this).data('type');
    totast.warn(`${$(this).data('title')}登录还未开发`);
  });

  this.init = function () {
    if ($('script[type="application/json"]').length) {
      const jsonText = $('script[type="application/json"]').text();
      const json = JSON.parse(jsonText);
      if (json && Object.keys(json).length) {
        if (json.redirect) {
          model.redirect = json.redirect;
        }
      }
    }
  };

  this.init();
});
