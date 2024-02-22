$(function () {
  const dom = $('#other');

  const selectpicker = {
    monitoringPush: dom.find('.service').find('select[name="monitoringPush"]').bootstrapSelectpicker(),
    commentPush: dom.find('.service').find('select[name="commentPush"]').bootstrapSelectpicker(),
    messagePush: dom.find('.service').find('select[name="messagePush"]').bootstrapSelectpicker()
  };

  const button = {
    showdoc: {
      test: dom.find('.service').find('button[test]'),
      save: dom.find('.service').find('button[save]')
    },
    file: dom.find('.data-clear').find('.file').find('button[save]'),
    sql: dom.find('.data-clear').find('.sql').find('button[save]')
  };

  dom
    .find('div.other')
    .find('>.flex-between-center:first-child')
    .on('click', function (e) {
      e.stopPropagation();

      let shrink = $(this).attr('data-shrink');
      shrink = shrink == 0 ? 1 : 0;

      const body = $(this).next();

      if (shrink) {
        body.slideDown(300);
      } else {
        body.slideUp(300);
      }

      $(this).attr('data-shrink', shrink);
    });

  selectpicker.monitoringPush.on('change', function () {
    const val = eval($(this).val());
    const container = dom.find('.service').find('div.monitor-container');
    if (val) {
      container.fadeIn(300);
    } else {
      container.fadeOut(300);
    }
  });

  button.showdoc.test.on('click', function () {
    //
    debugger;
  });

  button.showdoc.save.on('click', async function () {
    $(this).setBusy();

    try {
      const json = dom.find('.showdoc').find('form').toJson();
      const request = window.lycoris.createRequest();
      request.url = '/settings/other/showdoc';
      request.data = {
        ...json
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('Showdoc配置保存成功');
      }
    } finally {
      $(this).clearBusy();
    }
  });

  button.file.on('click', async function () {
    //
    $(this).setBusy();
    try {
      const json = dom.find('.data-clear').find('.file').toJson();
      const request = window.lycoris.createRequest();
      request.url = '/settings/other/dataclear/file';
      request.data = { ...json };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('文件清理配置保存成功');
      }
    } finally {
      $(this).clearBusy();
    }
  });

  button.sql.on('click', async function () {
    //
    $(this).setBusy();
    try {
      const json = dom.find('.data-clear').find('.sql').toJson();
      const request = window.lycoris.createRequest();
      request.url = '/settings/other/dataclear/sql';
      request.data = { ...json };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('数据库清理配置保存成功');
      }
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = function () {
    window.lycoris.events.on('other', function (data) {
      if (data.showdoc) {
        const service = dom.find('div.service');
        service.formAutoFill(data.showdoc);
        selectpicker.monitoringPush.set(data.showdoc.monitoringPush.toString());
        selectpicker.commentPush.set(data.showdoc.commentPush.toString());
        selectpicker.messagePush.set(data.showdoc.messagePush.toString());

        selectpicker.monitoringPush.trigger('change');
      }

      if (data.dataClear) {
        const dataClear = dom.find('div.data-clear');
        dataClear.formAutoFill(data.dataClear);
      }
    });
  };

  this.init();
});
