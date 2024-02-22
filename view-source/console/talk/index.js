$(function () {
  const controller = '/talk';
  const table = $('#tb_departments').table();
  const tool = {
    create: $('.table-tool').find('button.btn-info'),
    search: $('.table-tool').find('button.btn-success')
  };

  const model = {
    showIndex: -1,
    row: []
  };
  const modal = $('#create-update-Modal').bootstrapModal();

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
      model.rows = res.data.list;
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
        column: 'createTime',
        title: '发布时间',
        width: '180px'
      },
      {
        column: 'content',
        title: '内容',

        render: function (value) {
          return value;
        }
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'center',
        render: function (value, row, index) {
          let html = `
          <button class="info" data-toggle="tooltip" data-placement="top" title="编辑">
            <i class="mdi mdi-pencil"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `;

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
            model.showIndex = index;
            model.row = row;
            modal.show();
          },
          'click .delete': function (e, value, row, index) {
            talkDelete.call(e.currentTarget, row);
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

  tool.create.on('click', async function () {
    modal.show();
  });

  modal.find('textarea').on('input', function () {
    const val = $(this).val();
    const el = $(this).next().find('span.value');
    el.text(val.length);
    if (val.length >= 300) {
      el.addClass('text-danger');
    } else {
      el.removeClass('text-danger');
    }
  });

  modal.handleShow(() => {
    if (model.showIndex == -1) {
      modal.find('h6').text('发布瞬间');
    } else {
      modal.find('h6').text('编辑瞬间');
      if (model.row && model.row.id) {
        modal.find('textarea').val(model.row.content);
        const el = modal.find('textarea').next().find('span.value');
        el.text(model.row.content.length);
        if (model.row.content.length >= 300) {
          el.addClass('text-danger');
        } else {
          el.removeClass('text-danger');
        }
      }
    }
  });

  modal.handleHidden(() => {
    model.showIndex = -1;
    model.row = {};
    modal.find('textarea').val('');
  });

  modal.find('button[save]').on('click', async function () {
    const content = modal.find('textarea').val();
    if (!content) {
      modal.hide();
      return;
    } else if (content.length > 300) {
      window.lycoris.totast.warn('内容字数不能超过300字符');
      return;
    }

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/createorupdate`;
      request.data = {
        content: content
      };

      if (model.showIndex > -1 && model.row.id) {
        request.data.id = model.row.id;
      }

      const res = await request.post();

      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        if (model.showIndex == -1) {
          table.createRow(res.data, false);
        } else {
          table.updateRow(model.showIndex, res.data);
        }

        modal.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  async function talkDelete(row) {
    const isConfirmed = await window.lycoris.swal.confirm('数据删除后不可恢复', '确定要删除吗');
    if (isConfirmed) {
      $(this).setBusy();
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
        $(this).clearBusy();
      }
    }
  }

  this.init = function () {
    tableInit();

    window.lycoris.loading.hide();

    table.load();
  };

  this.init();
});
