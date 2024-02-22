$(function () {
  //
  const dom = $('#staticfile');

  const selectpicker = {
    uploadChannel: dom.find('select[name="uploadChannel"]').bootstrapSelectpicker(),
    localBackup: dom.find('select[name="localBackup"]').bootstrapSelectpicker(),
    loadFileSrc: dom.find('select[name="loadFileSrc"]').bootstrapSelectpicker()
  };

  dom.find('select[name="uploadChannel"]').on('change', function () {
    const val = $(this).val();

    dom.find('div.channel.active').slideUp(300).removeClass('active');

    if (val == 0) {
      selectpicker.localBackup.disable();
      selectpicker.loadFileSrc.disable();
      return;
    }

    selectpicker.localBackup.enable();
    selectpicker.loadFileSrc.enable();

    if (val == 10) {
      dom.find('div.channel.github').slideDown(300).addClass('active');
    } else if (val == 20) {
      dom.find('div.channel.minio').slideDown(300).addClass('active');
    } else if (val == 30) {
      dom.find('div.channel.aliyun').slideDown(300).addClass('active');
    } else if (val == 40) {
      dom.find('div.channel.tencent').slideDown(300).addClass('active');
    } else if (val == 50) {
      dom.find('div.channel.huawei').slideDown(300).addClass('active');
    } else if (val == 60) {
      dom.find('div.channel.kudo').slideDown(300).addClass('active');
    }
  });

  dom.find('button[save]').on('click', async function () {
    $(this).setBusy();

    try {
      const form = dom.find('form');
      const json = form.find('div.basic').toJson();
      json.github = form.find('div.github').toJson();
      json.monio = form.find('div.minio').toJson();

      const request = window.lycoris.createRequest();
      request.url = '/settings/staticfile';
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
    window.lycoris.events.on('staticFile', function (data) {
      //
      selectpicker.uploadChannel.set(data.uploadChannel.toString());
      selectpicker.localBackup.set(data.localBackup.toString());
      selectpicker.loadFileSrc.set(data.loadFileSrc.toString());

      const github = dom.find('div.channel.github');
      github.formAutoFill(data.github);

      const minio = dom.find('div.channel.monio');
      minio.formAutoFill(data.minio);

      dom.find('select[name="uploadChannel"]').trigger('change');
    });
  };

  this.init();
});
