$(function () {
  const dom = $('#basic');
  const model = {
    console: ''
  };

  dom.find('input[name="logo"]').on('change', function (e) {
    const file = e.target.files[0];
    $(this).next().find('img').attr('src', window.lycoris.tool.createObjectURL(file));
  });

  dom.find('.logo-view').on('click', function () {
    $(this).prev().trigger('click');
  });

  dom.find('textarea').on('input', function () {
    const val = $(this).val();

    $(this).next().find('span').text(val.length);

    if (val.length >= $(this).attr('maxlength')) {
      $(this).next().addClass('danger');
    } else {
      $(this).next().removeClass('danger');
    }
  });

  dom.find('input[name="avatar"]').on('change', function (e) {
    const file = e.target.files[0];
    $(this).next().find('img').attr('src', window.lycoris.tool.createObjectURL(file));
  });

  dom.find('.avatar-view').on('click', function () {
    $(this).prev().trigger('click');
  });

  dom.find('button[save]').on('click', async function () {
    const json = dom.find('form').toJson();

    let file = {};
    const logo = dom.find('input[name="logo"]')[0].files;
    if (logo.length) {
      file.logo = logo[0];
    }

    const avatar = dom.find('input[name="avatar"]')[0].files;
    if (avatar.length) {
      file.avatar = avatar[0];
    }

    $(this).setBusy();

    try {
      const request = window.lycoris.createRequest();
      request.url = '/settings/webbasic';
      request.formData = json;
      const res = await request.post(file);

      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');

        if (res.data.logo) {
          dom.find('.logo-view').find('img').attr('src', res.data.logo);
        }

        if (res.data.defaultAvatar) {
          dom.find('.avatar-view').find('img').attr('src', res.data.defaultAvatar);
        }

        if (model.console != res.data.console) {
          setTimeout(async () => {
            model.console = res.data.console;
            await window.lycoris.swal.info('检测到后台路径变动，页面将重新加载');
            window.lycoris.changeConsole(res.data.console);
          }, 500);
        }
      }
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = function () {
    model.console = dom.find('input[name="console"]').val();

    window.lycoris.events.on('basic', function (data) {
      model.console = data.console;

      dom.formAutoFill(data, {
        taginput: el => {
          $(el).jqueryTagInput({
            maxTags: 5,
            inputWidth: '90px',
            maxLimit: function () {
              window.lycoris.totast.warn('标签最多只能添加五个');
            }
          });
        }
      });

      dom.find('.avatar-view>img').attr('src', data.defaultAvatar);
    });
  };

  this.init();
});
