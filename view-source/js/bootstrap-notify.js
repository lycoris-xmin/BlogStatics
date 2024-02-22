$(function () {
  const defaultOption = {
    from: 'top',
    align: 'center',
    dismiss: true,
    mouseOver: 'pause',
    onClosed: null
  };

  $.totast = {
    success: function (message, title, ...args) {
      args ??= {};
      args = configAssign(args);

      if (!title) {
        title = title || message;
        message = '';
      }

      $.notify(
        {
          icon: 'mdi mdi-check-circle',
          title: title,
          message: message
        },
        {
          type: 'success',
          allow_dismiss: true,
          newest_on_top: true,
          placement: {
            from: args.from,
            align: args.align
          },
          offset: {
            x: '20',
            y: '20'
          },
          spacing: '10',
          z_index: '1031',
          delay: '1000',
          animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
          },
          newest_on_top: true,
          allow_dismiss: args.dismiss,
          onClosed: args.onClosed,
          mouse_over: args.mouseOver
        }
      );
    },
    info: function (message, title, ...args) {
      args ??= {};
      args = configAssign(args);

      if (!title) {
        title = title || message;
        message = '';
      }

      $.notify(
        {
          icon: 'mdi mdi-information',
          title: title,
          message: message
        },
        {
          type: 'info',
          allow_dismiss: true,
          newest_on_top: true,
          placement: {
            from: args.from,
            align: args.align
          },
          offset: {
            x: '20',
            y: '20'
          },
          spacing: '10',
          z_index: '1031',
          delay: '1000',
          animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
          },
          newest_on_top: true,
          allow_dismiss: args.dismiss,
          onClosed: args.onClosed,
          mouse_over: args.mouseOver
        }
      );
    },
    warn: function (message, title, ...args) {
      args ??= {};
      args = configAssign(args);

      if (!title) {
        title = title || message;
        message = '';
      }

      $.notify(
        {
          icon: 'mdi mdi-alert',
          title: title,
          message: message
        },
        {
          type: 'warning',
          allow_dismiss: true,
          newest_on_top: true,
          placement: {
            from: args.from,
            align: args.align
          },
          offset: {
            x: '20',
            y: '20'
          },
          spacing: '10',
          z_index: '1031',
          delay: '1000',
          animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
          },
          newest_on_top: true,
          allow_dismiss: args.dismiss,
          onClosed: args.onClosed,
          mouse_over: args.mouseOver
        }
      );
    },
    error: function (message, title, ...args) {
      args ??= {};
      args = configAssign(args);

      if (!title) {
        title = title || message;
        message = '';
      }

      $.notify(
        {
          icon: 'mdi mdi-shield-remove',
          title: title,
          message: message
        },
        {
          type: 'danger',
          allow_dismiss: true,
          newest_on_top: true,
          placement: {
            from: args.from,
            align: args.align
          },
          offset: {
            x: '20',
            y: '20'
          },
          spacing: '10',
          z_index: '1031',
          delay: '1000',
          animate: {
            enter: 'animated fadeInDown',
            exit: 'animated fadeOutUp'
          },
          newest_on_top: true,
          allow_dismiss: args.dismiss,
          onClosed: args.onClosed,
          mouse_over: args.mouseOver
        }
      );
    }
  };

  function configAssign(option) {
    if (!option.from) {
      option.from = defaultOption.from;
    }

    if (!option.align) {
      option.align = defaultOption.align;
    }

    if (!option.dismiss) {
      option.dismiss = defaultOption.dismiss;
    }

    if (!option.mouseOver) {
      option.mouseOver = defaultOption.mouseOver;
    }

    if (!option.onClosed && typeof onClosed == 'function') {
      option.onClosed = defaultOption.onClosed;
    }

    return option;
  }
});
