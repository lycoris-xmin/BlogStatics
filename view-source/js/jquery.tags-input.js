$(function () {
  $.fn.jqueryTagInput = function (option) {
    const that = this;
    let tagsBody = function () {
      tagsBody = $(that).next('.tagsinput');
    };

    option = option || {
      minChars: 0,
      maxChars: 0,
      maxTags: 10,
      width: '100%'
    };

    let defaultOption = {
      height: that.data('height') ? that.data('height') : '40px',
      width: '100%',
      interactive: true,
      defaultText: that.attr('placeholder') || '请输入标签',
      removeWithBackspace: true,
      delimiter: [','],
      minChars: 0,
      maxChars: 0,
      placeholderColor: '#666666',
      onAddTag: function () {
        if (option.maxTags > 0) {
          const tags = tagsBody.find('span.tag');
          if (tags.length > option.maxTags) {
            $(tags[tags.length - 1])
              .find('a')
              .trigger('click');

            setTimeout(() => {
              tagsBody.find('input').focus();
            }, 0);

            if (that.maxLimit && typeof that.maxLimit == 'function') {
              that.maxLimit();
            }

            if (option.maxLimit && typeof option.maxLimit == 'function') {
              option.maxLimit();
            }
          }

          return;
        }

        if (that.onAdd && typeof that.onAdd == 'function') {
          that.onAdd();
        }

        if (option.onAdd && typeof option.onAdd == 'function') {
          option.onAdd();
        }
      },
      onRemoveTag: function () {
        if (that.onRemove && typeof that.onRemove == 'function') {
          that.onRemove();
        }

        if (option.onRemove && typeof option.onRemove == 'function') {
          option.onRemove();
        }
      },
      onChange: function () {
        if (that.onChange && typeof that.onChange == 'function') {
          that.onChange();
        }

        if (option.onChange && typeof option.onChange == 'function') {
          option.onChange();
        }
      }
    };

    this.add = function () {
      if (arguments.length) {
        if (arguments.length > 1) {
          for (let item of arguments) {
            $(that).addTag(item);
          }
        } else {
          if (Array.isArray(arguments[1])) {
            $(that).importTags(arguments[1].join(','));
          } else if (typeof arguments[1] == 'string') {
            if (arguments[1].indexOf(',') > -1) {
              $(that).importTags(arguments[1]);
            } else {
              $(that).addTag(arguments[1]);
            }
          }
        }
      }
    };

    this.set = function (arg) {
      if (arg) {
        if (Array.isArray(arg)) {
          $(that).importTags(arg.join(','));
        } else if (typeof arg == 'string') {
          if (arg.indexOf(',') > -1) {
            $(that).importTags(arg);
          } else {
            $(that).addTag(arg);
          }
        }
      } else {
        $(that).importTags('');
      }
    };

    this.tagExist = function (val) {
      return new Promise((resolve, reject) => {
        try {
          if ($(that).tagExist(val)) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          reject(error);
        }
      });
    };

    this.onAdd = void 0;

    this.onRemove = void 0;

    this.onChange = void 0;

    this.maxLimit = void 0;

    this.init = function () {
      option.minChars = parseInt(option.minChars);
      if (!isNaN(option.minChars)) {
        defaultOption.minChars = option.minChars;
      }

      option.maxChars = parseInt(option.maxChars);
      if (!isNaN(option.maxChars)) {
        defaultOption.maxChars = option.maxChars;
      }

      $(that).tagsInput(defaultOption);

      tagsBody();
    };

    this.init();

    return this;
  };
});
