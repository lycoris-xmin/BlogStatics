$(function () {
  const markdown = {
    instance: void 0,
    busy: $('div.card-body').busy()
  };

  const button = {
    save: $('.card-header').find('button.btn-info'),
    close: $('.card-header').find('button.btn-secondary')
  };

  const model = {
    markdown: ''
  };

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
            const res = await window.lycoris.fileUpload(file, 20);
            if (res && res.resCode == 0) {
              if (res.data.fileType == 0) {
                callback(res.data.url, {
                  name: '图片',
                  isBorder: true,
                  isShadow: true,
                  isRadius: true,
                  width: '60%',
                  height: 'auto'
                });
              } else if (res.data.fileType == 1) {
                callback(res.data.url, {
                  name: '音频'
                });
              } else if (res.data.fileType == 2) {
                callback(res.data.url, {
                  name: '视频',
                  isBorder: true,
                  isShadow: true,
                  isRadius: true
                });
              } else {
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

      option.value = await getMarkdown();
      model.markdown = option.value;

      return new Cherry(option);
    } finally {
      markdown.busy.hide();
    }
  }

  async function getMarkdown() {
    try {
      const reqeust = window.lycoris.createRequest();
      reqeust.url = '/about/web/markdown';
      const res = await reqeust.get();
      if (!res || res.resCode != 0) {
        return '';
      }

      return res.data || '';
    } catch (error) {
      return '';
    }
  }

  button.save.on('click', async function () {
    const content = markdown.instance.getMarkdown();
    if (!content) {
      window.lycoris.totast.warn('内容不能为空');
      return;
    }

    if (content == model.markdown) {
      window.lycoris.totast.success('保存成功');
      return;
    }

    $(this).setBusy();

    try {
      const request = window.lycoris.createRequest();
      request.url = '/about/web/save';
      request.data = {
        value: content
      };
      const res = await request.post();
      if (res && res.resCode == 0) {
        window.lycoris.totast.success('保存成功');
        model.markdown = content;
      }
    } finally {
      $(this).clearBusy();
    }
  });

  button.close.on('click', function () {
    $('body').fadeOut(() => {
      window.parent.lycoris.multitabs.remove(location.pathname);
    });
  });

  this.init = async function () {
    window.lycoris.loading.hide();
    markdown.instance = await createCherryMarkdown();
  };

  this.init();
});
