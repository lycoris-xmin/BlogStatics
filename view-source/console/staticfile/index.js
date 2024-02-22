$(function () {
  const controller = '/staticfile';
  const table = $('#tb_departments').table();
  const tool = {
    search: $('.table-tool').find('button.btn-success'),
    sync: $('.table-tool').find('button.btn-cyan'),
    download: $('.table-tool').find('button.btn-danger')
  };

  const modal = $('#viewDetail-Modal').bootstrapModal();

  const model = {
    configUploadChannel: 0,
    uploadChannel: 0,
    download: {
      all: ''
    },
    showIndex: -1,
    rows: [],
    check: []
  };

  function getScriptJson() {
    try {
      const jsonText = $('script[type="application/json"]').text();
      const json = JSON.parse(jsonText);
      json.configUploadChannel = parseInt(json.configUploadChannel);
      if (!isNaN(json.configUploadChannel)) {
        model.configUploadChannel = json.configUploadChannel;
      }

      if (json.uploadChannel && json.uploadChannel.length) {
        model.uploadChannel = json.uploadChannel;
      }
    } catch (error) {}
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
    table.options.showCheckbox = true;
    table.options.showColumns = false;
    table.options.autoHeight = true;
    table.options.resize = true;
    table.options.pageSizeResize = true;

    table.columns = [
      {
        column: 'fileName',
        title: '文件名称',

        class: 'cell-fileName',
        render: function (value, row) {
          let fileType = '图片',
            color = 'info';

          if (row.fileType == 1) {
            fileType = '音频';
            color = 'cyan';
          } else if (row.fileType == 2) {
            fileType = '视频';
            color = 'purple';
          } else if (row.fileType == 3) {
            if (row.systemFile) {
              fileType = '系统文件';
              color = 'danger';
            } else {
              fileType = '文件';
              color = 'pink';
            }
          }

          let html = `
          <div>
            <a class="fileName" href="${row.path}/${value}" target="_blank">${value}</a>
            <div class="flex-start-center">
              <span class="path" title="${row.path}">${row.path}</span>
              <span class="size">${row.fileSize}</span>
              <span class="badge badge-${color}" data-fileType="${row.fileType}">${fileType}</span>
            </div>
          </div>
          `;
          return html;
        }
      },
      {
        column: 'uploadChannel',
        title: '保存位置',
        align: 'center',
        width: '100px',
        render: function (value) {
          const data = model.uploadChannel.filter(x => x.value == value);
          if (data && data.length && data[0].name) {
            return `<span class="badge badge-${value == 0 ? 'danger' : 'info'}">${data[0].name}</span>`;
          } else {
            return `<span class="badge badge-secondary">未知</span>`;
          }
        }
      },
      {
        column: 'localBack',
        title: '本地备份',
        width: '100px',
        align: 'center',
        render: function (value, row) {
          if (row.uploadChannel > 0) {
            return `<span class="badge badge-${value ? 'info' : 'secondary'}">${value ? '已备份' : '未备份'}</span>`;
          } else {
            return `<span class="badge badge-secondary" style="width:35px"> - </span>`;
          }
        }
      },
      {
        column: 'use',
        title: '状态',
        width: '100px',
        align: 'center',
        render: function (value) {
          return `<span class="badge badge-${value ? 'info' : 'secondary'}">${value ? '使用中' : '未使用'}</span>`;
        }
      },
      {
        column: 'createTime',
        title: '上传时间',
        width: '180px'
      },
      {
        column: 'action',
        title: '操作',
        class: 'cell-action action-3',
        align: 'center',
        render: function (value, row, index) {
          let html = `
          <button class="info" data-toggle="tooltip" data-placement="top" title="详细信息">
            <i class="mdi mdi-eye"></i>
          </button>
          `;

          if (!row.systemFile) {
            html = html.concat(`
            <button class="warning" data-toggle="tooltip" data-placement="top" title="检测状态">
              <i class="mdi mdi-database-search"></i>
              <i class="mdi mdi-loading mdi-spin"></i>
            </button>
          `);
          }

          if (row.localBack && row.uploadChannel > 0 && row.uploadChannel != model.configUploadChannel) {
            html = html.concat(`
          <button class="cyan" data-toggle="tooltip" data-placement="top" title="同步远端">
            <i class="mdi mdi-cloud-upload"></i>
            <i class="mdi mdi-loading mdi-spin"></i>
          </button>
          `);
          }

          if (!row.localBack && row.uploadChannel > 0) {
            html = html.concat(`
            <button class="purple" data-toggle="tooltip" data-placement="top" title="本地备份">
              <i class="mdi mdi-cloud-download"></i>
              <i class="mdi mdi-loading mdi-spin"></i>
            </button>
            `);
          }

          return html;
        },
        events: {
          'click .info': function (e, value, row, index) {
            model.showIndex = index;
            modal.show();
          },
          'click .warning': function (e, value, row, index) {
            checkkFileUseState.call(e.currentTarget, row, index);
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

  tool.download.on('click', async function () {
    await window.lycoris.swal.info('仅会下载本地已备份的所有文件，若要下载远端仓库的所有文件请自行处理！', '下载提示');

    $(this).setBusy();
    try {
      //
      const request = window.lycoris.createRequest();
      request.url = `${controller}/download/file/all`;
      const res = await request.post();
      if (res && res.resCode == 0) {
        model.download.all = res.data;
      }
    } catch {
      $(this).clearBusy();
    }
  });

  modal.handleShow(function () {
    if (model.showIndex > -1) {
      showFileDetail(model.showIndex);
    } else {
      model.hide();
    }
  });

  async function checkkFileUseState(row, index) {
    if (model.check.length >= 3) {
      window.lycoris.totast.inf('只能同时验证三个文件的使用状态');
      return;
    }

    $(this).setBusy();

    try {
      const request = window.lycoris.createRequest();
      request.url = `${controller}/check/useState`;
      request.data = {
        id: row.id
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success(`${row.fileName} 状态检测已提交后台任务`);
        model.check.push({
          index,
          row
        });
      }
    } finally {
      setTimeout(() => {
        $(this).clearBusy();
      }, 5000);
    }
  }

  function subscribeCheckkFileUseState(data) {
    const index = model.check.findIndex(x => x.row.id == data.id);
    if (index > -1) {
      const item = model.check[index];
      item.row.use = data.use;
      table.updateRow(item.index, item.row);
      model.check.splice(index, 1);
      window.lycoris.totast.info(`${item.row.fileName} 检测结果: ${data.use ? '使用中' : '未使用'}`);
    }
  }

  function subscribeDownloadAll(data) {
    if (data == model.download.all) {
      window.open(`${window.lycoris.console}/download/staticfile/all/${data}`, '_self');
      tool.download.clearBusy();
    }
  }

  function showFileDetail(index) {
    const data = model.rows[index];
    const view = modal.find('div.view-file').find('div');
    let html = '';
    if (data.fileType == 0) {
      html = `<img src="${data.pathUrl}" onerror="javascript:this.src='/statics/images/404.png'" />`;
    } else if (data.fileType == 1) {
      html = `<audio src="${data.pathUrl}" controls="controls"></audio>`;
    } else if (data.fileType == 2) {
      html = `<video src="${data.pathUrl}" controls="controls"></video>`;
    } else {
      html = `<span class="mdi mdi-file"></span>`;
    }

    view.html(html);

    if (data.fileType == 0) {
      modal.find('img').on('click', function () {
        const value = $(this).attr('src');
        window.lycoris.open(value);
      });
    }

    modal.find('span.value,a.value').each((i, el) => {
      const field = $(el).data('field');
      let value = data[field];
      if (field == 'uploadChannel') {
        value = model.uploadChannel.filter(x => x.value == value)[0].name;
      } else if (field == 'pathUrl') {
        value = `${location.protocol}//${location.host}${value}`;
      }

      $(el).text(value || ' - ');
    });

    modal.find('span.index').text(index + 1);
  }

  modal.find('span[data-field="pathUrl"],span[data-field="remoteUrl"]').on('click', function () {
    const value = $(this).text();
    if (value != ' - ') {
      window.lycoris.open(value);
    }
  });

  modal.find('span.mdi-chevron-left,span.mdi-chevron-right').on('click', function () {
    const index = $(this).hasClass('mdi-chevron-right') ? 1 : -1;
    const currentIndex = parseInt(modal.find('span.index').text());
    if ((currentIndex == 1 && index < 0) || (currentIndex == model.rows.length && index > 0)) {
      window.lycoris.totast.info(index > 0 ? '这已经是最后一条了' : '这已经是第一条了');
      return;
    }

    const value = currentIndex + index;

    modal.find('span.index').text(value);

    showFileDetail(value - 1);
  });

  this.init = function () {
    getScriptJson();

    tableInit();

    window.lycoris.loading.hide();

    table.load();

    // signalr监听
    window.lycoris.signalR.on('checkkFileUseState', subscribeCheckkFileUseState);
    window.lycoris.signalR.on('downloadAll', subscribeDownloadAll);
  };

  this.init();
});
