$(function () {
  async function getNavList() {
    try {
      const request = $.createHttpRequest();
      request.url = `/navigation/list`;
      const res = await request.get();
      if (res && res.resCode == 0) {
        return res.data.list;
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  async function createNavGroup(list) {
    if (!list || !list.length) {
      return;
    }

    let html = '';
    for (let item of list) {
      html = html.concat(`
      <li class="card nav-group">
        <div class="group-header">
          <h2>${item.groupName}</h2>
        </div>
        <div class="group-body">
      `);

      for (data of item.list) {
        const favicon = data.favicon ? `<img src="${data.favicon}" onerror="javascript:this.src='/statics/icon/navigation.png'" alt="${data.name}"/>` : '<span class="mdi mdi-google-physical-web"></span>';

        html = html.concat(`
            <div class="nav-card flex-center-center" data-url="${data.url}">
                ${favicon}
                <span>${data.name}</span>
            </div>
        `);
      }

      html = html.concat('</div></li>');
    }

    $('ul.nav-panel').html(html);

    $('ul.nav-panel')
      .find('div.nav-card')
      .on('click', function () {
        window.open($(this).data('url'));
      });
  }

  this.init = async function () {
    const list = await getNavList();

    createNavGroup(list);

    window.lycoris.loading.hide();
  };

  this.init();
});
