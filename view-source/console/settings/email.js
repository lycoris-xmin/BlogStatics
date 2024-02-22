$(function () {
  //
  const dom = $('#email');
  const selectpicker = dom.find('.selectpicker').bootstrapSelectpicker();

  dom.find('button[test]').on('click', async function () {
    await window.lycoris.swal.custome({
      title: '邮件服务测试',
      text: '请输入要接收测试邮件的邮箱地址',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      showLoaderOnConfirm: true,
      preConfirm: async value => {
        if (!$.regex.email(value)) {
          window.lycoris.swal._this.showValidationMessage('请输入正确的邮箱地址');
          return;
        }

        try {
          const json = dom.find('form').toJson();
          const request = window.lycoris.createRequest();
          request.url = '/settings/email/test';
          request.data = {
            ...json,
            testEmail: value
          };
          const res = await request.post();
          if (res && res.resCode == 0) {
            window.lycoris.totast.info('测试邮件已发送');
          }

          return res;
        } catch (error) {
          //
        }
      },
      allowOutsideClick: () => !window.lycoris.swal._this.isLoading()
    });
  });

  dom.find('button[save]').on('click', async function () {
    $(this).setBusy();

    const json = dom.find('form').toJson();

    try {
      const request = window.lycoris.createRequest();
      request.url = '/settings/email';
      request.data = { ...json };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
      }
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = function () {
    //
    window.lycoris.events.on('email', function (data) {
      dom.formAutoFill(data);

      if (data.useSSL) {
        selectpicker.set(data.useSSL.toString());
      }
    });
  };

  this.init();
});
