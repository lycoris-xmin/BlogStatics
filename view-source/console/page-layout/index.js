$(function () {
  if (window.top == window.self) {
    location.href = '/404';
    return;
  }

  const pageLoading = $('div.page-body-loading');

  window.lycoris = window.parent.lycoris.createLycoris();

  window.lycoris.loading = {
    show: () => {
      pageLoading.addClass('loading');
    },
    hide: () => {
      pageLoading.remove();
    }
  };

  window.lycoris.signalR = {
    on: function (eventName, callback) {
      window.parent.lycoris.signalR.on(eventName, callback);
    },
    unbind: function (eventName) {
      window.parent.lycoris.signalR.unbind(eventName);
    },
    call: function (eventName, ...args) {
      window.parent.lycoris.signalR.call(eventName, ...args);
    }
  };
});
