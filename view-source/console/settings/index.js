$(function () {
  const getSettings = async function () {
    const request = window.lycoris.createRequest();
    request.url = '/settings/all';
    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    }

    return void 0;
  };

  this.init = async function () {
    const config = await getSettings();
    window.lycoris.events.call('basic', config.webBasic);
    window.lycoris.events.call('blog', config.blog);
    window.lycoris.events.call('email', config.email);
    window.lycoris.events.call('staticFile', config.staticFile);
    window.lycoris.events.call('other', config.other);

    window.lycoris.loading.hide();
  };

  this.init();
});
