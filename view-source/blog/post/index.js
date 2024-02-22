$(function () {
  const doms = {
    cherry: void 0,
    barContainer: $('div.bar-container'),
    toolContainer: $('.tool-container'),
    prev: $('.prev-post').lineBusy(),
    next: $('.next-post').lineBusy()
  };

  function getScriptJson() {
    try {
      const jsonText = $('script[page-data]').text();
      window.lycoris.post = JSON.parse(jsonText);
    } catch (error) {
      window.lycoris.post = {};
      console.log(error);
    }
  }

  async function getPostMarkdown() {
    try {
      const request = $.createHttpRequest();
      request.url = '/post/markdown';
      request.data = {
        id: window.lycoris.post.id
      };
      const res = await request.get();
      if (!res || res.resCode != 0 || !res.data) {
        return '';
      }

      return res.data;
    } catch (error) {
      return '';
    }
  }

  function createCherryMarkdown(value) {
    try {
      const option = {
        id: 'cherry-markdown-container',
        value: value || '',
        editor: {
          codemirror: {
            theme: 'default'
          },
          defaultModel: 'previewOnly',
          convertWhenPaste: true
        },
        engine: {
          global: {
            htmlWhiteList: 'iframe|script|style'
          },
          syntax: {
            list: {
              listNested: true
            },
            inlineCode: {
              theme: 'red'
            },
            codeBlock: {
              theme: 'dark',
              wrap: true,
              lineNumber: true
            }
          }
        },
        toolbars: {
          showToolbar: false,
          autoScrollByHashAfterInit: true
        }
      };

      doms.cherry = new Cherry(option);
    } catch (error) {
      //
    } finally {
      $('div.cherry-dropdown,table.cherry-dropdown').remove();
      $('div.cherry-toolbar').remove();
      $('div.cherry-editor').remove();

      setTimeout(() => {
        $('.cherry-markdown-container')
          .find('i.ch-icon-copy')
          .each((i, el) => {
            $(el).attr('title', '复制');
            $(el).parent().attr('title', '复制');
          });
      }, 0);
    }
  }

  function getMarkdownTopic() {
    const topics = [];

    const allTopic = document.querySelector('div.cherry-previewer').querySelectorAll('h1,h2');

    let data = {};

    for (let i = 0; i < allTopic.length; i++) {
      const topic = allTopic[i];
      const id = `${topic.tagName.toLocaleLowerCase()}-${i}`;
      topic.setAttribute('id', id);
      data = {
        level: parseInt(topic.tagName.replace('H', '')),
        id: id,
        text: topic.innerText
      };

      if (topics.length > 0) {
        if (topics[topics.length - 1].level < data.level) {
          if (!topics[topics.length - 1].child) {
            topics[topics.length - 1].child = [];
          }

          topics[topics.length - 1].child.push(data);
          continue;
        }
      }

      topics.push(data);
    }

    const res = [];
    for (let topic of topics) {
      let data = {
        id: topic.id,
        text: topic.text,
        child: []
      };

      if (topic.child && topic.child.length) {
        data.child = topic.child.map(x => {
          return {
            id: x.id,
            text: x.text
          };
        });
      }

      res.push(data);
    }

    return res;
  }

  function createPostTopics(topics) {
    if (topics && topics.length) {
      const topic = doms.barContainer.find('ul.topics');
      let html = '';
      for (let topic of topics) {
        html = html.concat(`<li class="first" data-id="${topic.id}">${topic.text}</li>`);
        if (topic.child && topic.child.length) {
          for (let child of topic.child) {
            html = html.concat(`<li class="second" data-id="${child.id}">${child.text}</li>`);
          }
        }
      }

      topic.html(html);

      topic.find('li').on('click', function () {
        const id = $(this).data('id');
        goTopic(id);
      });
    }

    function goTopic(id) {
      if (id) {
        const dom = $(`#${id}`);
        $('html, body').animate(
          {
            scrollTop: dom.offset().top - 90
          },
          1000,
          function () {
            dom.addClass('focus-topic');
            setTimeout(() => {
              dom.removeClass('focus-topic');
            }, 700);
          }
        );
      }
    }
  }

  async function getPostPreviousAndNext() {
    try {
      const request = $.createHttpRequest();
      request.url = '/post/previousandnext';
      request.data = {
        id: window.lycoris.post.id
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        const pagination = $('.prev-next');

        if (res.data) {
          if (res.data.previous && Object.keys(res.data.previous).length) {
            setPostPreviousAndNext(pagination.find('a.prev-post'), res.data.previous);
          }
          if (res.data.next && Object.keys(res.data.next).length) {
            setPostPreviousAndNext(pagination.find('a.next-post'), res.data.next);
          }

          doms.prev.destroy();
          doms.next.destroy();

          if (!res.data.next && !res.data.previous) {
            pagination.remove();
          }
        }
      }
    } catch (error) {}
  }

  function setPostPreviousAndNext(el, data) {
    el.find('p.title').text(data.title);
    el.find('img.icon').attr('src', data.icon);
    el.attr('href', `/post/${data.id}`);

    el.find('span.previous,span.next').text(el.hasClass('prev-post') ? '上一篇' : '下一篇');
  }

  async function getOwnerPublish() {
    const request = $.createHttpRequest();
    request.url = '/home/owner/publish';
    request.data = {};
    const res = await request.get();
    if (res && res.resCode == 0) {
      //
      const statistics = $('div.statistics');
      statistics.find('span[post]').text(res.data.post);
      statistics.find('span[talk]').text(res.data.talk);
      statistics.find('span[category]').text(res.data.category);

      statistics.find('div.loading').removeClass('loading');
    }
  }

  function markDwonImagePreview() {
    const imgs = $('.cherry-previewer').find('img');

    if (imgs && imgs.length) {
      const srcList = [];
      imgs.each((i, el) => {
        $(el).attr('data-index', i);
        $(el).attr('title', `图 - ${i + 1}`);
        $(el).after(`<p style="text-align:center;font-weight:600;cursor:default">图 - ${i + 1}</p>`);
        srcList.push($(el).attr('src'));
      });

      const viewer = $.lycorisImagePreviewer(srcList);

      imgs.on('click', function () {
        const index = $(this).attr('data-index');
        viewer.show(index);
      });
    }
  }

  doms.toolContainer.find('div.rocket').on('click', function () {
    $('html, body').animate(
      {
        scrollTop: 0
      },
      500
    );
  });

  doms.toolContainer.find('div.share').on('click', async function () {
    const postLink = `${window.lycoris.post.title}\r\n${window.location.href}\r\n作者：Lycoris - 程序猿的小破站`;
    await $.copyText(postLink);
    window.lycoris.totast.success('复制链接成功,感谢您的分享');
  });

  this.init = async function () {
    doms.prev.show();
    doms.next.show();

    //
    getScriptJson();

    const markdown = await getPostMarkdown();

    createCherryMarkdown(markdown);

    const topics = getMarkdownTopic();

    createPostTopics(topics);

    window.lycoris.loading.hide();

    $('[data-toggle="tooltip"]').lycorisTooltip();

    markDwonImagePreview();

    getPostPreviousAndNext();

    getOwnerPublish();

    window.lycoris.record(document.title.replace(' - 程序猿的小破站', ''), true);
  };

  this.init();
});
