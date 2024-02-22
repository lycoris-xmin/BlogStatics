$(function () {
  const postComment = $('div.post-comment');

  const doms = {
    textarea: postComment.find('textarea[name="comment"]'),
    login: postComment.find('button.login'),
    publish: postComment.find('button.publish'),
    commentPanel: postComment.find('div.comment-list-panel').lineBusy(),
    commentTotal: postComment.find('p.comment-total').find('span'),
    commentList: postComment.find('ul.comment-list'),
    pagination: $('div.pagination-btn').find('ul.pagination')
  };

  const model = {
    count: 0,
    pageIndex: 1,
    pageSize: 5,
    maxPageIndex: 0
  };

  doms.textarea.on('input', function () {
    const text = $(this).val() || '';
    const limit = $(this).next();
    const length = text.length;
    limit.find('span').text(length);
    if (length >= 100) {
      if (!limit.hasClass('max')) {
        limit.addClass('max');
      }
    } else if (limit.hasClass('max')) {
      limit.removeClass('max');
    }
  });

  doms.login.on('click', function () {
    window.lycoris.route.toLoginPage();
  });

  doms.publish.on('click', async function () {
    let data = {
      postId: window.lycoris.post.id,
      content: $('textarea[name="comment"]').val(),
      commentId: 0,
      repliedUserId: 0
    };

    data.content = data.content.trim();

    if (!data.content) {
      return;
    }

    $(this).setBusy();

    try {
      const request = $.createHttpRequest();
      request.url = '/post/Comment/Publish';
      request.data = data;
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('发布成功');

        if (model.pageIndex == 1) {
          const html = createCommentHtml(res.data);
          doms.commentList.prepend(html);

          const li = $('li.comment-item');
          if (li.length > model.pageSize) {
            $(li[li.length - 1]).remove();
          }

          model.count++;
          doms.commentTotal.text(model.count);
        } else {
          getCommentList();
        }

        $('textarea[name="comment"]').val('');
      }
    } finally {
      $(this).clearBusy();
    }
  });

  async function getCommentList() {
    doms.commentPanel.show('文章评论加载中...');

    try {
      const request = $.createHttpRequest();
      request.url = '/post/comment/list';
      request.data = {
        postId: window.lycoris.post.id,
        pageIndex: model.pageIndex,
        pageSize: model.pageSize
      };

      const res = await request.get();
      if (res && res.resCode == 0) {
        model.count = res.data.count;
        model.maxPageIndex = $.getMaxPageIndex(res.data.count, model.pageSize);

        if (res.data.list && res.data.list.length) {
          let html = '';
          for (let item of res.data.list) {
            html += createCommentHtml(item);
          }

          // 插入
          doms.commentList.html(html);
        }

        doms.commentTotal.text(res.data.count);

        createPagination(model.pageIndex);
      }
    } finally {
      doms.commentPanel.hide();
    }
  }

  function createCommentHtml(item) {
    //
    const avatar = item.user.avatar.startsWith('mdi')
      ? `<span class="mdi ${item.user.avatar}" data-id="${item.user.id}"></span> `
      : `<img src="${item.user.avatar}" onerror="javascript:this.src='/statics/avatar/${item.isOwner ? 'default_admin' : 'default_user'}.jpg'" data-id="${item.user.id}"/>`;

    return `
        <li class="comment-item">
          <div class="flex-between-center">
            <div class="user">
                <div class="flex-center-center">
                    <div class="avatar">
                      ${avatar}
                    </div>
                    <div>
                        <p class="name">${item.user.nickName}${item.isOwner ? `<span class="owner">博主</span>` : ''}</p>
                        <small class="time">${item.createTime}</small>
                    </div>
                </div>
            </div>

            <div>
                <span>
                    <i class="mdi mdi-map-marker-radius"></i>
                </span>
                <span class="address">${item.ipAddress}</span>
                <img class="client" src="/statics/icon/browser/edge.png" />
            </div>
          </div>
          <div class="content">
            <p>${item.content}</p>
          </div>
        </li>
        `;
  }

  function createPagination(currentPage) {
    if (model.count > 0 && model.maxPageIndex > 1) {
      currentPage = currentPage || 1;

      const pageArray = $.getPageNumber(currentPage, model.maxPageIndex);

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

      doms.pagination.html(html);

      registerPaginationClick();
    }
  }

  function registerPaginationClick() {
    doms.pagination.find('>li.page-number').on('click', async function () {
      const pageIndex = $(this).data('index');
      if (model.pageIndex != pageIndex) {
        model.pageIndex = pageIndex;
        if (model.maxPageIndex > model.maxPageNumber) {
          createPagination($(this).data('index'));
        } else {
          doms.pagination.find('>li.page-number').removeClass('active');
          $(this).addClass('active');
        }

        await getCommentList();
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

  this.init = function () {
    const postCommentDiv = document.querySelector('.post-comment.card.card-border');

    if (postCommentDiv) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      };

      const observer = new IntersectionObserver(function (entries, observer) {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
            getCommentList();
          }
        });
      }, options);

      observer.observe(postCommentDiv);
    }
  };

  this.init();
});
