$(function () {
  $.fn.datePicker = function (options) {
    var that = this;
    var defaultOptions = {
      format: 'yyyy-mm-dd',
      language: 'zh-CN',
      autoclose: true,
      todayHighlight: true
    };

    this.setDate = function (time) {
      if (time == undefined || time === null || time === '') return;

      if (typeof time === 'string') $(that).datepicker('setDate', time);
      else if (typeof time === 'object') $(that).datepicker('setDate', new Date().format('yyyy-MM-dd'));
    };

    this.init = function () {
      $(that).attr('data-provide', 'datepicker');

      if (options != undefined && typeof options == 'object') defaultOptions = Object.assign({}, defaultOptions, options);

      $(that).datepicker(defaultOptions);
    };

    this.init();

    return this;
  };

  $.fn.dateTimePicker = function (options) {
    var that = this;
    var defaultOptions = {
      format: 'yyyy-MM-DD HH:mm:ss',
      locale: 'zh-CN',
      defaultDate: new Date().format('yyyy-MM-dd 00:00:00'),
      showTodayButton: true,
      showClear: true,
      showClose: true,
      sideBySide: true,
      toolbarPlacement: 'bottom',
      keepOpen: true,
      tooltips: {
        today: '今天',
        clear: '清空',
        close: '关闭',
        selectMonth: '选择月份',
        prevMonth: '上个月',
        nextMonth: '下个月',
        selectYear: '选择年份',
        prevYear: '上一年',
        nextYear: '下一年',
        selectDecade: '选择十年',
        prevDecade: '上一个十年',
        nextDecade: '下一个十年',
        prevCentury: '上个世纪',
        nextCentury: '下个世纪',
        pickHour: '选择小时',
        incrementHour: '+ 1 小时',
        decrementHour: '- 1 小时',
        pickMinute: '选择分钟',
        incrementMinute: '+ 1 分钟',
        decrementMinute: '- 1 分钟',
        pickSecond: '选择秒',
        incrementSecond: '+ 1 秒',
        decrementSecond: '- 1 秒',
        togglePeriod: '切换周期',
        selectTime: '选择时间'
      }
    };

    this.init = function () {
      if (options != undefined && typeof options == 'object') {
        defaultOptions = Object.assign({}, defaultOptions, options);
      }

      const format = $(that).data('format');
      if (format) {
        defaultOptions.format = format;
      }

      if ($(that).val()) {
        defaultOptions.defaultDate = $(that).val();
      } else {
        defaultOptions.defaultDate = '';
      }

      $(that).datetimepicker(defaultOptions);
    };

    this.init();

    return this;
  };

  const datepicker = $('input[data-provide="datepicker"]');
  if (datepicker && datepicker.length) {
    datepicker.datePicker();
  }

  const dateTimePicker = $('input[data-provide="datetimepicker"]');
  if (dateTimePicker && dateTimePicker.length) {
    dateTimePicker.dateTimePicker();
  }
});
