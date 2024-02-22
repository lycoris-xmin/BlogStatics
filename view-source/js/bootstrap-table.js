$(function () {
  $.fn.table = function () {
    const that = this;

    const tablePage = {
      index: 1,
      size: 10
    };

    const defaultOptions = {
      classes: 'table table-bordered table-hover table-striped',
      uniqueId: 'id',
      idField: 'id',
      onColumnSwitch: function () {
        // 合并相同列(在切换可视列是也需要执行一次，否则会失效)
        var data = $('#tb_departments').bootstrapTable('getData', true);
        mergeCells(data, 'nationality', 1, $('#tb_departments'));
        mergeCells(data, 'category', 1, $('#tb_departments'));
      },
      onLoadSuccess: function (data) {
        $("[data-toggle='tooltip']").tooltip();
        // 合并相同列
        var data = $('#tb_departments').bootstrapTable('getData', true);
        mergeCells(data, 'nationality', 1, $('#tb_departments'));
        mergeCells(data, 'category', 1, $('#tb_departments'));
      },
      onCheck: function (row) {
        if (that.events.check === void 0 && typeof that.events.check != 'function') {
          return false;
        }

        that.events.check(row);
      },
      onClickRow: function (item, $element) {
        if (that.events.clickRow === void 0 && typeof that.events.checkSome != 'function') {
          return false;
        }

        that.events.clickRow(item, $element);
      },
      onCheckSome: function (rows) {
        if (that.events.checkSome === void 0 && typeof that.events.checkSome != 'function') {
          return false;
        }

        that.events.checkSome(rows);
      },
      onUncheckSome: function (rows) {
        if (that.events.uncheckSome === void 0 && typeof that.events.uncheckSome != 'function') {
          return false;
        }

        that.events.uncheckSome(rows);
      },
      formatNoMatches: void 0,
      formatLoadingMessage: void 0
    };
    const tableAutoHeightOption = {
      screenWidthRecord: 0
    };

    that.pageIndex = 1;
    that.pageSize = 10;

    that.data = {
      rows: [],
      total: 0
    };

    that.options = {
      toolbar: void 0,
      toolbarAlign: 'left',
      // 是否启用点击选中行
      clickToSelect: false,
      // 是否显示复选框
      showCheckbox: true,
      // 是否显示所有的列
      showColumns: true,
      // 是否显示表格标题
      showHeader: true,
      // 是否显示刷新按钮
      showRefresh: false,
      // 是否显示详细视图和列表视图的切换按钮(clickToSelect同时设置为true时点击会报错)
      showToggle: false,
      // 是否显示分页
      pagination: true,
      // 排序方式
      sortOrder: 'asc',
      // 分页方式：client客户端分页，server服务端分页
      sidePagination: 'server',
      fixedColumns: false,
      height: '',
      resize: false,
      autoHeight: false,
      pageSizeResize: false
      //fixedNumber: 0
      //fixedRightNumber:0
    };

    that.events = {
      check: void 0,
      clickRow: void 0,
      checkSome: void 0,
      uncheckSome: void 0
    };

    that.column = [];

    that.request = function (index, size) {
      return {
        rows: [],
        total: 0
      };
    };

    that.pageOptions = {
      pageIndex: 1,
      pageSize: 20,
      pageList: [20, 50, 100]
    };

    that.init = function () {
      // 页码配置
      if (that.pageOptions === void 0) {
        that.pageOptions = {
          pageIndex: 1,
          pageSize: 20,
          pageList: [20, 50, 100]
        };
      }

      // 表工具、显示配置
      if (that.options == void 0) {
        that.options = {
          toolbar: void 0,
          // 是否显示表头
          showHeader: true,
          // 是否显示所有的列
          showColumns: true,
          // 是否显示刷新按钮
          showRefresh: false,
          // 是否显示详细视图和列表视图的切换按钮(clickToSelect同时设置为true时点击会报错)
          showToggle: false,
          // 是否显示分页
          pagination: true,
          // 排序方式
          sortOrder: 'asc',
          // 分页方式：client客户端分页，server服务端分页
          sidePagination: 'server',
          height: '',
          resize: false,
          autoHeight: false,
          pageSizeResize: false
        };
      }

      if (that.options.autoHeight) {
        calcTableHeight(window.screen.width);
      }

      if (that.options.pageSizeResize) {
        resizePageSize(window.screen.width);
      }

      defaultOptions.pageNumber = that.pageOptions.pageIndex || 1;
      defaultOptions.pageSize = that.pageOptions.pageSize || 10;
      defaultOptions.pageList = that.pageOptions.pageList || [10, 20, 50, 100];

      tablePage.index = that.pageOptions.pageIndex;
      tablePage.size = that.pageOptions.pageSize;

      that.pageIndex = that.pageOptions.pageIndex;
      that.pageSize = that.pageOptions.pageSize;

      if (that.options.toolbar != void 0) {
        defaultOptions.toolbar = this.options.toolbar;
      }

      defaultOptions.clickToSelect = that.options.clickToSelect;
      defaultOptions.showHeader = that.options.showHeader;
      defaultOptions.showColumns = that.options.showColumns;
      defaultOptions.showRefresh = that.options.showRefresh;
      defaultOptions.showToggle = that.options.showToggle;

      // 与clickToSelect同时设置为true时点击会报错
      if (defaultOptions.showToggle) {
        defaultOptions.clickToSelect = false;
      }

      defaultOptions.pagination = that.options.pagination;
      defaultOptions.sortOrder = that.options.sortOrder;
      defaultOptions.sidePagination = that.options.sidePagination;

      if (that.options.formatNoMatches && typeof that.options.formatNoMatches == 'function') {
        defaultOptions.formatNoMatches = that.options.formatNoMatches;
      }

      if (that.options.formatLoadingMessage && typeof that.options.formatLoadingMessage == 'function') {
        defaultOptions.formatLoadingMessage = that.options.formatLoadingMessage;
      }

      if (that.options.fixedColumns) {
        defaultOptions.fixedColumns = true;

        if (that.options.fixedNumber != void 0 && that.options.fixedNumber != '') {
          defaultOptions.fixedNumber = that.options.fixedNumber;
        }
        if (that.options.fixedRightNumber != void 0 && that.options.fixedRightNumber != '') {
          defaultOptions.fixedRightNumber = that.options.fixedRightNumber;
        }
      }

      if (that.options.resize == void 0 || typeof that.options.resize != 'boolean') {
        that.options.resize = false;
      }

      if (that.options.height && typeof that.options.height == 'number') {
        defaultOptions.height = that.options.height;
      }

      columnOptionInit();

      $(that).bootstrapTable(defaultOptions);

      createLoadingHtml();

      if (that.options.toolbar == void 0) {
        $('div.bootstrap-table').find('div.fixed-table-toolbar').hide();
      }

      $(that).on('page-change.bs.table', async function (e, index, size) {
        tablePage.index = index;
        tablePage.size = size;
        if (that.options.sidePagination === 'server') {
          await that.pageIndexChange(index, size);
        }
      });

      $(that).bootstrapTable('hideLoading');

      if (that.options.resize) {
        tableAutoHeightOption.screenWidthRecord = window.screen.width;

        window.onresize = debounce(() => {
          if (tableAutoHeightOption.screenWidthRecord != window.screen.width) {
            that.destroy();

            calcTableHeight(window.screen.width);

            resizePageSize(window.screen.width);

            that.init();

            that.reload();

            tableAutoHeightOption.screenWidthRecord = window.screen.width;
          }
        }, 500);
      }
    };

    that.pageIndexChange = async function (index, size) {
      let data = await tableRequest(index, size).catch(err => {
        throw err;
      });

      bootstrapTableLoadData(data);
    };

    that.selectPage = async function (pageIndex) {
      if (pageIndex == void 0 || typeof pageIndex != 'number') return;

      $(that).bootstrapTable('selectPage', pageIndex);
      tablePage.index = pageIndex;

      let data = tableRequest(tablePage.index, tablePage.size).catch(err => {
        throw err;
      });

      bootstrapTableLoadData(data);
    };

    that.destroy = function () {
      $(that).bootstrapTable('destroy');
      tablePage.index = 1;
    };

    that.getData = () => $(that).bootstrapTable('getData', true);

    that.getSelectRows = () => $(that).bootstrapTable('getSelections');

    that.selectPage = index => $(that).bootstrapTable('selectPage', index);

    that.totalRows = () => $(that).bootstrapTable('getOptions').totalRows || 0;

    that.removeAll = () => $(that).bootstrapTable('removeAll');

    that.createRow = function (row, last = true) {
      if (row) {
        let data = $(that).bootstrapTable('getData', true) || [],
          total = $(that).bootstrapTable('getOptions').totalRows || 0;

        if (last) {
          if (data.length == that.pageSize) {
            return;
          }

          data.push(row);
        } else {
          data.unshift(row);
          if (data.length > that.pageOptions.pageSize) {
            data.pop();
          }
        }

        total += 1;

        bootstrapTableLoadData({
          rows: data,
          total: total
        });
      }
    };

    that.updateRow = function (index, row) {
      if (index != void 0 && typeof index == 'number' && index > -1) {
        $(that).bootstrapTable('updateRow', { index: index, row: row });
      }
    };

    that.removeRow = function (field, value) {
      if (value) {
        let data = $(that).bootstrapTable('getData', true),
          total = $(that).bootstrapTable('getOptions').totalRows;

        let opt = {
          field: field,
          values: []
        };

        if (Array.isArray(value)) {
          opt.values = value;
        } else {
          opt.values.push(value);
        }

        if (tablePage.index == 1) {
          //
          if (data.length < tablePage.size || data.length == total) {
            $(that).bootstrapTable('remove', opt);
          } else {
            that.load();
          }
        } else {
          //
          if (data.length > 1) {
            if (data.length < tablePage.size) {
              $(that).bootstrapTable('remove', opt);
            } else {
              that.reload();
            }
          } else {
            that.load(tablePage.index - 1);
          }
        }

        tableBodyBorder(total - 1);
      }
    };

    that.setData = function (rows, count) {
      rows = rows || [];
      count = count || rows.length;
      bootstrapTableLoadData({
        rows,
        total: count
      });
    };

    this.load = async function (index = 1) {
      tablePage.index = index;

      let data = await tableRequest(tablePage.index, tablePage.size).catch(err => {
        throw err;
      });

      bootstrapTableLoadData(data);
    };

    this.reload = async function () {
      let data = await tableRequest(tablePage.index, tablePage.size).catch(err => {
        throw err;
      });

      bootstrapTableLoadData(data);
    };

    this.loading = {
      show: function () {
        $(that).find('div.loading-preloader').addClass('loading');
      },
      hide: function () {
        $(that).find('div.loading-preloader').removeClass('loading');
      }
    };

    function columnOptionInit() {
      // 列配置
      if (that.columns != void 0 && that.columns.length > 0) {
        defaultOptions.columns = that.options.showCheckbox
          ? [
              {
                field: 'check',
                checkbox: true
              }
            ]
          : [];

        for (let c of that.columns) {
          let temp = {
            field: c.column,
            title: c.title
          };

          if (c.width != void 0) {
            temp.width = c.width;
          }

          // 是否可视(默认true)
          if (c.display != void 0 && typeof c.display === 'boolean' && !c.display) {
            temp.visible = false;
          }

          // 是否显示排序,默认false
          if (c.sortable != void 0 && typeof c.sortable === 'boolean') {
            temp.sortable = c.sortable;
          } else {
            temp.sortable = false;
          }

          // 内容格式,默认居中
          if (c.align != void 0) {
            temp.align = c.align;
          } else {
            temp.align = 'left';
          }

          if (c.cellStyle != void 0 || (c.class != void 0 && c.class != '')) {
            temp.cellStyle = function () {
              let css = {
                css: c.cellStyle,
                classes: c.class
              };

              if (css.css == void 0) {
                delete css.css;
              }
              if (css.classes == void 0) {
                delete css.classes;
              }

              return css;
            };
          }

          // 单元格渲染
          if (c.render != void 0 && typeof c.render === 'function') {
            temp.formatter = c.render;
          }

          // 行事件
          if (c.events != void 0 && typeof c.events === 'object') {
            temp.events = c.events;
          }

          defaultOptions.columns.push(temp);
        }
      }
    }

    async function tableRequest(index, size) {
      $(that).bootstrapTable('showLoading');
      try {
        let res = await that.request(index, size);

        const data = {
          total: res.count || 0,
          rows: res.list || []
        };

        that.data.total = res.count || 0;
        that.data.rows = res.list || [];

        that.pageIndex = index;
        that.pageSize = size;

        return data;
      } finally {
        $(that).bootstrapTable('hideLoading');
      }
    }

    function createLoadingHtml() {
      const html = `
      <div class="table-preloader">
        <div class="table-preloader-inner"></div>
        <p class="table-text">数据加载中,请稍后...</p>
      </div>
      `;

      $(that).parent().find('div.fixed-table-loading').html(html);
    }

    function bootstrapTableLoadData(data) {
      $(that).bootstrapTable('load', data);

      tableBodyBorder(data.total);

      if (that.loadCompelte != void 0 && typeof that.loadCompelte === 'function') {
        that.loadCompelte(data);
      }
    }

    function tableBodyBorder(total) {
      if (total > 0) {
        $(that).parent().addClass('show');
      } else {
        $(that).parent().removeClass('show');
      }
    }

    /**
     * @function 合并单元格
     * @param {*} data 原始数据（在服务端完成排序）
     * @param {*} fieldName 合并属性名称
     * @param {*} colspan 合并列
     * @param {*} target 目标表格对象
     */
    function mergeCells(data, fieldName, colspan) {
      // 声明一个map计算相同属性值在data对象出现的次数和
      var sortMap = {};
      for (var i = 0; i < data.length; i++) {
        for (var prop in data[i]) {
          if (prop == fieldName) {
            var key = data[i][prop];
            if (sortMap.hasOwnProperty(key)) {
              sortMap[key] = sortMap[key] * 1 + 1;
            } else {
              sortMap[key] = 1;
            }
            break;
          }
        }
      }
      var index = 0;
      for (var prop in sortMap) {
        var count = sortMap[prop] * 1;
        $(that).bootstrapTable('mergeCells', {
          index: index,
          field: fieldName,
          colspan: colspan,
          rowspan: count
        });
        index += count;
      }
    }

    function debounce(callback, wait, immediate) {
      var timeout;
      return function () {
        var context = this;
        var args = arguments;

        if (timeout) clearTimeout(timeout);

        if (immediate) {
          // 判断是否执行过
          var flag = !timeout;
          timeout = setTimeout(function () {
            callback.apply(context, args);
          }, wait);

          if (flag) callback.apply(context, args);
        } else {
          timeout = setTimeout(function () {
            callback.apply(context, args);
          }, wait);
        }
      };
    }

    function calcTableHeight(screenWidth) {
      if (screenWidth > 1920) {
        if ($(that).hasClass('filter-row-1') || $(that).hasClass('filter-lg-row-1')) {
          that.options.height = window.screen.height * 0.72;
        } else if ($(that).hasClass('filter-row-2') || $(that).hasClass('filter-lg-row-2')) {
          that.options.height = window.screen.height * 0.66;
        } else {
          that.options.height = window.screen.height * 0.78;
        }
      } else if (screenWidth > 1366) {
        if ($(that).hasClass('filter-row-1') || $(that).hasClass('filter-md-row-1')) {
          that.options.height = window.screen.height * 0.75;
        } else if ($(that).hasClass('filter-row-2') || $(that).hasClass('filter-md-row-2')) {
          that.options.height = window.screen.height * 0.67;
        } else {
          that.options.height = window.screen.height * 0.84;
        }
      } else if (screenWidth >= 1024) {
        if ($(that).hasClass('filter-row-1') || $(that).hasClass('filter-sm-row-1')) {
          that.options.height = window.screen.height * 0.75;
        } else if ($(that).hasClass('filter-row-2') || $(that).hasClass('filter-sm-row-2')) {
          that.options.height = window.screen.height * 0.67;
        } else {
          that.options.height = window.screen.height * 0.84;
        }
      }
    }

    function resizePageSize(screenWidth) {
      if (typeof that.options.pageSizeResize == 'boolean' && !that.options.pageSizeResize) {
        return;
      }

      if (screenWidth > 1920) {
        that.pageOptions.pageSize = 20;
        that.pageOptions.pageList = [20, 50];
      } else if (screenWidth > 1366) {
        that.pageOptions.pageSize = 15;
        that.pageOptions.pageList = [15, 20, 50];
      } else if (screenWidth >= 1024) {
        if (screenWidth > 1180) {
          that.pageOptions.pageSize = 10;
          that.pageOptions.pageList = [10, 20, 50];
        } else {
          that.pageOptions.pageSize = 5;
          that.pageOptions.pageList = [5, 10, 20];
        }
      }
    }

    return that;
  };
});
