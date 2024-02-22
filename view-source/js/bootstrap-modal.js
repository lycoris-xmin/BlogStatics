$(function () {
  $.fn.bootstrapModal = function (option) {
    const that = this;
    let defaultOption = {
      backdrop: 'static',
      keyboard: true,
      show: false,
      focus: false
    };

    this.show = () => {
      $(that).modal('show');
    };

    this.hide = () => {
      $(that).modal('hide');
    };

    this.dispose = () => {
      $(that).modal('dispose');
    };

    this.handleShow = callback => {
      if (callback && typeof callback == 'function') {
        $(that).on('show.bs.modal', function () {
          callback.call(that);
        });
      }
    };

    this.handleShown = callback => {
      if (callback && typeof callback == 'function') {
        $(that).on('shown.bs.modal', function () {
          callback.call(that);
        });
      }
    };

    this.handleHide = callback => {
      if (callback && typeof callback == 'function') {
        $(that).on('hide.bs.modal', function () {
          callback.call(that);
        });
      }
    };

    this.handleHidden = callback => {
      if (callback && typeof callback == 'function') {
        $(that).on('hidden.bs.modal', function () {
          callback.call(that);
        });
      }
    };

    this.handleSave = function () {
      if (arguments.length) {
        let el = '',
          callback = void 0;

        const args1 = arguments[0];
        if (!args1) {
          return;
        }

        if (typeof args1 == 'function') {
          callback = args1;
          el = 'button[save]';
        } else if (typeof args1 == 'string' && arguments.length > 1) {
          el = args1;

          const args2 = arguments[1];
          if (typeof args2 == 'function') {
            callback = args2;
          }
        } else {
          return;
        }

        const button = $(that).find('.modal-footer').find(el);
        if (button && button.length) {
          button.on('click', async function () {
            $(this).setBusy();
            try {
              await callback.call(that);
              that.hide();
            } finally {
              $(this).clearBusy();
            }
          });
        }
      }
    };

    this.init = () => {
      if (option == void 0 || !Object.keys(option).length) {
        option = option || {};

        const backdrop = $(that).data('backdrop');
        if (backdrop) {
          defaultOption.backdrop = backdrop != 'static' ? eval(backdrop) : backdrop;
        }

        const keyboard = $(that).data('keyboard');
        if (keyboard) {
          defaultOption.keyboard = eval(keyboard);
        }

        const show = $(that).data('show');
        if (show) {
          defaultOption.show = eval(show);
        }

        const focus = $(that).data('focus');
        if (focus) {
          defaultOption.focus = eval(focus);
        }
      }

      $(this).modal(defaultOption);
    };

    _init = function () {
      const modals = $('div.modal[role="dialog"]');
      if (modals.length == 1) {
        return;
      }

      modals.each((i, el) => {
        if (i > 0) {
          const index = $(el).css('z-index');
          if (index == 1050) {
            $(el).css('z-index', i * 20 + 1050);
          }
        }
      });
    };

    _init();

    return this;
  };
});
