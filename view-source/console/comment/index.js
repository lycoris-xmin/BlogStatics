$(function () {
  const controller = '/post/comment';
  const table = $('#tb_departments').table();
  const tool = {
    search: $('.table-tool').find('button.btn-success')
  };

  const modal = $('#viewDetail-Modal').bootstrapModal();

  async function getList(pageIndex, pageSize) {
    const request = window.lycoris.createRequest();
    request.url = `${controller}/list`;
    request.data = {
      pageIndex,
      pageSize
    };

    const filter = $('div.filter-panel').toJson();

    if (filter.content) {
      request.data.content = filter.content;
    }

    if (filter.postId) {
      request.data.postId = postId;
    }

    if (filter.userId) {
      request.data.userId = userId;
    }

    if (filter.status) {
      request.data.status = filter.status;
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
    table.options.showCheckbox = true;
    table.options.showColumns = false;
    table.options.autoHeight = true;
    table.options.resize = true;

    table.pageOptions.pageSize = 20;
    table.pageOptions.pageList = [20, 50];

    table.columns = [
      {
        column: 'content',
        title: '评论内容',

        class: 'cell-content',
        render: function (value) {
          return `<p class="content">${value}</p>`;
        }
      },
      {
        column: 'title',
        title: '评论文章',
        class: 'cell-content',

        width: '300px',
        render: function (value, row) {
          if (row.postId > 0) {
            return `<a class="title content" href="/post/${row.postId}" target="_blank">${value}</a>`;
          } else {
            return `<span class="badge badge-secondary">${value}</span>`;
          }
        }
      },
      {
        column: 'userName',
        title: '评论用户',

        width: '150px',
        render: function (value, row) {
          if (!row.isOwner) {
            if (value == '用户已注销') {
              return `<span class="badge badge-secondary">${value}</span>`;
            }

            return value;
          }

          return `<span class="badge badge-info">${value}</span>`;
        }
      },
      {
        column: 'createTime',
        title: '评论时间',
        width: '180px'
      },
      {
        column: 'status',
        title: '状态',
        width: '100px',
        render: function (value) {
          if (value == 0) {
            return `<span class="badge badge-secondary">正常</span>`;
          } else if (value == 1) {
            return `<span class="badge badge-danger">违规</span>`;
          } else {
            return `<span class="badge badge-warning">用户删除</span>`;
          }
        }
      },
      {
        column: 'ip',
        title: 'IP地址',

        width: '150px'
      },
      {
        column: 'ipAddress',
        title: 'IP归属地',

        width: '200px'
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-2',
        align: 'center',
        render: function (value, row, index) {
          let html = `
          <button class="info" data-toggle="tooltip" data-placement="top" title="详细信息">
            <i class="mdi mdi-eye"></i>
          </button>
          `;

          html = html.concat(`
          <button class="delete" data-toggle="tooltip" data-placement="top" title="删除">
            <i class="mdi mdi-delete"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>`);

          return html;
        },
        events: {
          'click .info': function (e, value, row, index) {
            //
            modal.find('p.content').text(row.content);

            const post = modal.find('a.post');
            post.text(row.title);
            post.attr('href', `/post/${row.postId}`);

            modal.find('p.user').text(row.userName);
            modal.find('p.time').text(row.createTime);
            modal.find('p.userAgent').text(row.userAgent);
            modal.find('p.ip').text(row.ip);
            modal.find('p.ipAddress').text(row.ipAddress);

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
                  ids: [row.id]
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

  tool.search.on('click', async function () {
    $(this).setBusy();
    try {
      await table.load();
    } finally {
      $(this).clearBusy();
    }
  });

  this.init = async function () {
    //
    tableInit();
    window.lycoris.loading.hide();

    await table.load();
  };

  this.init();
});
