$(function () {
  const model = {
    pageIndex: 1,
    pageSize: 20,
    done: false
  };

  const fluid = {
    containerWidth: 1300,
    column: {
      width: 320,
      count: 4,
      height: [],
      padding: 0
    }
  };

  const modal = $('#apply-Modal').blogModal();

  function fluidInit() {
    fluid.containerWidth = $('.container').width();

    fluid.column.padding = fluid.containerWidth - fluid.column.count * fluid.column.width;
    if (fluid.column.padding < 0) {
      fluid.column.count--;
      fluidInit();
      return;
    }

    for (let i = 0; i < fluid.column.count; i++) {
      fluid.column.height.push({
        index: 0,
        height: 0,
        left: i * fluid.column.padding + i * fluid.column.width
      });
    }
  }

  function createCardHtml(data) {
    const html = `
    <div class="flex-item card card-border">
      <div>
        <div class="header">
            <img src="${data.logo}" onerror="javascript:this.src='/statics/images/404.png'" />
        </div>
        <div class="line-wrap"></div>
        <div class="body">
            <p class="name" data-link="${data.link}">${data.name}</p>
            <p class="des">${data.description}</p>
        </div>
      </div>
    </div>  
    `;

    return html;
  }

  function setHtmlPosition(html) {
    const el = $(html);

    var minColumn = fluid.column.height.reduce(function (min, entity) {
      return entity.height < min.height ? entity : min;
    });

    minColumn.height += fluid.column.padding * 1.5;

    el.css('left', `${minColumn.left}px`);
    el.css('top', `${minColumn.height}px`);

    $('.friend-flex').append(el);

    const height = el.height();

    minColumn.height += height;

    el.find('p.name').on('click', function () {
      // 跳转外网时进行拦截并跳转到指定页面进行提示
      window.open($(this).data('link'));
    });
  }

  async function getFriendList() {
    if (model.done) {
      return;
    }

    try {
      const request = $.createHttpRequest();
      request.url = '/friendly/list';
      request.data = {
        pageIndex: model.pageIndex,
        pageSize: model.pageSize
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        if (res.data.list && res.data.list.length) {
          for (let item of res.data.list) {
            const html = createCardHtml(item);
            setHtmlPosition(html);
          }

          var maxCloumn = fluid.column.height.reduce(function (max, entity) {
            return entity.height > max.height ? entity : max;
          });

          $('.friend-flex').css('height', `${maxCloumn.height}px`);
        } else {
          model.done = false;
        }
      }
    } finally {
      //
    }
  }

  $('textarea[name="description"]').on('input', function () {
    const val = $(this).val();
    const maxLength = parseInt($(this).attr('maxlength'));
    $(this).next().find('span').text(val.length);
    if (val.length >= maxLength) {
      $(this).next().css('color', 'var(--color-danger)');
    } else {
      $(this).next().css('color', 'var(--color-dark-light)');
    }
  });

  $('button[apply]').on('click', function () {
    modal.show();
  });

  $('div.remind')
    .find('span.value')
    .on('click', function () {
      $.copyText($(this).text());
      window.lycoris.totast.success('复制成功');
    });

  $('div.owner-chevron>span').on('click', function () {
    const owner = $(this).parent().next();
    if ($(this).hasClass('slide-up')) {
      owner.slideUp(400);
      $(this).removeClass('slide-up');
    } else {
      owner.slideDown(400);
      $(this).addClass('slide-up');
    }
  });

  this.init = async function () {
    fluidInit();

    await getFriendList();

    window.lycoris.loading.hide();
  };

  this.init();
});
