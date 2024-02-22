$(function () {
  const doms = {
    email: $('input[name="email"]'),
    password: $('input[name="password"]'),
    btn: $('.login-btn')
  };

  doms.email.on('focus', function () {
    $(this).parent().addClass('focus');
  });

  doms.email.on('blur', function () {
    if (!$(this).val()) {
      $(this).parent().removeClass('focus');
    }
  });

  doms.password.on('focus', function () {
    $(this).parent().addClass('focus');
  });

  doms.password.on('blur', function () {
    if (!$(this).val()) {
      $(this).parent().removeClass('focus');
    }

    this.type = 'password';
  });

  doms.btn.on('click', async function () {
    $(this).setBusy();
    const data = $('.login-container').toJson();
    try {
      let res = await loginValidate(data);
      if (res && res.resCode == 0) {
        res = await login({
          email: data.email,
          oathCode: res.data.oathCode,
          remember: data.remember
        });

        if (res && res.resCode == 0) {
          location.href = `${window.lycoris.console}/dashboard`;
        }
      }
    } finally {
      $(this).clearBusy();
    }
  });

  function loginValidate({ email, password }) {
    const request = $.createHttpRequest();
    request.url = '/authentication/login/validate';
    request.data = {
      email,
      password
    };
    return request.post();
  }

  function login({ email, oathCode, remember }) {
    const request = $.createHttpRequest();
    request.url = '/authentication/login/oathcode';
    request.data = {
      email,
      oathCode,
      remember
    };
    return request.post();
  }

  this.init = function () {
    //
    if (window.top == window.self) {
      $('div.bg').removeClass('loading');

      window.lycoris.totast = $.totast;
    } else {
      window.parent.lycoris.totast.warn('登录已过期，请重新登录');
      setTimeout(() => {
        window.parent.location.href = `${window.lycoris.console}/authentication/login`;
      }, 1000);
    }

    setTimeout(() => {
      if (doms.email.val()) {
        doms.email.parent().addClass('focus');
      }

      if (doms.password.val()) {
        doms.password.parent().addClass('focus');
      }
    }, 500);
  };

  this.init();
});
