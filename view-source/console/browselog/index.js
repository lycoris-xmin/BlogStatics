$(function () {
  const controller = '/log/browse';
  const table = $('#tb_departments').table();
  const tool = {
    search: $('.table-tool').find('button.btn-success')
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
    table.options.showCheckbox = true;
    table.options.showColumns = false;
    table.options.autoHeight = true;
    table.options.resize = true;

    table.columns = [
      {
        column: 'pageName',
        title: '访问页面',
        render: function (value) {
          return `<a class="cell-page">${value}</a>`;
        }
      },
      {
        column: 'route',
        title: '访问路由',
        render: function (value) {
          return `<div class="cell-route">${value}</div>`;
        }
      },
      {
        column: 'referer',
        title: '跳转来源',
        width: '450',
        align: 'left'
      },
      {
        column: 'ip',
        title: 'IP地址',
        width: '150',
        align: 'left'
      },
      {
        column: 'ipAddress',
        title: 'IP属地',
        width: '250',
        align: 'left'
      },
      {
        column: 'createTime',
        title: '访问时间',
        width: '180'
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
