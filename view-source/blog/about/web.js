$(function () {
  const doms = {
    cherry: void 0
  };

  function getScriptJson() {
    try {
      const jsonText = $('script[page-data]').text();
      return JSON.parse(jsonText);
    } catch (error) {
      return {};
    }
  }

  async function getWebMarkdown() {
    const request = $.createHttpRequest();
    request.url = '/home/aboutWeb/markdown';
    const res = await request.get();
    if (res && res.resCode == 0) {
      return res.data;
    } else {
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
        $('.cherry-markdown-container').find('i.ch-icon-copy').attr('title', '复制');
      }, 0);
    }
  }

  function interactive() {
    $('span[data-interactive]').each((i, el) => {
      const value = parseInt($(el).attr('data-interactive'));
      $(el).text($.formatNumber(value));
      $(el).removeClass();
    });
  }

  function category() {
    const list = getScriptJson();

    const instance = echarts.init($('#category-echarts')[0]);

    const option = {
      tooltip: {
        trigger: 'item'
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: false
            }
          },
          labelLine: {
            show: false
          },
          data: list
        }
      ]
    };

    instance.setOption(option);

    instance.on('click', function (param) {
      debugger;
    });

    return instance;
  }

  async function getWordldCloud() {
    try {
      const request = $.createHttpRequest();
      request.url = '/home/worldcloud';
      request.data = {
        pageIndex: 1,
        pageSize: 26
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        return res.data.list;
      }

      return void 0;
    } catch (error) {
      return void 0;
    }
  }

  async function wordldCloud(list) {
    if (!list || !list.length) {
      return void 0;
    }

    const instance = echarts.init($('#world-cloud-echarts')[0]);

    const colors = ['#926dde', '#f96197', '#fa8181', '#fbb264', '#48b0f7', '#15c377', '#77d2dc', '#8d6658', '#515d70'];

    for (let item of list) {
      let index = Math.floor(Math.random() * Math.floor(colors.length - 1)) + 1;
      item.textStyle = {
        color: colors[index]
      };
    }

    const option = {
      tooltip: {
        trigger: 'item',
        showDelay: 0,
        transitionDuration: 0.2,
        borderColor: '#666',
        formatter: function (params) {
          if (params.name) {
            return params.name + ' : ' + (isNaN(params.value) ? 0 : parseInt(params.value));
          }
        }
      },
      series: [
        {
          type: 'wordCloud',
          sizeRange: [15, 80],
          rotationRange: [0, 0],
          rotationStep: 45,
          gridSize: 8,
          layoutAnimation: true,
          shape: 'circle',
          width: '100%',
          height: '100%',
          textStyle: {
            normal: {
              color: function () {
                return 'rgb(' + [Math.round(Math.random() * 160), Math.round(Math.random() * 160), Math.round(Math.random() * 160)].join(',') + ')';
              },
              fontFamily: 'sans-serif',
              fontWeight: 'normal'
            },
            emphasis: {
              focus: 'self',
              textStyle: {
                textShadowBlur: 10,
                textShadowColor: '#333'
              }
            }
          },
          data: list
        }
      ]
    };

    instance.setOption(option);

    instance.on('click', function (param) {
      debugger;
    });

    return instance;
  }

  this.init = async function () {
    const list = await getWordldCloud();

    if (!list || !list.length) {
      $('div.tags-world-cloud').remove();
    }

    const markdown = await getWebMarkdown();

    createCherryMarkdown(markdown);

    window.lycoris.loading.hide();

    setTimeout(() => {
      interactive();

      const echarts = [category(), wordldCloud(list)];

      window.addEventListener('resize', function () {
        for (let i = 0; i < echarts.length; i++) {
          if (echarts[i]) {
            echarts[i].resize();
          }
        }
      });
    }, 10);
  };

  this.init();
});
