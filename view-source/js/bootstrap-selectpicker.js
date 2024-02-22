$(function () {
  $.fn.bootstrapSelectpicker = function (selectpickerInit = false) {
    const that = this;

    this.setOptions = function (list) {
      if (list && list.length) {
        let html = '';
        for (let item of list) {
          html += `<option value="${item.value}">${item.name}</option>`;
        }

        $(that).html(html);
      } else {
        $(that).html('');
      }

      that.refresh();
      return that;
    };

    this.append = function (data) {
      $(that).find(`option[value=${data.value}]`).remove();
      $(that).append(`<option value="${data.value}">${data.name}</option>`);
      that.refresh();
      return that;
    };

    this.refresh = function () {
      $(that).selectpicker('refresh');
    };

    this.set = function (val) {
      $(that).selectpicker('val', val);
      return that;
    };

    this.getValue = function () {
      return $(that).selectpicker('val');
    };

    this.getText = function () {
      const value = that.getValue();
      return $(that).find(`option[value="${value}"]`).text();
    };

    this.render = function () {
      $(that).selectpicker('render');
      return that;
    };

    this.setMobile = function () {
      $(that).selectpicker('mobile');
      return that;
    };

    this.enable = function () {
      if ($(that).attr('disabled')) {
        $(that).removeAttr('disabled');
        that.refresh();
      }
      return that;
    };

    this.disable = function () {
      if (!$(that).attr('disabled')) {
        $(that).attr('disabled', 'disabled');
        that.render().refresh();
      }
      return that;
    };

    this.loading = {
      show: function () {
        $(that).find('option:selected').attr('data-icon', 'mdi mdi-loading mdi-spin');
        that.disable();
      },
      hide: function () {
        $(that).find('option:selected').removeAttr('data-icon', 'mdi mdi-loading mdi-spin');
        that.enable();
      }
    };

    this.init = function () {
      $(this).selectpicker();
      return that;
    };

    if (selectpickerInit) {
      this.init();
    }

    return this;
  };
});
