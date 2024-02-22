$(function () {
  const dialog = {
    skill: $('#skill-Modal').bootstrapModal()
  };

  const model = {
    skill: {
      type: '',
      id: '',
      name: '',
      proficiency: 100,
      data: {
        code: [],
        frame: [],
        sql: [],
        other: []
      }
    },
    contact: {
      qrcode: {
        qq: void 0,
        weChat: void 0
      }
    }
  };

  const bodyBusy = $('body').busy();

  $('div.card-header>.btn-secondary').on('click', async function () {
    const isconfirm = await window.lycoris.swal.confirm('确定要关闭当前页面吗？');
    if (isconfirm) {
      $('body').fadeOut(() => {
        window.parent.lycoris.multitabs.remove(location.pathname);
      });
    }
  });

  $('textarea[name="introduction"]').on('input', function () {
    const length = $(this).val().length;

    const limit = $(this).next().find('span');
    limit.text(length);

    if (length >= parseInt($(this).attr('maxlength'))) {
      limit.css('color', 'var(--color-danger)');
    } else {
      limit.css('color', 'var(--color-dark-light)');
    }
  });

  $('.skill-item')
    .find('.mdi-plus')
    .on('click', function () {
      model.skill.type = $(this).data('type');

      skillDialogShow();
    });

  dialog.skill.find('input[name="proficiency"]').on(
    'input',
    $.debounce(function () {
      const val = $(this).val();
      let num = parseInt(val);
      if (isNaN(num) || $(this).val() < 0) {
        $(this).val(0);
      } else if (num > 100) {
        $(this).val(100);
      }
    }, 500)
  );

  dialog.skill.handleShow(function () {
    $(this).find('input[name="name"]').val(model.skill.name);
    $(this).find('input[name="proficiency"]').val(model.skill.proficiency);
  });

  dialog.skill.handleShown(function () {
    $(this).find('input[name="name"]').focus();
  });

  dialog.skill.handleHidden(function () {
    model.skill.id = '';
    model.skill.name = '';
    model.skill.proficiency = 100;
  });

  dialog.skill.find('button[save]').on('click', function () {
    const json = dialog.skill.find('.modal-body').toJson();

    if (model.skill.id > 0) {
      const data = model.skill.data[model.skill.type].filter(x => x.id == model.skill.id)[0];
      if (data.name == json.name && data.proficiency == json.proficiency) {
        dialog.skill.hide();
        return;
      }
    }

    if (!json.name) {
      window.lycoris.totast.warn(`${changeTypeToName(model.skill.type)}名称： 不能为空`);
      return;
    }

    if (json.proficiency == '' || json.proficiency == 0) {
      window.lycoris.totast.warn('掌握度不能为空或0');
      return;
    }

    const filter = model.skill.data[model.skill.type].filter(x => x.name == json.name && x.id != model.skill.id);
    if (filter && filter.length) {
      window.lycoris.totast.warn(`${changeTypeToName(model.skill.type)}名称： ${json.name} 已添加`);
      return;
    }

    json.proficiency = parseInt(json.proficiency);

    createSkill(model.skill.type, json);

    dialog.skill.hide();
  });

  function createSkill(type, data) {
    if (model.skill.id) {
      const li = $(`ul[data-type="${type}"]>li[data-id="${model.skill.id}"]`);

      li.find('span.name').text(data.name);
      li.find('span.value').text(data.proficiency);

      const index = model.skill.data[type].findIndex(x => x.id == model.skill.id);
      model.skill.data[type][index].name = data.name;
      model.skill.data[type][index].proficiency = data.proficiency;
      console.log(model.skill.data[type]);
      return;
    }

    const id = model.skill.data[type].length && model.skill.data[type][model.skill.data[type].length - 1].id ? model.skill.data[type][model.skill.data[type].length - 1].id + 1 : 1;

    let html = `
    <li class="flex-between-center" data-id="${id}">
      <span class="name">${data.name}</span>
      <div>
        <span class="value">${data.proficiency}</span>
        <span class="mdi mdi-pencil" data-toggle="tooltip" data-placement="top" title="修改"></span>
        <span class="mdi mdi-delete" data-toggle="tooltip" data-placement="top" title="删除"></span>
      </div>
    </li>
    `;

    const el = $(html);

    el.slideUp();

    $(`ul[data-type="${type}"]`).append(el);

    el.slideDown();

    if (model.skill.type && model.skill.data[model.skill.type].length > 0) {
      const empty = $(`ul[data-type="${type}"]`).find('li.empty');

      empty.remove();

      const li = $(`ul[data-type="${type}"]`).children('li').detach();

      li.sort(function (a, b) {
        return parseInt($(b).find('.value').text(), 10) - parseInt($(a).find('.value').text(), 10);
      });

      $(`ul[data-type="${type}"]`).empty().append(empty).append(li);
    }

    el.find('.mdi-pencil').on('click', function () {
      const parent = $(this).parent().parent();

      model.skill.type = parent.parent().data('type');
      model.skill.id = parent.data('id');
      model.skill.name = parent.find('span.name').text();
      model.skill.proficiency = parseFloat(parent.find('span.value').text());

      skillDialogShow();
    });

    el.find('.mdi-delete').on('click', async function () {
      const isconfirm = await window.lycoris.swal.confirm('确定要移除吗?');
      if (isconfirm) {
        const li = $(this).parent().parent();
        li.slideUp(function () {
          const type = $(this).parent().data('type');
          const name = parent.find('span.name').text();

          $(this).remove();

          model.skill.data[type] = model.skill.data[type].filter(x => x.name != name);
        });
      }
    });

    model.skill.data[type].push({
      id: id,
      ...data
    });
  }

  function skillDialogShow() {
    let type = changeTypeToName(model.skill.type);

    dialog.skill.find('.modal-title').text(`新增${type}`);
    dialog.skill.find('label[type]').text(`${type}名称`);
    dialog.skill.show();
  }

  function changeTypeToName(dataType) {
    let type = '其他';
    if (dataType == 'code') {
      type = '语言';
    } else if (dataType == 'frame') {
      type = '框架';
    } else if (dataType == 'sql') {
      type = '数据库';
    }

    return type;
  }

  $('.contact')
    .find('.qrcode>.empty,.qrcode>img')
    .on('click', function () {
      $(this).parent().prev().trigger('click');
    });

  $('.contact')
    .find('input[name="qq-qrcode"],input[name="weChat-qrcode"]')
    .on('change', function () {
      const name = $(this).attr('name');
      if (name == 'qq-qrcode') {
        model.contact.qrcode.qq = $(this)[0].files[0];
      } else {
        model.contact.qrcode.weChat = $(this)[0].files[0];
      }

      const url = window.lycoris.tool.createObjectURL($(this)[0].files[0]);

      const img = $(this).next().find('img');
      if (img && img.length) {
        img.attr('src', url);
      } else {
        createContactImg.call(this, url);
      }
    });

  $('.contact')
    .find('.btn-outline-danger')
    .on('click', async function () {
      const isconfirm = await window.lycoris.swal.confirm('确定要移除展示吗？');
      if (isconfirm) {
        const img = $(this).parent().prev().find('img');
        img.fadeOut(function () {
          $(this).remove();
        });
      }
    });

  function createContactImg(url) {
    const data = $(this).attr('name') == 'qq-qrcode' ? 'qq' : 'wechat';
    const el = $(`<img src="${url}" onerror="javascript:this.src='/statics/images/404.png'" data-toggle="tooltip" data-placement="top" title="" data-original-title="点击更换" ${data}>`);
    $(this).next().prepend(el);
    el.tooltip();
    el.on('click', function () {
      $(this).parent().prev().trigger('click');
    });
  }

  async function getUserBrief() {
    const request = window.lycoris.createRequest();
    request.url = '/user/brief';
    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    } else {
      return {};
    }
  }

  async function getAboutSettings(type) {
    const request = window.lycoris.createRequest();
    request.url = `/about/me/${type}`;
    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    } else {
      return {};
    }
  }

  async function pageInit() {
    const brief = await getUserBrief();

    $('div.brief').formAutoFill(brief);

    const info = await getAboutSettings('info');

    $('div.info').formAutoFill(info, {
      taginput: el => {
        $(el).tagsInput({
          height: $(el).data('height') ? $(el).data('height') : '40px',
          width: '100%',
          defaultText: $(el).attr('placeholder'),
          removeWithBackspace: true,
          delimiter: [','],
          maxTags: 8,
          maxLimit: function () {
            window.lycoris.totast.warn('标签最多只能添加八个');
          }
        });
      }
    });

    $('div.info').find('select[name="sex"]').bootstrapSelectpicker().set(info.sex);
    $('div.info').find('select[name="educational"]').bootstrapSelectpicker().set(info.educational);
    $('div.info').find('select[name="institutions"]').bootstrapSelectpicker().set(info.institutions);

    const skill = await getAboutSettings('skill');

    for (let type in skill) {
      if (skill[type].length) {
        for (let data of skill[type]) {
          createSkill(type, data);
        }
      }
    }

    const contact = await getAboutSettings('contact');

    if (contact.qq) {
      createContactImg.call($('div.contact').find('input[name="qq-qrcode"]'), contact.qq);
    }

    if (contact.weChat) {
      createContactImg.call($('div.contact').find('input[name="weChat-qrcode"]'), contact.weChat);
    }
  }

  $('div.card-header>.btn-info').on('click', async function () {
    const brief = $('div.brief').toJson();

    const info = $('div.info').toJson();

    const skill = model.skill.data;

    const contact = {
      qq: '',
      weChat: ''
    };

    bodyBusy.show('数据提交中,请稍候...');
    try {
      if (model.contact.qrcode.qq) {
        //
        const res = await window.lycoris.fileUpload(model.contact.qrcode.qq, 100, 'qq.webp');
        if (!res || res.resCode != 0) {
          return;
        }

        contact.qq = res.data.url;
        model.contact.qrcode.qq = void 0;
      } else {
        const qrcode = $('div.contact').find('img[qq]');
        if (qrcode && qrcode.length) {
          contact.qq = qrcode.attr('src');
        }
      }

      if (model.contact.qrcode.weChat) {
        //
        const res = await window.lycoris.fileUpload(model.contact.qrcode.weChat, 100, 'wechat.webp');
        if (!res || res.resCode != 0) {
          return;
        }

        contact.weChat = res.data.url;
        model.contact.qrcode.weChat = void 0;
      } else {
        const qrcode = $('div.contact').find('img[wechat]');
        if (qrcode && qrcode.length) {
          contact.weChat = qrcode.attr('src');
        }
      }

      const request = window.lycoris.createRequest();
      request.url = '/about/me/save';
      request.data = {
        brief: brief,
        info: info,
        skill: skill,
        contact: contact
      };

      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        window.lycoris.element.update('.dropdown-profile>a>span', function () {
          $(this).text(brief.nickName);
        });
      }
    } finally {
      bodyBusy.hide();
    }
  });

  this.init = async function () {
    await pageInit();

    window.lycoris.loading.hide();

    $('[data-toggle="tooltip"]').tooltip();
  };

  this.init();
});
