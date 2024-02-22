$(function () {
  const controller = '/navigation';
  const table = $('#tb_departments').table();
  const tool = {
    search: $('.table-tool').find('button.btn-success'),
    create: $('.table-tool').find('button.btn-info'),
    setting: $('.table-tool').find('button.btn-cyan')
  };

  const modal = {
    createorupdate: $('#createorupdate-Modal').bootstrapModal(),
    setting: $('#group-Modal').bootstrapModal()
  };

  const selectpicker = modal.createorupdate.find('select[name="groupId"]').bootstrapSelectpicker();

  const model = {
    index: -1,
    row: {},
    groups: [],
    loadGroups: false
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
        column: 'name',
        title: '收录名称',
        width: '300px'
      },
      {
        column: 'url',
        title: '收录地址',
        render: function (value, row) {
          return `<a class="link" href="${value}" target="_blank">${value}</a>`;
        }
      },
      {
        column: 'groupName',
        title: '收录分组',
        align: 'center',
        width: '200px',
        render: function (value, row) {
          return `<span class="badge badge-info">${value}</span>`;
        }
      },
      {
        column: 'hrefCount',
        title: '收录热度',
        width: '120px',
        align: 'center'
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'left',
        render: function (value, row, index) {
          let html = '';

          html = html.concat(`
          <button class="info" data-toggle="tooltip" data-placement="top" title="编辑">
            <i class="mdi mdi-pencil"></i>
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
            modal.createorupdate.show();
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

  tool.setting.on('click', async function () {
    if (model.loadGroups) {
      modal.setting.show();
      return;
    }

    $(this).setBusy();

    try {
      await getGroupList(() => {
        modal.setting.show();
      });

      model.loadGroups = true;
    } finally {
      $(this).clearBusy();
    }
  });

  modal.createorupdate.find('button[append-option]').on('click', async function () {
    await window.lycoris.swal.custome({
      title: '新增收录分组',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '确 定',
      cancelButtonText: '取 消',
      showLoaderOnConfirm: true,
      preConfirm: async value => {
        try {
          const request = window.lycoris.createRequest();
          request.url = `${controller}/group/create`;
          request.data = {
            groupName: value
          };
          const res = await request.post();
          if (res && res.resCode == 0) {
            selectpicker
              .append({
                value: res.data.value,
                name: res.data.name
              })
              .set('-1')
              .enable();
          }

          return res;
        } catch (error) {
          window.lycoris.totast.error('新增失败');
        }
      },
      allowOutsideClick: () => !window.lycoris.swal._this.isLoading()
    });
  });

  modal.createorupdate.handleShow(() => {
    if (model.groups && model.groups.length) {
      selectpicker.setOptions(model.groups);
    }

    if (model.index > -1) {
      modal.createorupdate.find('input[name="name"]').val(model.row.name);
      modal.createorupdate.find('input[name="url"]').val(model.row.url);
      modal.createorupdate.find('input[name="favicon"]').val(model.row.favicon);
      selectpicker.set(model.row.groupId);
    }
  });

  modal.createorupdate.handleHidden(() => {
    modal.createorupdate.find('form').find('input').val('');
    selectpicker.set('');
    model.index = -1;
    model.row = {};
  });

  modal.createorupdate.find('button[save]').on('click', async function () {
    const json = modal.createorupdate.find('form').toJson();

    if (!json.name) {
      window.lycoris.totast.warn('收录名称不能为空');
      return;
    }

    if (!json.url) {
      window.lycoris.totast.warn('收录地址不能为空');
      return;
    } else if (!$.regex.url(json.url)) {
      window.lycoris.totast.warn('收录地址格式错误');
      return;
    }

    if (model.index > -1) {
      json.id = model.row.id;
    }

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();
      request.url = model.index == -1 ? `${controller}/create` : `${controller}/update`;
      request.data = { ...json };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        modal.createorupdate.hide();
        if (model.index == -1) {
          table.createRow(res.data, false);
        } else {
          table.updateRow(model.index, res.data);
        }
      }
    } finally {
      $(this).clearBusy();
    }
  });

  modal.setting.handleShow(createGroup);

  modal.setting.find('.tool>div>.btn-success').on('click', async function () {
    const group = $(this).parent().parent().next();

    group.addClass('loading');
    try {
      await getGroupList();
      createGroup();
    } finally {
      group.removeClass('loading');
    }
  });

  modal.setting.find('.tool>div>.btn-info').on('click', function () {
    window.lycoris.swal.custome({
      title: '新增收录分组',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: '保 存',
      cancelButtonText: '取 消',
      showLoaderOnConfirm: true,
      preConfirm: async value => {
        if (!value) {
          return {};
        }
        try {
          const request = window.lycoris.createRequest();
          request.url = `${controller}/group/create`;
          request.data = {
            groupName: value
          };
          const res = await request.post();
          if (res && res.resCode == 0) {
            model.groups.push(res.data);
            createGroup();
          }

          return res;
        } catch (error) {
          window.lycoris.totast.error('新增失败');
        }
      },
      allowOutsideClick: () => !window.lycoris.swal._this.isLoading()
    });
  });

  modal.setting.find('button[save]').on('click', async function () {
    const li = modal.setting.find('ul.group-list').find('li'),
      ids = [];

    li.each((i, el) => {
      const id = $(el).attr('data-id');
      ids.push(id);
    });

    let same = true;
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] != model.groups[i].value) {
        same = false;
        break;
      }
    }

    if (same) {
      modal.setting.hide();
      return;
    }

    $(this).setBusy();
    try {
      const request = window.lycoris.createRequest();

      request.url = `${controller}/group/order`;
      request.data = {
        ids: ids
      };

      const res = await request.post();

      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        modal.setting.hide();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  async function getGroupList(callback) {
    const request = window.lycoris.createRequest();
    request.url = `${controller}/group/list`;
    const res = await request.get();
    if (res && res.resCode == 0) {
      model.groups = res.data.list;
      if (callback && typeof callback == 'function') {
        callback();
      }
    }
  }

  function createGroup() {
    const groups = modal.setting.find('ul.group-list');

    let html = createGroupHtml(model.groups);

    groups.html(html);

    groups.find('.mdi-pencil').on('click', async function () {
      const that = this;
      const id = $(this).parent().parent().parent().attr('data-id');

      await window.lycoris.swal.custome({
        title: '修改收录分组',
        text: $(that).parent().parent().prev().text(),
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: '保 存',
        cancelButtonText: '取 消',
        showLoaderOnConfirm: true,
        preConfirm: async value => {
          try {
            const request = window.lycoris.createRequest();
            request.url = `${controller}/group/update`;
            request.data = {
              id: id,
              groupName: value
            };
            const res = await request.post();
            if (res && res.resCode == 0) {
              model.groups.push(res.data);
              createGroup();
            }

            return res;
          } catch (error) {
            window.lycoris.totast.error('新增失败');
          }
        },
        allowOutsideClick: () => !window.lycoris.swal._this.isLoading()
      });
    });

    groups.find('.mdi-delete').on('click', async function () {
      const id = $(this).parent().parent().parent().attr('data-id');

      const isConfirmed = await window.lycoris.swal.confirm('数据删除后不可恢复', '确定要删除吗');

      if (isConfirmed) {
        $(this).parent().addClass('loading');
        try {
          const request = window.lycoris.createRequest();
          request.url = `${controller}/group/delete`;
          request.data = {
            id: id
          };
          const res = await request.post();
          if (res && res.resCode == 0) {
            const li = modal.setting.find('ul.group-list').find(`li[data-id="${id}"]`);
            li.slideUp(300, () => {
              li.remove();
            });
            model.groups = model.groups.filter(x => x.value != id);
          }
        } finally {
          $(this).parent().removeClass('loading');
        }
      }
    });
  }

  function createGroupHtml(list) {
    if (!list || !list.length) {
      return '';
    }

    let html = '';
    for (let item of list) {
      html = html.concat(`
      <li data-id="${item.value}">
        <p>${item.name}</p>
        <div class="flex-center-center">
          <div>
            <span class="mdi mdi-pencil"></span>
            <span class="mdi mdi-loading mdi-spin"></span>
          </div>
          <div>
            <span class="mdi mdi-delete"></span>
            <span class="mdi mdi-loading mdi-spin"></span>
          </div>
        </div>
      </li>`);
    }

    return html;
  }

  this.init = function () {
    tableInit();

    window.lycoris.loading.hide();

    new Sortable(modal.setting.find('ul.group-list')[0], {
      animation: 150,
      easing: 'cubic-bezier(1, 0, 0, 1)'
    });

    table.load();
  };

  this.init();
});
