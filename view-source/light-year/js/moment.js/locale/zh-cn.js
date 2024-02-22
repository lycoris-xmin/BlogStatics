!(function (e, d) {
  'object' == typeof exports && 'undefined' != typeof module && 'function' == typeof require ? d(require('../moment')) : 'function' == typeof define && define.amd ? define(['../moment'], d) : d(e.moment);
})(this, function (e) {
  'use strict';
  return e.defineLocale('zh-cn', {
    months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
    monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
    weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
    weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
    weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
    longDateFormat: {
      LT: 'HH:mm',
      LTS: 'HH:mm:ss',
      L: 'YYYY/MM/DD',
      LL: 'YYYY年M月D日',
      LLL: 'YYYY年M月D日Ah点mm分',
      LLLL: 'YYYY年M月D日ddddAh点mm分',
      l: 'YYYY/M/D',
      ll: 'YYYY年M月D日',
      lll: 'YYYY年M月D日 HH:mm',
      llll: 'YYYY年M月D日dddd HH:mm'
    },
    meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
    meridiemHour: function (e, d) {
      return 12 === e && (e = 0), '凌晨' === d || '早上' === d || '上午' === d || ('下午' !== d && '晚上' !== d && 11 <= e) ? e : e + 12;
    },
    meridiem: function (e, d, t) {
      var _ = 100 * e + d;
      return _ < 600 ? '凌晨' : _ < 900 ? '早上' : _ < 1130 ? '上午' : _ < 1230 ? '中午' : _ < 1800 ? '下午' : '晚上';
    },
    calendar: { sameDay: '[今天]LT', nextDay: '[明天]LT', nextWeek: '[下]ddddLT', lastDay: '[昨天]LT', lastWeek: '[上]ddddLT', sameElse: 'L' },
    dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
    ordinal: function (e, d) {
      switch (d) {
        case 'd':
        case 'D':
        case 'DDD':
          return e + '日';
        case 'M':
          return e + '月';
        case 'w':
        case 'W':
          return e + '周';
        default:
          return e;
      }
    },
    relativeTime: { future: '%s后', past: '%s前', s: '几秒', ss: '%d 秒', m: '1 分钟', mm: '%d 分钟', h: '1 小时', hh: '%d 小时', d: '1 天', dd: '%d 天', M: '1 个月', MM: '%d 个月', y: '1 年', yy: '%d 年' },
    week: { dow: 1, doy: 4 }
  });
});
