$(function () {
  const controller = '/post';
  const filterPanel = $('div.filter-panel');
  const table = $('#tb_departments').table();
  const tool = {
    create: $('.table-tool').find('button.btn-info'),
    search: $('.table-tool').find('button.btn-success')
  };

  let screenWidth = void 0;

  function createCellHtml(row) {
    let html = `
    <div class="post-header">
      <span class="badge ${row.type == 0 ? 'badge-purple-light' : 'badge-info-light'}">${row.type == 0 ? '原创' : '转载'}</span>
      <a href="${controller}/${row.id}" target="_blank">${row.title}</a>
    </div>
    <div class="post-footer flex-start-center">
      <div class="footer-item">
        <span class="${row.categoryId == 0 ? 'no-category' : ''} filter">${row.categoryName}</span>
      </div>
      <div class="footer-item">
        <span class="footer-item-label">浏览数</span>
        <span>${row.browseCount}</span>
      </div>
      <div class="footer-item">
        <span class="footer-item-label">评论数</span>
        <span>${row.commentCount}</span>
      </div>
    </div>
    `;
    return html;
  }

  async function categoryFilter(categoryId) {
    filterPanel.find('select[name="category"]').bootstrapSelectpicker().set(categoryId.toString());
    await table.load();
  }

  async function setPostComment(selecter, id) {
    selecter.loading.show();

    try {
      const tmp = selecter.getValue();
      // 请求接口
      const request = window.lycoris.createRequest();
      request.url = `${controller}/comment`;
      request.data = {
        id: id,
        comment: tmp
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        if (tmp == 1) {
          window.lycoris.totast.info('启用文章评论成功');
        } else {
          window.lycoris.totast.error('禁用文章评论成功');
        }
      }
    } finally {
      selecter.loading.hide();
    }
  }

  async function setRecommend(selecter, id) {
    selecter.loading.show();

    try {
      const tmp = selecter.getValue();
      // 请求接口
      const request = window.lycoris.createRequest();
      request.url = `${controller}/recommend`;
      request.data = {
        id: id,
        recommend: tmp
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        if (tmp == 1) {
          window.lycoris.totast.info('设置文章推荐成功');
        } else {
          window.lycoris.totast.warn('取消文章推荐成功');
        }
      }
    } finally {
      selecter.loading.hide();
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
        column: 'title',
        title: '文章',

        render: function (value, row, index) {
          return createCellHtml(row);
        },
        events: {
          'click span.filter': async function (e, value, row, index) {
            categoryFilter(row.categoryId);
          }
        }
      },
      {
        column: 'comment',
        title: '文章评论',
        width: '110',
        render: function (value, row) {
          return `
          <select class="form-control selectpicker" data-id="${row.id}">
            <option value="1" ${value ? 'selected' : ''}>允许</option>  
            <option value="0" ${value ? '' : 'selected'}>禁止</option>
          </select>
          `;
        },
        events: {
          'change .selectpicker': async function (e, value, row, index) {
            const selecter = $(e.currentTarget).bootstrapSelectpicker();
            setPostComment(selecter, row.id);
          }
        }
      },
      {
        column: 'recommend',
        title: '文章推荐',
        width: '120',
        render: function (value, row) {
          return `
          <select class="form-control selectpicker" data-id="${row.id}">
            <option value="1" ${value ? 'selected' : ''}>推荐</option>  
            <option value="0" ${value ? '' : 'selected'}>不推荐</option>
          </select>
          `;
        },
        events: {
          'change .selectpicker': async function (e, value, row, index) {
            const selecter = $(e.currentTarget).bootstrapSelectpicker();
            setRecommend(selecter, row.id);
          }
        }
      },
      {
        column: 'isPublish',
        title: '文章状态',
        width: '80',
        align: 'center',
        render: function (value) {
          return `<span class="badge badge-${value ? 'info' : 'secondary'}" >${value ? '已发布' : '未发布'}</span>`;
        }
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'center',
        render: function () {
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
            window.parent.lycoris.multitabs.create(row.title.length > 18 ? row.title.substr(0, 18) : row.title, `${window.lycoris.console}/Post/Update/${row.id}`);
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
    table.loadCompelte = () => {
      $('[data-toggle="tooltip"]').tooltip();
      $('.selectpicker').bootstrapSelectpicker(true);
    };

    table.request = getList;
  }

  async function getList(pageIndex, pageSize) {
    const request = window.lycoris.createRequest();
    request.url = `${controller}/list`;
    request.data = {
      pageIndex,
      pageSize
    };

    const json = $('.filter-panel').toJson();

    if (json.title) {
      request.data.title = json.title;
    }

    if (json.type != null) {
      request.data.type = json.type;
    }

    if (json.category != null && json.category != '0') {
      request.data.category = json.category;
    }

    if (json.isPublish != null) {
      request.data.isPublish = json.isPublish;
    }

    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    } else {
      return {};
    }
  }

  tool.create.on('click', function () {
    window.parent.lycoris.multitabs.create('新增文章', `${window.lycoris.console}/Post/Create`);
  });

  tool.search.on('click', async function () {
    $(this).setBusy();
    try {
      await table.load();
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = async () => {
    screenWidth = window.screen.width;

    tableInit();

    window.lycoris.loading.hide();

    await table.load();

    window.parent.lycoris.events.on('post.refresh', () => {
      table.load();
    });
  };

  this.init();
});
