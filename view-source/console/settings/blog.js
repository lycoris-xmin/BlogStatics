$(function () {
  const dom = $('#blog');
  let images = {};

  const selectpicker = dom.find('.selectpicker').bootstrapSelectpicker();

  dom.find('.selectpicker').on('change', autoSaveChange);

  dom.find('.images').find('.mdi-delete').on('click', postImageRemove);

  dom.find('div.image-upload').on('click', function () {
    dom.find('input[type="file"]').trigger('click');
  });

  dom.find('input[type="file"]').on('change', function (e) {
    if (e.target.files && e.target.files.length) {
      const time = new Date().getTime();
      images[time] = e.target.files[0];

      const url = window.lycoris.tool.createObjectURL(images[time]);

      createPostIconHtml(url, time);

      $(this).val('');
    }
  });

  dom.find('button[addRemind]').on('click', async function () {
    const res = await window.lycoris.swal.custome({
      title: '添加留言提醒',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消'
    });

    if (res.isConfirmed && res.value) {
      createRemindHtml(res.value);
    }
  });

  dom.find('button[save]').on('click', async function () {
    $(this).setBusy();
    try {
      const json = dom.find('form').toJson();

      json.images = [];

      if (images && Object.keys(images).length) {
        let i = 1;
        for (let image in images) {
          if (typeof images[image] == 'string') {
            i++;
            continue;
          }

          const tmp = await window.lycoris.fileUpload(images[image], 1, `${i++}.webp`);
          if (tmp && tmp.resCode == 0) {
            $(`img[data-id="${image}"]`).data('src', tmp.data.url);
            images[image] = tmp.data.url;
          } else {
            //
            return;
          }
        }
      }

      const imageEls = dom.find('div.images').find('img[data-id]');
      imageEls.each((i, el) => {
        json.images.push($(el).data('src'));
      });

      json.messageRemind = [];
      const remindEls = dom.find('div.remind').find('ul');
      remindEls.find('li>p').each((i, el) => {
        json.messageRemind.push($(el).text());
      });

      const request = window.lycoris.createRequest();
      request.url = '/settings/blog';
      request.data = { ...json };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
      }
    } finally {
      $(this).clearBusy();
    }
  });

  function remindInit() {
    new Sortable(dom.find('.remind').find('ul')[0], {
      animation: 150,
      easing: 'cubic-bezier(1, 0, 0, 1)'
    });

    dom.find('.remind').find('span.mdi-close').on('click', remindRemove);
  }

  function postImageRemove() {
    $(this).parent().parent().remove();
    const time = $(this).data('id');
    if (time) {
      delete images[time];
    }
  }

  function autoSaveChange() {
    const val = dom.find('.selectpicker').val();

    const input = dom.find('input[name="second"]');

    if (eval(val)) {
      //
      input.removeAttr('disabled');
    } else {
      input.attr('disabled', 'disabled');
    }
  }

  function createPostIconHtml(url, time = 0) {
    const html = `
    <div>
      <img src="${url}" onerror="javascript:this.src='/statics/images/404.png'" data-src="${url}" data-id="${time}"/>
      <div class="flex-center-center overlay">
        <span class="mdi mdi-delete" data-id="${time}"></span>
      </div>
    </div>
    `;

    const el = $(html);

    el.insertBefore('div.image-upload');

    el.find('.mdi-delete').on('click', postImageRemove);
  }

  function createRemindHtml(content) {
    const html = `
    <li style="display:none">
      <p>${content}</p>
      <div class="flex-center-center">
        <span class="mdi mdi-close"></span>
      </div>
    </li>
    `;

    const el = $(html);

    dom.find('.remind').find('ul').append(el);

    el.slideDown(200).css('display', 'grid');

    el.find('span.mdi-close').on('click', remindRemove);
  }

  function remindRemove() {
    const el = $(this).parent().parent();
    el.slideUp(200, () => {
      el.remove();
    });
  }

  this.init = function () {
    remindInit();

    window.lycoris.events.on('blog', function (data) {
      //
      selectpicker.set(data.autoSave.toString());
      dom.find('input[name="second"]').val(data.second);

      if (data.images && data.images.length) {
        let i = 1;
        for (let item of data.images) {
          createPostIconHtml(item, i);
          images[i++] = '';
        }
      }

      dom.find('input[name="commentFrequencySecond"]').val(data.commentFrequencySecond);

      if (data.messageRemind && data.messageRemind.length) {
        for (let item of data.messageRemind) {
          createRemindHtml(item);
        }
      }

      dom.find('input[name="messageFrequencySecond"]').val(data.messageFrequencySecond);

      autoSaveChange();
    });
  };

  this.init();
});
