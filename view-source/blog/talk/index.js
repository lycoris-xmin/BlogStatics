$(function () {
  const doms = {
    pagination: $('div[pagination]').find('ul.pagination')
  };

  const model = {
    pageIndex: 1,
    pageSize: 10,
    maxPageIndex: 1
  };

  async function getTalkList() {
    try {
      const request = $.createHttpRequest();
      request.url = '/talk/list';
      request.data = {
        pageIndex: model.pageIndex,
        pageSize: model.pageSize
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        model.maxPageIndex = $.getMaxPageIndex(res.data.count, model.pageSize);

        let html = '';
        for (let item of res.data.list) {
          html = html.concat(createTalkHtml(item));
        }

        if (res.data.count > 0) {
          $('ul.talk-group').html(html);
        }

        $.scroll.toTop();
        createPagination(model.pageIndex);
      }
    } finally {
      //
    }
  }

  function createTalkHtml(item) {
    const client = $.getUserAgentImg(item.agentFlag);

    return `
    <li>
      <div class="card">
        <div class="card-header border-bottom dashed">
            <div class="flex-between-center">
                <div class="flex-start-center">
                    <div class="avatar">
                        <img src="./statics/avatar/default_admin.jpg" onerror="javascript:this.src='./statics/avatar/default_admin.jpg'" />
                    </div>
                    <div>
                        <span>Lycoris</span>
                        <span>${item.createTime}</span>
                    </div>
                </div>
                <div class="flex-end-center">
                    <div>
                        <span class="mdi mdi-map-marker-radius"></span>
                        <span>${item.ipAddress}</span>
                    </div>
                    <img class="client" src="${client.url}"  title="${client.title}"/>
                </div>
            </div>
        </div>
        <div class="card-body">
            <p>${item.content}</p>
        </div>
      </div>
    </li>
    `;
  }

  function createPagination(currentPage) {
    currentPage = currentPage || 1;
    if (model.maxPageIndex > 1) {
      const pageArray = $.getPageNumber(currentPage, model.maxPageIndex);

      let html = '';

      html = `
    <li class="page-item page-btn" data-index="-1">
      <span class="page-link">上一页</span>
    </li>
    `;

      for (let item of pageArray) {
        html += `
      <li class="page-item page-number ${item == currentPage ? 'active' : ''}" data-index="${item}">
        <span class="page-link">${item}</span>
      </li>
      `;
      }

      html += `
    <li class="page-item page-btn" data-index="1">
      <span class="page-link">下一页</span>
    </li>
    `;

      doms.pagination.html(html);

      registerPaginationClick();
    } else {
      doms.pagination.parent().remove();
    }
  }

  function registerPaginationClick() {
    doms.pagination.find('>li.page-number').on('click', async function () {
      const pageIndex = $(this).data('index');
      if (model.pageIndex != pageIndex) {
        model.pageIndex = pageIndex;
        if (model.maxPageIndex > pageIndex) {
          createPagination($(this).data('index'));
        } else {
          doms.pagination.find('>li.page-number').removeClass('active');
          $(this).addClass('active');
        }

        await getTalkList();
      }
    });

    doms.pagination.find('>li.page-btn').on('click', function () {
      const index = parseInt($(this).data('index'));

      let pageIndex = model.pageIndex + index;
      if (pageIndex < 1 || pageIndex > model.maxPageIndex) {
        return;
      }

      doms.pagination.find(`>li.page-number[data-index="${pageIndex}"]`).trigger('click');
    });
  }

  this.init = async function () {
    await getTalkList();

    window.lycoris.loading.hide();
  };

  this.init();
});
