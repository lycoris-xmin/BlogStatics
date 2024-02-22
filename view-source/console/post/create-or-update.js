$(function () {
  const id = $('input[name="id"]')?.val() || '';
  const title = $('input[name="title"]');
  const markdown = {
    instance: void 0,
    busy: $('div.cherry-body').busy()
  };

  const settingPanel = $('div.post-setting-panel');
  const settingModal = $('#setting-Modal').bootstrapModal();

  settingPanel.find('button.btn-secondary').on('click', function () {
    $('body').fadeOut(() => {
      window.parent.lycoris.multitabs.remove(location.pathname, `${window.lycoris.console}/post`);
    });
  });

  settingPanel.find('button.btn-purple,button.btn-warning').on('click', async function () {
    if ($(this).hasClass('btn-purple')) {
      let tmp = title.val();
      tmp = tmp.trimStart().trimEnd();
      if (!tmp) {
        window.lycoris.totast.warn('请先输入文章标题');
        return;
      }

      tmp = markdown.instance.getMarkdown();
      tmp = tmp.trimStart().trimEnd();
      if (!tmp) {
        window.lycoris.totast.warn('请输入文章内容');
        return;
      }

      if (id) {
        $(this).setBusy();
        try {
          const data = getData();
          await submit(data);
        } finally {
          $(this).clearBusy();
        }

        return;
      }
    }

    settingModal.show();
  });

  settingPanel.find('button.btn-info').on('click', async function () {
    $(this).setBusy();
    try {
      let data = getData(true);
      if (!data.title) {
        window.lycoris.totast.warn('请输入文章标题');
        return;
      } else if (!data.markdown || !data.markdown.trimStart().trimEnd()) {
        window.lycoris.totast.warn('请输入文章内容');
        return;
      }

      const postId = await submit(data);
      if (id == 0 && postId) {
        const url = `${window.lycoris.console}/post/update/${postId}`;
        window.parent.lycoris.multitabs.updateCurrentTab(data.title || '未命名', url);
        location.href = url;
      }
    } finally {
      $(this).clearBusy();
    }
  });

  settingPanel.find('button.btn-outline-dark,button.btn-dark').on('click', function () {
    //
    const switchSpan = $(this).find('span.switch-text');
    const isClose = $(this).hasClass('btn-outline-dark');

    if (isClose) {
      $(this).removeClass('btn-outline-dark').addClass('btn-dark');
      switchSpan.text('开');
    } else {
      $(this).removeClass('btn-dark').addClass('btn-outline-dark');
      switchSpan.text('关');
    }

    window.lycoris.totast.info(`自动保存功能已${isClose ? '开启' : '关闭'}`);
  });

  title.on('input', function () {
    const val = $(this).val();
    const length = val ? val.length : 0;
    $(this).next().find('>span:first-child').text(length);
    const maxlength = parseInt($(this).attr('maxlength'));
    if (maxlength > length) {
      $(this).next().removeClass('danger');
    } else {
      $(this).next().addClass('danger');
    }
  });

  async function createCherryMarkdown() {
    markdown.busy.show('Cherry-Markdown 插件初始化中,请稍候...');

    try {
      const serverFile = Cherry.createMenuHook('网站附件', {
        iconName: 'toc', // 声明按钮的图标，空表示不显示图标直接显示文字
        onClick: function () {
          window.lycoris.events.call(
            'static-file-Modal.show',
            {
              uploadType: 2
            },
            array => {
              if (array && array.length) {
                //
                for (let item of array) {
                  let input = '\r\n';
                  if (item.fileType == 0) {
                    input += `![图片#B #S #R #60% #auto #center](${item.url})`;
                  } else if (item.fileType == 1) {
                    input += `!audio[音频#center](${item.url})`;
                  } else if (item.fileType == 2) {
                    input += `!video[视频#B #S #R #center](${item.url})`;
                  } else {
                    input += `[${item.fileName}](${item.url})`;
                  }

                  markdown.instance.insert(input);
                }
              }
            }
          );
        }
      });

      //
      const option = {
        id: 'cherry-markdown-container',
        value: '',
        editor: {
          codemirror: {
            theme: 'default'
          },
          defaultModel: 'edit&preview',
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
          theme: 'light ',
          showToolbar: true,
          toolbar: [
            'bold',
            'size',
            'color',
            'header',
            '|',
            'hr',
            'strikethrough',
            '|',
            'code',
            'link',
            'table',
            '|',
            'list',
            {
              insert: ['serverFile', 'image', 'audio', 'video', 'formula']
            },
            'graph',
            'togglePreview'
          ],
          sidebar: [],
          bubble: false,
          float: false,
          customMenu: {
            serverFile
          },
          autoScrollByHashAfterInit: true
        },
        fileUpload: async (file, callback) => {
          markdown.busy.show('文件上传中,请稍候...');
          try {
            const res = await window.lycoris.fileUpload(file, 2);
            if (res && res.resCode == 0) {
              if (res.data.fileType == 0) {
                callback(res.data.url, {
                  name: '图片',
                  isBorder: true, // 是否显示边框，默认false
                  isShadow: true, // 是否显示阴影，默认false
                  isRadius: true, // 是否显示圆角，默认false
                  width: '60%', // 图片的宽度，默认100%，可配置百分比，也可配置像素值
                  height: 'auto' // 图片的高度，默认auto
                });
              } else if (res.data.fileType == 1) {
                callback(res.data.url, {
                  name: '音频'
                });
              } else if (res.data.fileType == 2) {
                callback(res.data.url, {
                  name: '视频',
                  isBorder: true, // 是否显示边框，默认false
                  isShadow: true, // 是否显示阴影，默认false
                  isRadius: true // 是否显示圆角，默认false
                });
              } else {
                // 如果上传的是文件
                callback(res.data.url);
              }
            }
          } catch {
            //
          } finally {
            markdown.busy.hide();
          }
        },
        callback: {}
      };

      if (id) {
        const request = window.lycoris.createRequest();
        request.url = '/post/markdown';
        request.data = {
          id: id
        };
        const res = await request.get();
        if (res && res.resCode == 0) {
          option.value = res.data;
        }
      }

      return new Cherry(option);
    } finally {
      markdown.busy.hide();
    }
  }

  settingModal.find('button.folder').on('click', function () {
    window.lycoris.events.call(
      'static-file-Modal.show',
      {
        fileType: 0,
        uploadType: 0,
        multiple: false
      },
      array => {
        settingModal.find('img.icon').attr('src', array[0].url);
        settingModal.find('input[name="icon"]').val(array[0].url);
        settingModal.find('div.create-icon').removeClass('create-icon');
      }
    );
  });

  settingModal.find('select[name="infoType"]').on('change', function () {
    if ($(this).val() == 1) {
      $('textarea[name="info"]').parent().slideDown(350);
    } else {
      $('textarea[name="info"]').parent().slideUp(350);
    }
  });

  settingModal.find('.modal-footer').on('click', 'button.save', async function () {
    //
    if (id) {
      settingModal.hide();
      return;
    }

    const data = getData();
    await submit(data);
  });

  settingModal.find('textarea[name="info"]').on('input', function () {
    const text = $(this).val();
    if (text && text.length) {
      $(this).parent().find('.max-length>span:first-child').text(text.length);
    }
  });

  settingModal
    .find('select[name="category"]')
    .next()
    .find('button')
    .on('click', async function () {
      $(this).setBusy();

      try {
        const request = window.lycoris.createRequest();
        request.url = '/post/category/enum';
        const res = await request.get();
        if (res && res.resCode == 0) {
          if (res.data.list && res.data.list.length) {
            const selecter = $('select[name="category"]').bootstrapSelectpicker();
            const value = selecter.val();
            selecter.setOptions(res.data.list);
            selecter.set(value);
          }
        }
      } finally {
        $(this).clearBusy();
      }
    });

  function getData(draft = false) {
    //
    let json = {
      title: title.val(),
      markdown: markdown.instance.getMarkdown()
    };

    json.title = json.title.trimStart().trimEnd();

    Object.assign(json, settingModal.find('form').toJson() || {});

    //
    if (json.infoType == 0) {
      json.info = getMarkdownInfoText(200);
    }

    delete json.infoType;

    if (!json.tags || !json.tags.length) {
      delete json.tags;
    }

    if (!draft) {
      if (!json.markdown.trimStart().trimEnd()) {
        window.lycoris.totast.warn('文章内容不能为空');
        return void 0;
      }
    }

    json.isPublish = !draft;

    if (id) {
      json.id = id;
    }

    return json;
  }

  async function submit(data) {
    if (!data) {
      return;
    }

    try {
      //
      const request = window.lycoris.createRequest();
      request.url = '/post/save';
      request.data = {
        ...data
      };

      const res = await request.post();
      if (res && res.resCode == 0) {
        if (data.isPublish) {
          window.lycoris.totast.success('发布成功');
          setTimeout(() => {
            $('body').fadeOut(() => {
              window.parent.lycoris.multitabs.remove(location.pathname, `${window.lycoris.console}/post`);
            });
          }, 1000);
        } else {
          window.lycoris.totast.success('保存成功');
        }

        window.parent.lycoris.events.call('post.refresh');

        return res.data.id;
      }
    } finally {
      //
    }
  }

  function getMarkdownInfoText(length) {
    let re = new RegExp('<[^<>]+>', 'g');
    let html = markdown.instance.getHtml();
    let text = html.replace(re, '');
    text = text.replace(/\s*/g, '');

    if (text.length > length) {
      text = text.substring(0, length);
    }

    return text;
  }

  this.init = async () => {
    const postError = $('input[name="post-error"]').val();
    if (postError) {
      await window.lycoris.swal.error(postError);
      setTimeout(() => {
        $('body').fadeOut(() => {
          window.parent.lycoris.multitabs.remove(location.pathname, `${window.lycoris.console}/post`);
        });
      }, 1000);
    }

    //
    window.lycoris.loading.hide();

    markdown.instance = await createCherryMarkdown();

    // 标签
    $('.js-tags-input').each(function () {
      const $this = $(this);
      $this.tagsInput({
        height: $this.data('height') ? $this.data('height') : '40px',
        width: '100%',
        defaultText: $this.attr('placeholder'),
        removeWithBackspace: true,
        delimiter: [',']
      });
    });
  };

  this.init();
});
