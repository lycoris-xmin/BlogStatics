$(function () {
  const controller = '/friendly';
  const table = $('#tb_departments').table();
  const tool = {
    create: $('.table-tool').find('button.btn-info'),
    search: $('.table-tool').find('button.btn-success')
  };

  const modal = {
    createorupdate: $('#createorupdate-Modal').bootstrapModal(),
    audit: $('#audit-Modal').bootstrapModal()
  };

  const selectpicker = modal.audit.find('select[name="status"]').bootstrapSelectpicker();

  const model = {
    index: -1,
    row: {}
  };

  async function getList(pageIndex, pageSize) {
    const request = window.lycoris.createRequest();
    request.url = `${controller}/list`;
    request.data = {
      pageIndex,
      pageSize
    };

    const json = $('div.filter-panel').toJson();
    if (json.name.trim()) {
      request.data.name = json.name.trim();
    }

    if (json.status != null && json.status >= 0) {
      request.data.status = json.status;
    }

    const filter = $('.filter-panel').toJson();

    for (let key in filter) {
      const data = filter[key];
      if (data || typeof data == 'number') {
        request.data[key] = filter[key];
      }
    }

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
    table.options.pageSizeResize = true;

    table.columns = [
      {
        column: 'logo',
        title: '网站Logo',
        width: '100px',
        render: function (value, row) {
          return `<div class="flex-center-center">
                    <img class="logo" src="${value}" title="${row.name}" onerror="javascript:this.src='/statics/images/404.png'"/>
                  </div>`;
        }
      },
      {
        column: 'name',
        title: '网站名称',
        width: '350px',
        render: function (value, row) {
          return value;
        }
      },
      {
        column: 'link',
        title: '网站链接',
        render: function (value, row) {
          return `<a class="link" href="${value}" target="_blank">${value}</a>`;
        }
      },
      {
        column: 'status',
        title: '状态',
        width: '100px',
        align: 'center',
        render: function (value) {
          if (value == 0) {
            return '<span class="badge badge-secondary">未审核</span>';
          } else if (value == 1) {
            return '<span class="badge badge-success">通过</span>';
          } else {
            return '<span class="badge badge-danger">拒绝</span>';
          }
        }
      },
      {
        column: 'createUserName',
        title: '创建用户',
        width: '200px'
      },
      {
        column: 'createTime',
        title: '申请时间',
        width: '180px'
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'center',
        render: function (value, row, index) {
          let html = '';

          if (row.status != 1) {
            html = html.concat(`
          <button class="info" data-toggle="tooltip" data-placement="top" title="审核">
            <i class="mdi mdi-checkbox-marked-circle"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `);
          } else {
            html = html.concat(`
          <button class="warning" data-toggle="tooltip" data-placement="top" title="编辑">
            <i class="mdi mdi-pencil"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `);
          }

          html = html.concat(`
          <button class="delete" data-toggle="tooltip" data-placement="top" title="删除">
            <i class="mdi mdi-delete"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
        `);

          return html;
        },
        events: {
          'click .warning': function (e, value, row, index) {
            model.index = index;
            model.row = row;
            modal.createorupdate.show();
            modal.createorupdate.find('.modal-title').text(`编辑友情链接(${row.id})`);
          },
          'click .info': function (e, value, row, index) {
            model.index = index;
            model.row = row;
            modal.audit.show();
          },
          'click .delete': async function (e, value, row, index) {
            const isConfirmed = await window.lycoris.swal.confirm('数据删除后不可恢复', '确定要删除吗');
            if (isConfirmed) {
              $(e.currentTarget).setBusy();
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
                $(e.currentTarget).clearBusy();
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

  tool.search.on('click', async function () {
    $(this).setBusy();
    try {
      await table.load();
    } finally {
      $(this).clearBusy();
    }
  });

  tool.create.on('click', function () {
    modal.createorupdate.show();
  });

  modal.createorupdate.handleShow(() => {
    if (model.index > -1 && model.row.id != void 0) {
      $(this)
        .find('input,textarea')
        .each((i, el) => {
          const key = $(el).attr('name');
          if (model.row[key]) {
            $(el).val(model.row[key]);
          }
        });
    }
  });

  modal.audit.handleShow(() => {
    if (model.index > -1 && model.row.id != void 0) {
      selectpicker.set(model.row.status);
    }

    modal.audit.find('textarea').val(model.row.remark || '');
  });

  modal.createorupdate.handleHidden(() => {
    $(this)
      .find('input,textarea')
      .each((i, el) => {
        $(el).val('');
      });

    model.index = -1;
    model.row = {};
    modal.createorupdate.find('.modal-title').text('新增友情链接');
  });

  modal.audit.handleHidden(() => {
    model.index = -1;
    model.row = {};
    selectpicker.set('1');
    modal.audit.find('textarea').val('');
  });

  modal.createorupdate.find('button[save]').on('click', async function () {
    const json = modal.createorupdate.find('form').toJson();
    if (!json.link) {
      window.lycoris.totast.warn('网站链接不能为空');
      return;
    } else if (!$.regex.url(json.link)) {
      window.lycoris.totast.warn('网站链接格式错误');
      return;
    }

    if (!json.logo) {
      window.lycoris.totast.warn('网站Logo链接不能为空');
      return;
    } else if (!$.regex.url(json.logo)) {
      window.lycoris.totast.warn('网站Logo链接格式错误');
      return;
    }

    if (!json.name) {
      window.lycoris.totast.warn('网站名称不能为空');
      return;
    }

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();

      request.url = model.index > -1 ? `${controller}/update` : `${controller}/create`;

      request.data = { ...json };

      if (model.index > -1) {
        request.data.id = model.row.id;
      }

      const res = await request.post();

      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');

        if (model.index == -1) {
          table.createRow(res.data, false);
        } else {
          table.updateRow(model.index, res.data);
        }

        modal.createorupdate.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  modal.audit.find('button[save]').on('click', async function () {
    const data = {
      id: model.row.id,
      status: selectpicker.getValue(),
      remark: modal.audit.find('textarea').val()
    };

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/audit`;
      request.data = { ...data };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        model.row.status = data.status;
        model.row.remark = data.remark;
        table.updateRow(model.index, model.row);

        modal.audit.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = function () {
    tableInit();

    window.lycoris.loading.hide();

    table.load();
  };

  this.init();
});
