$(function () {
  const doms = {
    message: $('div.message-panel').find('div.body'),
    pagination: $('div.pagination-btn').find('ul.pagination')
  };

  const model = {
    configuration: {
      messageRemind: [],
      frequencySecond: 0
    }
  };

  const message = {
    pageIndex: 1,
    pageSize: 10,
    count: 0,
    maxPageIndex: 1
  };

  const swal = $.sweetAlert();

  let comments = {};

  async function getConfiguration() {
    try {
      const request = $.createHttpRequest();
      request.url = '/message/configuration';
      const res = await request.get();
      if (res && res.resCode == 0) {
        if (res.data.messageRemind && res.data.messageRemind.length > 0) {
          model.configuration.messageRemind = res.data.messageRemind;
        }

        if (typeof res.data.frequencySecond == 'number') {
          model.configuration.frequencySecond = res.data.frequencySecond;
        }
      }
    } finally {
      createMessageRemind();
    }
  }

  async function getMessageList(first = false) {
    doms.message.next().addClass('show-loading');
    if (!first) {
      doms.message.html('');
    }

    try {
      const request = $.createHttpRequest();
      request.url = '/message/list';
      request.data = {
        pageIndex: message.pageIndex,
        pageSize: message.pageSize
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        message.count = res.data.count;
        message.maxPageIndex = $.getMaxPageIndex(res.data.count, message.pageSize);
        //

        const htmls = [];
        for (let item of res.data.list) {
          htmls.push(createMessageCardHtml(item));
          comments[item.id] = {
            pageIndex: 1,
            pageSize: 5,
            maxPageIndex: 1,
            count: item.replyCount,
            first: true
          };
        }

        appendToMessage(htmls);

        $('html, body').animate(
          {
            scrollTop: 0
          },
          500
        );

        createPagination($('div[pagination]').find('ul'), message, async () => {
          comments = {};
          await getMessageList();
        });

        $('div[pagination]').addClass('show');
      }
    } finally {
      doms.message.next().removeClass('show-loading');
    }
  }

  $('textarea[name="message"]').on('input', function () {
    const val = $(this).val();
    const limit = $(this).next();
    const max = parseInt($(this).attr('maxlength'));
    limit.find('span').text(val.length);
    if (val.length >= max) {
      limit.css('color', 'var(--color-danger)');
    } else {
      limit.css('color', 'var(--color-dark-light)');
    }
  });

  $('button[login]').on('click', function () {
    window.lycoris.route.toLoginPage();
  });

  $('button[publish]').on('click', async function () {
    if ($('div.login-wrap').length) {
      return;
    }

    const val = $('textarea[name="message"]').val();

    if (val == '' || val.trim() == '') {
      return;
    }

    if (!checkPublishRate()) {
      return;
    }

    $(this).setBusy();
    try {
      const request = $.createHttpRequest();
      request.url = '/message/publish';
      request.data = {
        content: val
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        const html = createMessageCardHtml(res.data);
        appendToMessage([html], true);
        $('textarea[name="message"]').val('').focus();
      }
    } finally {
      $(this).clearBusy();
    }
  });

  function createMessageRemind() {
    if (model.configuration.messageRemind.length > 0) {
      let html = ``;

      for (let i = 0; i < model.configuration.messageRemind.length; i++) {
        html = html.concat(`<li>${i + 1}. ${model.configuration.messageRemind[i]}</li>`);
      }

      $('ul.remind').html(html);
    }
  }

  function createMessageCardHtml(data) {
    const client = $.getUserAgentImg(data.agentFlag);
    const html = `
    <div class="card card-border message">
      <div class="flex-between-center header">
        <div class="flex-start-center">
            <div class="avatar">
                <img src="${data.user.avatar}" onerror="javascript:this.src='./statics/avatar/default_user.jpg'" />
            </div>
            <div>
                <p><span class="name" data-id="${data.user.id}">${data.user.nickName}</span>${data.isOwner ? `<span class="owner">博主</span>` : ''}</p>
                <span class="time">${data.createTime}</span>
            </div>
        </div>

        <div class="flex-end-center">
          <span>
            <i class="mdi mdi-map-marker-radius"></i>
          </span>
          <span class="address">${data.ipAddress}</span>
          <img class="client" src="${client.url}"  title="${client.title}"/>
        </div>
      </div>
      <div class="content">
        ${data.status == 0 ? `<p>${data.content || '-'}</p>` : `<div class="violation"><span>内容涉及敏感词汇，已被博主隐藏...</span></div>`}
      </div>
      <div class="flex-end-center">
        <div class="comment">
          <div class="body">
            <ul>
              ${createCommentHtml(data.redundancy)}
            </ul>
            <div class="line-loading-preloader">
              <div class="line-loading-preloader-inner"></div>
              <span class="loading-text">评论加载中...</span>
            </div>
          </div>
          <div class="pagination flex-end-center" comment-pagination>
            <ul class="pagination">
            </ul>
          </div>
          <div class="reply-panel">
            <div class="input-area">
              <textarea class="input-control" name="reply" maxlength="100" data-reply-name=""></textarea>
              <p><span>0</span>/100</p>
            </div>
            <div>
              ${createShowAllReplyHtml(data.id, data.replyCount)}
              <div>
                <button class="btn" hide-reply type="button">不说了</button>
                <button class="btn" reply type="button" data-message data-id="${data.id}">
                  <span class="mdi mdi-send-circle-outline"></span>
                  <span class="mdi mdi-loading mdi-spin"></span>
                  <span class="text">回复</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    const div = document.createElement('div');
    $(div).addClass('card card-border message');

    return html;
  }

  function createShowAllReplyHtml(id, count) {
    if (count <= 2) {
      return '';
    }

    return `
      <button redundancy class="btn" type="button" data-message="${id}">
        <span class="mdi mdi-dots-horizontal"></span>
        <span class="mdi mdi-loading mdi-spin"></span>
        查看全部 ${count} 条回复
      </button>
      `;
  }

  function createCommentHtml(list, animation = false) {
    if (!list || !list.length) {
      return '';
    }

    let html = '',
      classes = '';

    if (animation) {
      classes = `class="scale"`;
    }

    for (let data of list) {
      const client = $.getUserAgentImg(data.agentFlag);

      html = html.concat(`
      <li ${classes}>
        <div class="flex-start-center">
          <div class="avatar">
              <img src="${data.user.avatar}" onerror="javascript:this.src='./statics/avatar/default_user.jpg'" />
          </div>
          <div class="nickname">
            <span class="name">${data.user.nickName}</span>
            ${data.isOwner ? `<span class="owner">博主</span>` : ''}
            <span style="padding-right:5px">:</span>
          </div>
          ${createContent(data)}
        </div>
        <div class="flex-end-center info">
          <span class="time">${data.createTime}</span>
          <span class="ipaddress"><i class="mdi mdi-map-marker-radius"></i>${data.ipAddress}</span>
          <img class="client" src="${client.url}" title="${client.title}"/>
          <span reply class="reply" data-name="${data.user.nickName}" data-id="${data.id}">回复</span>
        </div>
      </li>
      `);
    }

    function createContent(data) {
      if (data.status == 0) {
        return `<p class="content">${data.repliedUser && data.repliedUser.id > 0 ? `<span class="replied" data-id="${data.repliedUser.id}">@${data.repliedUser.nickName}</span>` : ''}${data.content}</p>`;
      } else {
        return `<p class="violation"><span>内容涉及敏感词汇，已被博主隐藏...</span></p>`;
      }
    }

    return html;
  }

  function appendToMessage(htmls, prepend = false) {
    if (htmls && htmls.length) {
      if (prepend) {
        if (doms.message.find('div.message').length == message.pageSize) {
          doms.message.find('div.message:last-child').remove();
        }
      }

      for (let html of htmls) {
        const el = $(html);
        if (prepend) {
          doms.message.prepend(el);
        } else {
          doms.message.append(el);
        }

        // 查看所有评论
        el.find('button[redundancy]').on('click', showAllComment);

        // 回复按钮
        el.find('button[reply]').on('click', reply);

        // 不说了
        el.find('button[hide-reply]').on('click', hideReply);

        // 评论行内回复
        el.find('span[reply]').on('click', commentReply);

        // 回复框字数监听
        el.find('.input-control').on('input', replyTextareaInput);
      }
    }
  }

  function createPagination(el, model, callback) {
    if (model.maxPageIndex > 1) {
      const pageArray = $.getPageNumber(model.pageIndex, model.maxPageIndex);

      let html = '';

      html = `
    <li class="page-item page-btn" data-index="-1">
      <span class="page-link">上一页</span>
    </li>
    `;

      for (let item of pageArray) {
        html += `
      <li class="page-item page-number ${item == model.pageIndex ? 'active' : ''}" data-index="${item}">
        <span class="page-link">${item}</span>
      </li>
      `;
      }

      html += `
    <li class="page-item page-btn" data-index="1">
      <span class="page-link">下一页</span>
    </li>
    `;

      el.html(html);

      registerPaginationClick(el, model, callback);
    } else {
      el.parent().remove();
    }
  }

  function registerPaginationClick(el, model, callback) {
    el.find('>li.page-number').on('click', function () {
      const index = $(this).data('index');
      if (model.pageIndex != index) {
        model.pageIndex = index;
        if (model.maxPageIndex > index) {
          createPagination(el, model, callback);
        } else {
          el.find('>li.page-number').removeClass('active');
          $(this).addClass('active');
        }

        callback();
      }
    });

    el.find('>li.page-btn').on('click', function () {
      const index = parseInt($(this).data('index'));

      let pageIndex = model.pageIndex + index;
      if (pageIndex < 1 || pageIndex > model.maxPageIndex) {
        return;
      }

      el.find(`>li.page-number[data-index="${pageIndex}"]`).trigger('click');
    });
  }

  function hideOtherReplyAction() {
    const other = $('div.input-area[data-reply="1"]');
    if (other && other.length) {
      for (let item of other) {
        $(item).parent().find('button[hide-reply]').trigger('click');
      }
    }
  }

  async function reply() {
    if (!window.lycoris.online) {
      const isConfirmed = await swal.confirm('鉴于小破站资金资源不足，需要已注册用户登录后才允许留言', '用户登录提醒');

      if (isConfirmed) {
        window.lycoris.route.toLoginPage();
      }
      return;
    }

    const replyPanel = $(this).parent().parent().parent();

    if (replyPanel.find('div.input-area').attr('data-reply') != '1') {
      hideOtherReplyAction();

      replyPanel.find('div.input-area').slideDown(() => {
        replyPanel.find('div.input-area').attr('data-reply', '1');
        replyPanel.find('button[hide-reply]').show();
        const btn = replyPanel.find('button[reply]');
        btn.attr('data-message', '');
        btn.find('.text').text('发布');
        replyPanel.find('textarea').focus();
      });

      return;
    } else if (replyPanel.find('div.input-area').css('display') == 'none') {
      return;
    }

    if (!checkPublishRate()) {
      return;
    }

    const textarea = replyPanel.find('textarea');
    let content = getReplyText(textarea);

    if (content) {
      $(this).setBusy();
      try {
        const reqeust = $.createHttpRequest();
        reqeust.url = '/message/reply/publish';
        reqeust.data = {
          messageId: $(this).attr('data-message') || $(this).data('id'),
          content: content
        };
        const res = await reqeust.post();
        if (res && res.resCode == 0) {
          window.lycoris.totast.success('发布成功');

          // 插入一条数据
          const html = createCommentHtml([res.data], true);

          const el = $(html);

          const commentEl = $(this).parent().parent().parent().parent();

          const ul = commentEl.find('div.body').find('ul');

          ul.prepend(el);

          el.find('span[reply]').on('click', commentReply);

          const li = ul.find('li');
          if (li.length > 5) {
            $(li[li.length - 1]).remove();
          }

          hideReply.apply(this);
          textarea.val('');

          comments[reqeust.data.messageId].count++;
          if (comments[reqeust.data.messageId].count > 5) {
            comments[reqeust.data.messageId].first = false;
            comments[reqeust.data.messageId].maxPageIndex = $.getMaxPageIndex(comments[reqeust.data.messageId].count, comments[reqeust.data.messageId].pageSize);
            createPagination(commentEl.find('div[comment-pagination]').find('ul'), comments[reqeust.data.messageId], async () => {
              getCommentList(commentEl, reqeust.data.messageId, comments[reqeust.data.messageId]);
            });

            //commentEl.find('div[comment-pagination]').fadeIn().css('display', 'flex');
          }
        }
      } finally {
        $(this).clearBusy();
      }
    }
  }

  function hideReply() {
    const replyPanel = $(this).parent().parent().parent();
    replyPanel.find('button[hide-reply]').hide();

    replyPanel.find('div.input-area').slideUp(() => {
      replyPanel.find('div.input-area').attr('data-reply', '0');
      replyPanel.find('div.input-area').find('textarea').val('');
      const btn = replyPanel.find('button[reply]');
      btn.find('.text').text('回复');
      btn.attr('data-message', '');
    });
  }

  function showAllComment() {
    const messageId = $(this).attr('data-message');
    if (messageId) {
      comments[messageId].maxPageIndex = $.getMaxPageIndex(comments[messageId].count, comments[messageId].pageSize);
      getCommentList($(this).parent().parent().parent(), messageId, comments[messageId]);
    }
  }

  async function getCommentList(commentEl, messageId, data) {
    const button = commentEl.find('button[redundancy]');
    if (button && button.length) {
      button.setBusy();
    } else {
      commentEl.find('div.line-loading-preloader').addClass('show-loading ');
    }

    try {
      const reqeust = $.createHttpRequest();
      reqeust.url = '/message/reply/list';
      reqeust.data = {
        messageId: messageId,
        pageIndex: data.pageIndex,
        pageSize: data.pageSize
      };

      const res = await reqeust.get();

      if (res && res.resCode == 0) {
        if (data.first) {
          res.data.list.splice(0, 2);
        }

        const html = createCommentHtml(res.data.list, true);
        const el = $(html);

        if (data.first) {
          commentEl.find('div.body').find('>ul').append(el);
        } else {
          commentEl.find('div.body').find('>ul').html(el);
        }

        el.find('span[reply]').on('click', commentReply);

        if (button && button.length) {
          setTimeout(() => {
            button.fadeOut(() => {
              button.remove();
            });
          }, 100);
        }

        const pagination = commentEl.find('div[comment-pagination]');

        if (data.first) {
          createPagination(pagination.find('ul'), data, async () => {
            getCommentList(commentEl, messageId, data);
          });

          data.first = false;
        }

        if (!pagination.hasClass('show')) {
          pagination.addClass('show');
        }
      }
    } finally {
      if (button && button.length) {
        button.clearBusy();
      } else {
        commentEl.find('div.line-loading-preloader').removeClass('show-loading ');
      }
    }
  }

  // 评论回复
  async function commentReply() {
    if (!window.lycoris.online) {
      const isConfirmed = await swal.confirm('鉴于小破站资源限制，需要已注册用户登录后才允许留言', '用户登录提醒');

      if (isConfirmed) {
        window.lycoris.route.toLoginPage();
      }
      return;
    }

    const name = $(this).data('name');

    const comment = $(this).parent().parent().parent().parent().parent();

    const textarea = comment.find('textarea[name="reply"]');
    const val = textarea.val();

    const replyName = `@${name}`;
    const data_replyName = textarea.attr('data-reply-name') || '';
    if (!val.startsWith(data_replyName) || replyName != data_replyName) {
      if (val.startsWith(data_replyName)) {
        textarea.val(`${val.replace(data_replyName, replyName)} `);
      } else {
        textarea.val(`${replyName} ${val}`);
      }

      textarea.attr('data-reply-name', replyName);
    }

    comment.find('button[reply]').attr('data-message', $(this).attr('data-id'));
    comment.find('button[reply]').attr('data-reply-name', replyName);

    const replyPanel = comment.find('div.reply-panel');

    if (replyPanel.find('div.input-area').attr('data-reply') != '1') {
      hideOtherReplyAction();

      replyPanel.find('div.input-area').slideDown(() => {
        replyPanel.find('div.input-area').attr('data-reply', '1');
        replyPanel.find('button[hide-reply]').show();
        replyPanel.find('button[reply]').find('.text').text('发布');
        textarea.focus();
      });

      return;
    }

    setTimeout(() => {
      textarea.focus();
    }, 0);
  }

  function replyTextareaInput() {
    //
    const val = $(this).val();
    const max = parseInt($(this).attr('maxlength'));

    let replyName = $(this).data('reply-name');

    let length = val.length;

    if (replyName) {
      if (val.startsWith(`${replyName} `)) {
        length = length - `${replyName} `.length;
      } else if (val.startsWith(replyName)) {
        length = length - replyName.length;
      }
    }

    if (val.startsWith(replyName)) {
      if (max != 100 + replyName.length) {
        $(this).attr('maxlength', 100 + replyName.length);
      }
    } else if (max != 100) {
      $(this).attr('maxlength', 100);
    }

    $(this).next().find('span').text(length);
    if (val.length >= max) {
      $(this).next().css('color', 'var(--color-danger)');
    } else {
      $(this).next().css('color', 'var(--color-dark-light)');
    }
  }

  function getReplyText(el) {
    let val = el.val();
    const replyName = el.data('reply-name');
    if (replyName && val.startsWith(replyName)) {
      val = val.replace(replyName, '');
    } else {
      el.parent().next().find('button[reply]').attr('data-message', '');
    }

    return val.trim();
  }

  let lastPublish = localStorage.getItem('x-message');

  function checkPublishRate() {
    if (model.configuration.frequencySecond == 0) {
      return true;
    }

    lastPublish = lastPublish || +new Date(2000, 1, 1);
    const time = +new Date();
    if (lastPublish >= time) {
      window.lycoris.totast.info('你发布的频率太快了，请休息一会吧');
      return false;
    }

    lastPublish = time + model.configuration.frequencySecond * 1000;
    localStorage.setItem('x-message', lastPublish);

    return true;
  }

  this.init = async function () {
    await getConfiguration();

    window.lycoris.loading.hide();

    await getMessageList(true);
  };

  this.init();
});
