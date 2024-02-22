$(function () {
  const controller = '/log/request';
  const table = $('#tb_departments').table();
  const tool = {
    search: $('.table-tool').find('button.btn-success'),
    delete: $('.table-tool').find('button.btn-danger')
  };

  const modal = $('#viewDetail-Modal').bootstrapModal();

  async function getList(pageIndex, pageSize) {
    const request = window.lycoris.createRequest();
    request.url = `${controller}/list`;
    request.data = {
      pageIndex,
      pageSize
    };

    const filter = $('.filter-panel').toJson();

    for (let key in filter) {
      if (filter[key]) {
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
        column: 'route',
        title: '路由地址',

        class: 'cell-content',
        render: function (value, row) {
          return `<p class="route"><span class="badge badge-${row.httpMethod == 'GET' ? 'info' : 'purple'} mr-2">${row.httpMethod}</span>${value.toLocaleLowerCase()}</p>`;
        }
      },
      {
        column: 'success',
        title: '响应状态',
        align: 'center',
        width: '100px',
        render: function (value) {
          return `<span class="badge badge-${value ? 'success' : 'danger'}">${value ? '正常' : '异常'}</span>`;
        }
      },
      {
        column: 'statusCode',
        title: '状态码',
        align: 'center',
        width: '80px',
        render: function (value) {
          let color = 'secondary';
          if (value >= 500) {
            color = 'danger';
          } else if (value >= 400) {
            color = 'dark';
          } else if (value >= 300) {
            color = 'warning';
          }
          return `<span class="statuscode badge badge-${color}">${value}</span>`;
        }
      },
      {
        column: 'elapsedMilliseconds',
        title: '耗时(ms)',
        width: '150px',
        align: 'right',
        render: function (value) {
          let color = '';
          if (value <= 3000) {
            color = 'var(--color-dark-light)';
          } else if (value <= 10000) {
            color = 'var(--color-warning)';
          } else {
            color = 'var(--color-danger)';
          }

          return `<span class="second" style="color:${color}">${value}</span>`;
        }
      },
      {
        column: 'ip',
        title: '来源IP',
        width: '150px',
        align: 'left'
      },
      {
        column: 'ipAddress',
        title: 'IP属地',
        width: '250px',
        align: 'left'
      },
      {
        column: 'createTime',
        title: '请求时间',
        width: '180px'
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
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `;

          if (row.statusCode > 400 && row.statusCode != 401) {
            html = html.concat(`
            <button class="danger" data-toggle="tooltip" data-placement="top" title="IP管控">
              <i class="mdi mdi-ip"></i>
              <i class="mdi mdi-loading mdi-spin"></i>
            </button>
            `);
          }

          return html;
        },
        events: {
          'click .info': async function (e, value, row, index) {
            const showClick = table.find('td>button.info[disabled]');

            if (showClick && showClick.length > 0) {
              window.lycoris.totast.warn('其他数据正在获取中,请稍候');
              return;
            }

            $(e.currentTarget).attr('disabled', 'disabled');
            try {
              await showDetail(row);
            } finally {
              $(e.currentTarget).removeAttr('disabled');
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

  tool.delete.on('click', async function () {
    const rows = table.getSelectRows();

    if (!rows || !rows.length) {
      window.lycoris.totast.info('请选择要删除的数据');
      return;
    }

    const isConfirmed = await window.lycoris.swal.confirm('数据删除后不可恢复', '确定要删除吗');
    if (isConfirmed) {
      $(this).setBusy();
      try {
        const request = window.lycoris.createRequest();
        request.url = `${controller}/delete`;
        request.data = {
          ids: rows.map(x => {
            return x.id;
          })
        };
        const res = await request.post();
        if (res && res.resCode == 0) {
          window.lycoris.totast.success('删除成功');
          table.removeRow('id', request.data.ids);
        }
      } finally {
        $(this).clearBusy();
      }
    }
  });

  async function showDetail(row) {
    modal.find('p.route').html(`<span class="badge badge-${row.httpMethod == 'GET' ? 'info' : 'purple'} mr-2">${row.httpMethod}</span>${row.route.toLocaleLowerCase()}`);
    modal.find('p.ip').text(row.ip);
    modal.find('p.ipAddress').text(row.ipAddress);

    let statusCodeColor = '#000';
    if (row.statusCode >= 500) {
      statusCodeColor = 'var(--color-danger)';
    } else if (row.statusCode >= 400) {
      statusCodeColor = 'var(--color-dark)';
    } else if (row.statusCode >= 300) {
      statusCodeColor = 'var(--color-warning)';
    }

    modal.find('p.statusCode').text(row.statusCode).css('color', statusCodeColor);

    let elapsedMillisecondsColor = '';
    if (row.elapsedMilliseconds <= 3000) {
      elapsedMillisecondsColor = 'var(--color-dark-light)';
    } else if (row.elapsedMilliseconds <= 10000) {
      elapsedMillisecondsColor = 'var(--color-warning)';
    } else {
      elapsedMillisecondsColor = 'var(--color-danger)';
    }

    modal.find('p.elapsedMilliseconds').text(`${row.elapsedMilliseconds} ms`).css('color', elapsedMillisecondsColor);

    const request = window.lycoris.createRequest();
    request.url = `${controller}/info`;
    request.data = {
      id: row.id
    };
    const res = await request.get();

    if (res && res.resCode == 0) {
      const cookieEl = modal.find('ul.cookie').parent().parent();
      if (res.data.cookies) {
        let html = '';
        for (let key in res.data.cookies) {
          html = html.concat(`<li><span class="key">${key}</span> <p>${res.data.cookies[key]}</p></li>`);
        }

        modal.find('ul.cookie').html(html);
        cookieEl.removeClass('hide');
      } else if (!cookieEl.hasClass('hide')) {
        cookieEl.addClass('hide');
      }

      const headerEl = modal.find('ul.header').parent().parent();
      if (res.data.headers) {
        let html = '';
        for (let key in res.data.headers) {
          html = html.concat(`<li><span class="key">${key}</span> <p>${res.data.headers[key]}</p></li>`);
        }

        modal.find('ul.header').html(html);
        headerEl.removeClass('hide');
      } else if (!cookieEl.hasClass('hide')) {
        headerEl.addClass('hide');
      }

      modal.find('pre.params').html(syntaxHighlight(res.data.params || {}));
      modal.find('pre.response').html(syntaxHighlight(res.data.response || {}));

      const exceptionEl = modal.find('p.exception').parent().parent();
      if (res.data.exception) {
        modal.find('p.exception').text(res.data.exception);
        exceptionEl.removeClass('hide');
      } else if (!exceptionEl.hasClass('hide')) {
        exceptionEl.addClass('hide');
      }

      const stackTraceEl = modal.find('p.stackTrace').parent().parent();
      if (res.data.stackTrace) {
        modal.find('p.stackTrace').text(res.data.stackTrace);
        stackTraceEl.removeClass('hide');
      } else if (!exceptionEl.hasClass('hide')) {
        stackTraceEl.addClass('hide');
      }

      modal.show();
    }
  }

  function syntaxHighlight(json) {
    json = json || {};
    if (typeof json == 'string') {
      try {
        let temp = JSON.parse(json);
        json = temp;
      } catch {
        return json;
      }
    }

    json = JSON.stringify(json, undefined, 2);

    json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');

    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\\-]?\d+)?)/g, function (match) {
      var cls = 'number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'key';
        } else {
          cls = 'string';
        }
      } else if (/true|false/.test(match)) {
        cls = 'boolean';
      } else if (/null/.test(match)) {
        cls = 'null';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });
  }

  this.init = async function () {
    //
    tableInit();
    window.lycoris.loading.hide();

    await table.load();
  };

  this.init();
});
