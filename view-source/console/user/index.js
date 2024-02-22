$(function () {
  const controller = '/user';
  const table = $('#tb_departments').table();
  const tool = {
    create: $('.table-tool').find('button.btn-info'),
    search: $('.table-tool').find('button.btn-success')
  };

  const model = {
    status: [],
    showIndex: -1,
    row: {}
  };

  const modal = {
    createOrUpdate: $('#create-update-Modal').bootstrapModal(),
    audit: $('#audit-Modal').bootstrapModal()
  };

  const selecter = {
    modalStatus: $('#audit-Modal').find('select[name="status"]').bootstrapSelectpicker()
  };

  function getScriptJson() {
    try {
      const jsonText = $('script[type="application/json"]').text();
      model.status = JSON.parse(jsonText);
    } catch (error) {
      console.log(error);
    }
  }

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
        column: 'avatar',
        title: '用户头像',
        align: 'center',
        width: '220px',
        render: function (value, row) {
          return `
          <div class="flex-center-center">
            <div class="avatar">
               <img src="${value}" onerror="this.javascript:this.src='/statics/avatar/default_user.jpg'" />
            </div>
          </div>
          `;
        }
      },
      {
        column: 'nickName',
        title: '用户昵称',
        align: 'left'
      },
      {
        column: 'email',
        title: '登录邮箱',
        align: 'left'
      },
      {
        column: 'lastOnlineTime',
        title: '最后在线时间',
        width: '180px',
        render: function (value) {
          if (!value) {
            return `<span class="badge badge-secondary"> - </span>`;
          }

          let color = 'success';
          if (new Date() - new Date(value) > 300000) {
            color = 'danger';
          }

          return `<span class="badge badge-${color}">${value}</span>`;
        }
      },
      {
        column: 'status',
        title: '状态',
        width: '100px',
        align: 'center',
        render: function (value) {
          const index = model.status.findIndex(x => x.value == value);

          color = 'secondary';
          if (value == 1) {
            color = 'info';
          } else if (value == 100) {
            color = 'danger';
          } else if (value == -1) {
            color = 'dark';
          }

          return `<span class="badge badge-${color}">${model.status[index].name}</span>`;
        }
      },
      {
        column: 'createTime',
        title: '注册时间',
        width: '180px'
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
          <button class="warning" data-toggle="tooltip" data-placement="top" title="状态审核">
            <i class="mdi mdi-check"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
        `);

          return html;
        },
        events: {
          'click .info': function (e, value, row, index) {
            editRow.call(e.currentTarget, index, row);
          },
          'click .warning': function (e, value, row, index) {
            model.showIndex = index;
            model.row = row;
            modal.audit.show();
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
    if (model.row && model.row.id != '0') {
      model.row = {
        id: '0'
      };
    }

    modal.createOrUpdate.show();
  });

  tool.search.on('click', async function () {
    $(this).setBusy();
    try {
      await table.load();
    } finally {
      $(this).clearBusy();
    }
  });

  modal.createOrUpdate.find('button[more]').on('click', function () {
    const show = $(this).data('show') || 0;

    if (show) {
      modal.createOrUpdate.find('div.more').slideUp();
    } else {
      modal.createOrUpdate.find('div.more').slideDown();
    }

    $(this).data('show', show ? 0 : 1);
  });

  modal.createOrUpdate.find('button[save]').on('click', async function () {
    const json = modal.createOrUpdate.find('form').toJson();

    if (!json.email) {
      window.lycoris.totast.warn('登录邮箱不能为空');
      return;
    } else if (!$.regex.email(json.email)) {
      window.lycoris.totast.warn('登录邮箱格式错误');
      return;
    }

    if (!json.nickName) {
      window.lycoris.totast.warn('用户昵称不能为空');
      return;
    } else if (json.nickName.length > 10) {
      window.lycoris.totast.warn('用户昵称长度不能超过十个字符');
      return;
    }

    if (json.password && json.password.length < 6) {
      window.lycoris.totast.warn('密码不能少于6个字符');
      return;
    }

    $(this).setBusy();

    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/${model.showIndex == -1 ? 'create' : 'update'}`;
      request.data = { ...json };
      if (model.showIndex > -1) {
        request.data.id = model.row.id;
      }
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('新增用户成功');
        if (model.showIndex == -1) {
          table.createRow(res.data, false);
        } else {
          table.updateRow(model.showIndex, res.data);
        }

        modal.createOrUpdate.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  modal.createOrUpdate.handleShow(() => {
    modal.createOrUpdate.find('.modal-title').text(model.showIndex == -1 ? '新增用户' : '编辑用户');

    if (model.showIndex > -1) {
      modal.createOrUpdate.find('input[name="email"]').attr('readonly', 'readonly');
      modal.createOrUpdate.find('div[data-role="password"]').hide();

      if (model.row) {
        modal.createOrUpdate.find('form').formAutoFill(model.row);
      }
    } else {
      modal.createOrUpdate.find('input[name="email"]').removeAttr('readonly');
      modal.createOrUpdate.find('div[data-role="password"]').show();
    }
  });

  modal.createOrUpdate.handleHidden(() => {
    if (model.showIndex > -1) {
      model.showIndex = -1;

      modal.createOrUpdate.find('button[more]').data('show', 0);
      modal.createOrUpdate.find('div.more').slideUp();
      modal.createOrUpdate.find('input').val('');
    }
  });

  modal.audit.handleShow(() => {
    if (model.shwoIndex == -1) {
      modal.audit.hide();
    }

    selecter.modalStatus.set(model.row.status);
    modal.audit.find('textarea').val(model.row.remark);
  });

  modal.audit.handleHidden(() => {
    modal.audit.showIndex = -1;
    modal.audit.row = {};
  });

  modal.audit.find('button[save]').on('click', async function () {
    const json = modal.audit.find('form').toJson();

    $(this).setBusy();

    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/audit`;
      request.data = {
        id: model.row.id,
        ...json
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('状态审核成功');

        model.row.status = json.status;
        model.row.remark = json.remark;
        table.updateRow(model.showIndex, model.row);

        modal.audit.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  async function editRow(index, row) {
    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/userlink`;
      request.data = {
        id: row.id
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        model.showIndex = index;
        model.row = {
          ...row,
          ...res.data
        };

        modal.createOrUpdate.show();
      }
    } finally {
      $(this).clearBusy();
    }
  }

  this.init = function () {
    getScriptJson();

    tableInit();

    window.lycoris.loading.hide();

    table.load();
  };

  this.init();
});
