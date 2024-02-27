$(function () {
  async function getTodayStatistics() {
    try {
      const reqeust = window.lycoris.createRequest();
      reqeust.url = '/dashboard/statistics/today';
      const res = await reqeust.get();
      if (res && res.resCode == 0) {
        setTodayStatistics(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function setTodayStatistics(data) {
    const statistics = $('.statistics-body');

    const pv = statistics.find('div[pv]');
    pv.find('.value').attr('data-number', data.pvBrowse);
    setPercentValue(pv.find('.percent'), data.pvBrowsePercent);

    const uv = statistics.find('div[uv]');
    uv.find('.value').attr('data-number', data.uvBrowse);
    setPercentValue(uv.find('.percent'), data.uvBrowsePercent);

    const interactive = statistics.find('div[interactive]');
    interactive.find('.value').attr('data-number', data.commentMessage);
    setPercentValue(interactive.find('.percent'), data.commentMessage);

    const elapsedMilliseconds = statistics.find('div[elapsed-milliseconds]');
    elapsedMilliseconds.find('.value').attr('data-number', data.elapsedMilliseconds);
    setPercentValue(elapsedMilliseconds.find('.percent'), data.elapsedMillisecondsDifference);

    $('p.online-user').removeClass('loading');

    if (data.onlineUsers > 0) {
      $('p.online-user').find('span.value').text(data.onlineUsers);
      $('p.online-user').addClass('online');
    }

    const animateNumberArray = [];
    statistics.find('p.value').each((i, el) => {
      const animate = animateNumber(el);
      animate.minStep = 1;
      animate.targetNumberHandle = el => {
        return parseFloat($(el).attr('data-number') || 0);
      };
      animateNumberArray.push(animate);
    });

    statistics.find('p.percent>span').each((i, el) => {
      const animate = animateNumber(el);
      animate.minStep = 1;
      animate.targetNumberHandle = el => {
        return parseFloat($(el).attr('data-number') || 0);
      };
      animateNumberArray.push(animate);
    });

    $('div.statistics')
      .find('div.loading')
      .fadeOut(300, function () {
        $(this).remove();
        animateNumberArray.forEach(x => x.paly(5000));
      });
  }

  function setPercentValue(percentEl, value, second = false) {
    if (value == 0) {
      return;
    }

    let html = `<span data-number="${value}">0</span>`;
    if (!second) {
      if (value > 0) {
        html = html.concat('<i class="mdi mdi-arrow-up-thick"></i>');
      } else if (value < 0) {
        html = html.concat('<i class="mdi mdi-arrow-down-thick"></i>');
      }
    } else {
      if (value < 0) {
        html = html.concat('<i class="mdi mdi-arrow-up-thick"></i>');
      } else if (value > 0) {
        html = html.concat('<i class="mdi mdi-arrow-down-thick"></i>');
      }
    }

    percentEl.html(html);
    percentEl.addClass(value > 0 ? 'up' : value < 0 ? 'down' : '');
  }

  async function getWorldJson() {
    try {
      const request = window.lycoris.createRequest();
      request.setBaseUrl();
      request.url = '/statics/world/world.json';
      const res = await request.get();

      return res;
    } catch (error) {
      console.error(error);
      return {};
    }
  }

  async function getWorldMapList(jsonFlag) {
    try {
      const request = window.lycoris.createRequest();
      request.url = '/dashboard/worldmap/list';
      const res = await request.get();

      if (res && res.resCode == 0) {
        const list = [];
        for (let item of res.data.list) {
          const data = {
            country: changeCountry(item.country),
            count: item.count,
            flag: ''
          };

          data.flag = jsonFlag[data.country];
          const index = list.findIndex(x => x.country == data.country);
          if (index > -1) {
            list[index].count += data.count;
            continue;
          }

          list.push(data);
        }

        list.sort((a, b) => b - a);

        return list;
      }
    } catch (error) {
      return void 0;
    }
  }

  async function echartWorldMap() {
    const el = $('#world-map');

    const instance = echarts.init(el[0], null, {
      renderer: 'canvas',
      useDirtyRect: false
    });

    const { geo, nameMap, flag } = await getWorldJson();

    if (!geo && !nameMap && !flag) {
      window.lycoris.toast.error('加载地图数据失败');
      return;
    }

    echarts.registerMap('world', geo);

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
      visualMap: {
        show: false,
        min: 0,
        max: 1000000,
        inRange: {
          color: ['#1BA3E8', '#0082C4', '#0062A1', '#004580', '#00295F']
        },
        text: ['High', 'Low'],
        calculable: true
      },
      series: [
        {
          nameMap: nameMap,
          name: 'World',
          type: 'map',
          map: 'world',
          emphasis: {
            label: {
              show: true
            }
          },
          zoom: 1.2, //地图大小
          roam: false, //禁止拖拽
          data: []
        }
      ]
    };

    instance.setOption(option);

    let mapList = await getWorldMapList(flag);
    if (!mapList) {
      mapList = [];
    }

    createWorldMapListHtml(mapList);

    instance.setOption({
      series: [
        {
          data: mapList.map(x => {
            return {
              name: x.country,
              value: x.count
            };
          })
        }
      ]
    });

    window.addEventListener('resize', instance.resize);
  }

  function createWorldMapListHtml(mapList) {
    if (!mapList || !mapList.length) {
      return;
    }

    const total = mapList.map(x => x.count).reduce((total, value) => total + value);

    const worldMapList = mapList.map(x => {
      return {
        country: x.country,
        count: x.count,
        flag: x.flag,
        percent: ((x.count / total) * 100).toFixed(2)
      };
    });

    createWorldMapHtml(worldMapList);
  }

  function createWorldMapHtml(list) {
    let html = '';
    for (let item of list) {
      html = html.concat(`
      <li class="flex-between-center">
        <div>
          <img src="/statics/flags/${item.flag}.png" />
          <span class="country">${item.country}</span>
        </div>
        <div class="flex-center-center">
          <span class="value">${item.count}</span>
          <div class="progress-bar">
              <div style="width:${item.percent}%">
              </div>
          </div>
        </div>
      </li>
      `);
    }

    $('ul.world-map').html(html);
  }

  function animateNumber(el) {
    const that = {
      el: el,
      currentNumber: 0,
      _increment: 0,
      _targetNumber: 0,
      minStep: void 0,
      complete: void 0
    };

    that.paly = (duration = 2000, targetNumber, sourceNumber) => {
      if (sourceNumber == undefined && that.sourceNumberHandle && typeof that.sourceNumberHandle == 'function') {
        that.currentNumber = that.sourceNumberHandle(that.el);
        that.currentNumber = parseFloat(that.currentNumber);
        that.currentNumber = isNaN(that.currentNumber) ? 0 : that.currentNumber;
      } else {
        that.currentNumber = sourceNumber == undefined || 0;
      }

      if (that.targetNumberHandle && typeof that.targetNumberHandle == 'function') {
        that._targetNumber = that.targetNumberHandle(that.el);
        that._targetNumber = parseFloat(that._targetNumber);
        that._targetNumber = isNaN(that._targetNumber) ? 0 : that._targetNumber;
      } else {
        that.currentNumber = targetNumber;
      }

      if (that.currentNumber < that._targetNumber) {
        // 计算每一帧的增量
        that._increment = Math.floor((that._targetNumber - that.currentNumber) / (duration / 16));
        if (that.minStep && that.minStep > that._increment) {
          that._increment = that.minStep;
        }

        // 启动动画
        animateNumber();
      }
    };

    that.sourceNumberHandle = function () {
      return parseFloat(that.el.innerText);
    };

    that.targetNumberHandle = void 0;

    // 创建动画函数
    function animateNumber() {
      // 更新当前数字
      that.currentNumber += that._increment;

      if (that.currentNumber > that._targetNumber) {
        that.currentNumber = that._targetNumber;
      }

      // 更新显示的数字
      that.el.textContent = Math.floor(that.currentNumber);

      // 如果当前数字小于目标数字，则继续动画
      if (that.currentNumber < that._targetNumber) {
        requestAnimationFrame(animateNumber);
      } else {
        if (that.complete && typeof that.complete == 'function') {
          that.complete();
        }
      }
    }

    return that;
  }

  function changeCountry(country) {
    if (country.indexOf('香港') > -1 || country.indexOf('澳门') > -1 || country.indexOf('台湾') > -1) {
      return '中国';
    }

    return country;
  }

  const browseStatistics = {
    count: 0,
    list: [],
    pageIndex: 1,
    pageSize: 15
  };

  async function getBrowseStatistics() {
    try {
      const request = window.lycoris.createRequest();
      request.url = '/dashboard/statistics/browse/list';
      request.data = {
        pageIndex: browseStatistics.pageIndex,
        pageSize: browseStatistics.pageSize
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        createBorwseHtml(res.data.list);
      }
    } catch (error) {
      console.error(error);
    } finally {
      $('div.domain-statistics')
        .find('ul[browse-statistics]')
        .next()
        .fadeOut(300, function () {
          $(this).remove();
        });
    }
  }

  function createBorwseHtml(list) {
    if (!list || !list.length) {
      return;
    }

    let html = '';

    for (let data of list) {
      html = html.concat(`
      <li class="flex-between-center">
        <span title="${data.pageName}" data-route="${data.toute}" data-page-name="${data.pageName}">${data.pageName}</span>
        <span>${data.count}</span>
      </li>
      `);
    }

    $('div.domain-statistics').find('ul[browse-statistics]').html(html);
  }

  const refererStatistics = {
    count: 0,
    list: [],
    pageIndex: 1,
    pageSize: 15
  };

  async function getRefererStatistics() {
    try {
      const request = window.lycoris.createRequest();
      request.url = '/dashboard/statistics/referer/list';
      request.data = {
        pageIndex: refererStatistics.pageIndex,
        pageSize: refererStatistics.pageSize
      };
      const res = await request.get();
      if (res && res.resCode == 0) {
        createRefererHtml(res.data.list);
      }
    } catch (error) {
      console.error(error);
    } finally {
      $('div.domain-statistics')
        .find('ul[referer-statistics]')
        .next()
        .fadeOut(300, function () {
          $(this).remove();
        });
    }
  }

  function createRefererHtml(list) {
    if (!list || !list.length) {
      return;
    }

    let html = '';

    for (let data of list) {
      html = html.concat(`
      <li class="flex-between-center">
        <span title="${data.domain}" data-referer="${data.referer}" data-domain="${data.domain}">${data.domain}</span>
        <span>${data.count}</span>
      </li>
      `);
    }

    $('div.domain-statistics').find('ul[referer-statistics]').html(html);
  }

  async function getUserAgentStatistics() {
    try {
      const request = window.lycoris.createRequest();
      request.url = '/dashboard/statistics/useragent/list';
      const res = await request.get();
      if (res && res.resCode == 0) {
        //
        for (let key in res.data) {
          createUserAgentHtml(key, res.data[key]);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      $('div.other-statistics')
        .find('div.line-loading-preloader')
        .fadeOut(300, function () {
          $(this).remove();
        });
    }
  }

  async function createUserAgentHtml(selector, list) {
    if (!list || !list.length) {
      return;
    }

    selector = selector.toLocaleLowerCase();

    let iconPath = selector == 'browseclient' ? 'browser' : selector == 'os' ? 'os' : 'device';
    let mdiIcon = selector == 'browseclient' ? 'mdi-web' : selector == 'os' ? 'mdi-hexagon-multiple' : 'mdi-devices';

    let html = '';
    for (let item of list) {
      let img = item.icon ? `<img src="/statics/icon/${iconPath}/${item.icon}" />` : `<span class="mdi ${mdiIcon}"></span>`;

      html = html.concat(`
      <li class="flex-between-center">
        <div>
          ${img}
          <span>${item.name}</span>
        </div>
        <span>${item.count}</span>
      </li>
      `);
    }

    $(`ul[${selector}-statistics]`).html(html);
  }

  this.init = function () {
    getTodayStatistics();

    echartWorldMap();

    window.lycoris.loading.hide();

    getBrowseStatistics();

    getRefererStatistics();

    getUserAgentStatistics();
  };

  this.init();
});
