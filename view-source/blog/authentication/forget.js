$(function () {
  const controller = 'authentication';
  const icons = $('button.unit');

  window.lycoris = {
    totast: $.lycorisTotast()
  };

  const model = {
    redirect: '/',
    loginSuccess: false
  };

  $('input[name="email"]').on('change', function () {
    const that = this;

    const val = $(this).val();
    if (val && !$.regex.email(val)) {
      window.lycoris.totast.warn('邮箱格式错误');
    }
  });

  $('button[captcha]').on('click', async function () {
    window.lycoris.totast.warn('重构版本测试中，该功能还未开发');
    return;
    const email = $('input[name="email"]').val();
    if (!email) {
      window.lycoris.totast.warn('邮箱不能为空');
      return;
    } else if (!$.regex.email(email)) {
      window.lycoris.totast.warn('邮箱格式错误');
      return;
    }

    $(this).setBusy();
    try {
      const request = $.createHttpRequest();
      request.url = `/${controller}/register/captcha`;
      request.data = {
        email: email
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        captchaTimer(60);
        window.lycoris.totast.success('验证码已发送');

        setTimeout(() => {
          const emailHost = getEmailHost(email);
          if (emailHost) {
            const isconfirm = confirm('是否需要跳转至邮箱网站');
            if (isconfirm) {
              if (emailHost.includes('https://mail.qq.com')) {
                openQQMail();
              } else {
                window.open(emailHost);
              }
            }
          }
        }, 2000);
      }
    } catch (error) {
      $(this).clearBusy();
    }
  });

  function captchaTimer(second) {
    second--;
    if (second <= 0) {
      $('button[captcha]').clearBusy();
      $('button[captcha]').text('验证码');
      sessionStorage.removeItem('captchaTimer');
      return;
    } else if (!$('button[captcha]').is(':disabled')) {
      $('button[captcha]').setBusy();
    }

    $('button[captcha]').text(`${second}s`);
    sessionStorage.setItem('captchaTimer', second);
    setTimeout(() => {
      captchaTimer(second);
    }, 1000);
  }

  $('button[login]').on('click', function () {
    location.href = `/authentication/login${location.search}`;
  });

  $('button[home]').on('click', function () {
    location.href = '/';
  });

  $('button[register]').on('click', function () {
    location.href = `/authentication/register${location.search}`;
  });

  $('button[forget]').on('click', function () {
    window.lycoris.totast.warn('重构版本测试中，该功能还未开发');
  });

  icons.on('click', function () {
    const type = $(this).data('type');
    window.lycoris.totast.warn(`${$(this).data('title')}登录还未开发`);
  });

  const loginHanlder = $.debounce(async function () {
    if (model.loginSuccess) {
      return;
    }

    const json = $('form').toJson();
    if (!json.email) {
      window.lycoris.totast.warn('邮箱不能为空');
      return;
    } else if (!$.regex.email(json.email)) {
      window.lycoris.totast.warn('邮箱格式错误');
      return;
    }

    if (!json.captcha) {
      window.lycoris.totast.warn('邮箱验证码不能为空');
      return;
    } else if (json.captcha.length != 6) {
      window.lycoris.totast.warn('邮箱验证码错误');
      return;
    }

    if (!json.password) {
      window.lycoris.totast.warn('密码不能为空');
      return;
    } else if (json.password.length < 6) {
      window.lycoris.totast.warn('密码长度不能小于6位');
      return;
    }

    if (!json.confirmPassword) {
      window.lycoris.totast.warn('密码确认不能为空');
      return;
    } else if (json.confirmPassword != json.password) {
      window.lycoris.totast.warn('两次输入的密码不一致');
      return;
    }

    $(this).setBusy();

    try {
      const request = $.createHttpRequest();
      request.url = `/${controller}/register`;
      request.data = { ...json };
      delete request.data.confirmPassword;

      const res = await request.post();
      if (res && res.resCode == 0) {
        model.loginSuccess = true;
        window.lycoris.totast.success('注册成功');
        setTimeout(() => {
          location.href = `/${controller}/login`;
        }, 2000);
      }
    } finally {
      $(this).clearBusy();
    }
  }, 500);

  function getEmailHost(email) {
    if (email.endsWith('@163.com') || email.endsWith('@qq.com')) {
      var arr1 = email.split('@');
      var arr2 = arr1[1].split('.');
      return `https://mail.${arr2[0]}.com`;
    } else if (email.endsWith('@outlook.com')) {
      return `https://www.outlook.com`;
    }

    return '';
  }

  function openQQMail() {
    var form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://mail.qq.com';
    form.style.display = 'none';
    form.target = '_blank';

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  this.init = function () {
    window.lycoris.totast = $.lycorisTotast();

    if ($('script[type="application/json"]').length) {
      const jsonText = $('script[type="application/json"]').text();
      const json = JSON.parse(jsonText);
      if (json && Object.keys(json).length) {
        if (json.redirect) {
          model.redirect = json.redirect;
        }
      }
    }

    $('.line-loading-preloader').removeClass('show-loading').remove();

    window.onload = function () {
      const time = sessionStorage.getItem('forget-captchaTimer');
      if (time == null) {
        return;
      }

      if (time > 0) {
        captchaTimer(time);
      } else {
        sessionStorage.removeItem('forget-captchaTimer');
      }
    };
  };

  this.init();
});
