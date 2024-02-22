$(function () {
  const controller = '/message';
  const table = $('#tb_departments').table();
  const tool = {
    search: $('.table-tool').find('button.btn-success')
  };

  const modal = $('#audit-Modal').bootstrapModal();

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
        column: 'content',
        title: '留言展示内容',
        render: function (value, row) {
          return `<p class="message-content ${row.originalContent ? 'original-content' : ''}">${value}</p>`;
        }
      },
      {
        column: 'createUser',
        title: '留言用户',
        width: '150px',
        render: function (value, row) {
          if (row.isOwner) {
            return `<span class="badge badge-info">${value}</span>`;
          } else {
            return value;
          }
        }
      },
      {
        column: 'status',
        title: '状态',
        align: 'center',
        width: '100px',
        render: function (value, row) {
          if (row.originalContent) {
            return `<span class="badge badge-dark">待审核</span>`;
          } else if (value == 0) {
            return `<span class="badge badge-success">正常</span>`;
          } else if (value == 1) {
            return `<span class="badge badge-warning">违规</span>`;
          } else {
            return `<span class="badge badge-danger">删除</span>`;
          }
        }
      },
      {
        column: 'ip',
        title: '来源IP',
        width: '150px'
      },
      {
        column: 'ipAddress',
        title: 'IP归属地',
        width: '250px'
      },
      {
        column: 'createTime',
        title: '留言时间',
        width: '180px'
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'left',
        render: function (value, row, index) {
          let html = '';

          html = html.concat(`
          <button class="info" data-toggle="tooltip" data-placement="top" title="详细信息">
            <i class="mdi mdi-eye"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `);

          html = html.concat(`
          <button class="delete" data-toggle="tooltip" data-placement="top" title="删除">
            <i class="mdi mdi-delete"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
        `);

          return html;
        },
        events: {
          'click .info': function (e, value, row, index) {
            model.index = index;
            model.row = row;
            modal.find('div.content').text(row.originalContent || row.content);
            modal.find('select').bootstrapSelectpicker().set(row.status);
            modal.show();
          },
          'click .delete': async function (e, value, row, index) {
            const isConfirmed = await window.lycoris.swal.confirm('数据删除后不可恢复', '确定要删除吗');
            if (isConfirmed) {
              $(e.currentTarget).setBusy();
              try {
                const request = window.lycoris.createRequest();
                request.url = `${controller}/delete`;
                request.data = {
                  ids: [row.id]
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

  modal.find('button[save]').on('click', async function () {
    let status = modal.find('select[name="status"]').val();
    if (status == 0) {
      return;
    }

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/violation`;
      request.data = {
        id: model.row.id
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        model.row.status = 1;
        table.updateRow(model.index, model.row);
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
