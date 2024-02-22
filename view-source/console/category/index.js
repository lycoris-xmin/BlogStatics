$(function () {
  const controller = '/post/category';
  const table = $('#tb_departments').table();
  const tool = {
    create: $('.table-tool').find('button.btn-info'),
    search: $('.table-tool').find('button.btn-success')
  };
  const modal = $('#carete-ou-update-Modal').bootstrapModal();

  const keywordTagInput = $('#keyword-tags').jqueryTagInput();

  let modalData = {
    index: -1
  };

  async function getList(pageIndex, pageSize) {
    const request = window.lycoris.createRequest();
    request.url = `${controller}/list`;
    request.data = {
      pageIndex,
      pageSize
    };

    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    } else {
      return {};
    }
  }

  function tableInit() {
    table.options.toolbar = '.table-tool';
    table.options.showCheckbox = false;
    table.options.showColumns = false;
    table.options.autoHeight = true;
    table.options.resize = true;

    table.pageOptions.pageSize = 10;
    table.pageOptions.pageList = [10, 20, 50];

    table.columns = [
      {
        column: 'icon',
        title: '分类封面图',
        align: 'center',
        class: 'cell-icon',
        render: function (value) {
          return `
          <div class="flex-center-center">
            <img src="${value}" onerror="javascript:this.src='/statics/images/404.png'"/>
          </div>
          `;
        }
      },
      {
        column: 'name',
        title: '分类标题',
        class: 'cell-name',

        render: function (value) {
          return `<p>${value}</p>`;
        }
      },
      {
        column: 'keyword',
        title: '分类关键词',
        class: 'cell-keyword',

        render: function (value, row) {
          if (value && value.length) {
            let html = '';

            [...value].forEach(x => {
              html = html.concat(`<span class="badge badge-info">${x}</span>`);
            });

            return html;
          } else {
            return '-';
          }
        }
      },
      {
        column: 'postCount',
        title: '文章数',
        width: '120px'
      },
      {
        column: 'createTime',
        title: '创建时间',
        width: '180px'
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'center',
        render: function (value, row, index) {
          let html = `
          <button class="update" data-toggle="tooltip" data-placement="top" title="编辑">
            <i class="mdi mdi-pencil"></i>
          </button>
          <button class="delete" data-toggle="tooltip" data-placement="top" title="删除">
            <i class="mdi mdi-delete"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `;
          return html;
        },
        events: {
          'click .update': function (e, value, row, index) {
            Object.assign(modalData, row);
            modalData.index = index;
            modal.show();
          },
          'click .delete': async function (e, value, row, index) {
            const isConfirm = await window.lycoris.swal.confirm('数据删除后不可恢复', '确定要删除吗');
            if (isConfirm) {
              $(e.currentTarget).attr('disabled', 'disabled');
              try {
                const request = window.lycoris.createRequest();
                request.url = `${controller}/delete`;
                request.data = {
                  id: row.id
                };
                const res = await request.post();
                if (res && res.resCode == 0) {
                  window.lycoris.totast.success('删除成功');
                  table.removeRow('id', row.id);
                }
              } finally {
                $(e.currentTarget).removeAttr('disabled');
              }
            }
          }
        }
      }
    ];

    table.init();

    table.request = getList;

    table.loadCompelte = () => {
      $('[data-toggle="tooltip"]').tooltip();
    };
  }

  tool.create.on('click', function () {
    modal.show();
  });

  tool.search.on('click', async function () {
    $(this).setBusy();
    try {
      await table.load();
    } finally {
      $(this).clearBusy();
    }
  });

  modal.handleShow(() => {
    const form = modal.find('form');

    if (modalData.index > -1) {
      form.find('input[name="id"]').val(modalData.id);
      form.find('input[name="icon"]').val(modalData.icon);
      form.find('input[name="name"]').val(modalData.name);
      keywordTagInput.set(modalData.keyword);

      if (modalData.icon) {
        form.find('.icon').removeClass('create');
        form.find('img').attr('src', modalData.icon);
      }

      modal.find('.modal-title').text(`修改分类(${modalData.id})`);
    } else {
      keywordTagInput.set();
      modal.find('.modal-title').text('新增分类');
    }
  });

  modal.handleHidden(() => {
    modalData.index = -1;

    const form = modal.find('form');
    form.find('input[name="id"]').val('');
    form.find('input[name="icon"]').val('');
    form.find('input[name="name"]').val('');
    form.find('input[name="keywords"]').val('');
    if (!form.find('div.icon').hasClass('create')) {
      form.find('div.icon').addClass('create');
    }
  });

  modal.find('button.folder').on('click', function () {
    window.lycoris.events.call(
      'static-file-Modal.show',
      {
        fileType: 0,
        uploadType: 10,
        multiple: false
      },
      array => {
        const form = modal.find('form');
        form.find('img').attr('src', array[0].url);
        form.find('input[name="icon"]').val(array[0].url);
        form.find('div.icon').removeClass('create');
      }
    );
  });

  modal.find('button[save]').on('click', async function () {
    const json = modal.find('form').toJson();

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/${modalData.index > -1 ? 'update' : 'create'}`;
      request.data = { ...json };
      if (modalData.index == -1) {
        delete request.data.id;
      }

      const res = await request.post();

      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');

        if (modalData.index > -1) {
          table.updateRow(modalData.index, res.data);
        } else {
          table.createRow(res.data);
        }

        modal.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = async function () {
    tableInit();
    window.lycoris.loading.hide();

    await table.load();
  };

  this.init();
});
