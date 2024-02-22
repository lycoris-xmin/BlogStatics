$(function () {
  $.fn.blogModal = function (opt) {
    const that = this;
    const dialog = $(this).find('.modal-dialog');
    const option = {
      backdrop: true,
      mousedownTarget: false,
      mouseupTarget: false
    };

    this.show = function () {
      $(this).fadeIn(200, () => {
        dialog.fadeIn(200);
      });
    };

    this.hide = function () {
      $(this).fadeOut(300, () => {
        dialog.fadeOut(100);
      });
    };

    _init = function () {
      opt = opt || {};
      if (opt.backdrop != void 0 && typeof opt.backdrop == 'boolean') {
        option.backdrop = opt.backdrop;
      }

      $('div.modal').each((i, el) => {
        const index = (i + 1) * 10 + 1000;
        $(el).css('z-index', index);
        $(el)
          .find('.modal-dialog')
          .css('z-index', index + 1);
      });

      $(that).on('click', function () {
        if (option.backdrop) {
          if (option.mousedownTarget && option.mouseupTarget) {
            that.hide();
          }
        }

        option.mousedownTarget = option.mouseupTarget = false;
      });

      $(that).on('mousedown', function (e) {
        option.mousedownTarget = e.target === e.currentTarget;
      });

      $(that).on('mouseup', function (e) {
        option.mouseupTarget = e.target === e.currentTarget;
      });

      dialog.on('click', function (e) {
        e.stopPropagation();
      });

      dialog
        .find('.modal-header')
        .find('.mdi-close')
        .on('click', function () {
          that.hide();
        });

      dialog.find('button[close]').on('click', function () {
        that.hide();
      });
    };

    _init();

    return this;
  };

  $.indexDb = function (databaseName, storeName) {
    _databaseName = databaseName;
    _storeName = storeName;

    this.db = void 0;

    this.openDatabase = async function () {
      if (!window.indexedDB) {
        throw new Error('IndexedDB is not supported in this browser.');
      }

      return new Promise((resolve, reject) => {
        let request = indexedDB.open(_databaseName, 1);

        request.onerror = () => {
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onupgradeneeded = event => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(_storeName)) {
            db.createObjectStore(_storeName, { keyPath: 'id' });
          }
        };
      });
    };

    this.getData = async function (id) {
      return new Promise((resolve, reject) => {
        this.openDatabase().then(db => {
          const tx = db.transaction(_storeName, 'readonly');
          const store = tx.objectStore(_storeName);
          const request = store.get(id);

          request.onsuccess = function () {
            resolve(request.result);
          };

          request.onerror = function () {
            reject();
          };
        });
      }).catch(err => {
        reject(err);
      });
    };

    this.create = async function (data) {
      const db = await this.openDatabase();
      const tx = db.transaction(_storeName, 'readwrite');
      const store = tx.objectStore(_storeName);

      if (!data.id) {
        data.id = +new Date();
      }

      const id = await store.add(data);
      await tx.complete;
      return id;
    };

    this.update = async function (data) {
      const db = await this.openDatabase();
      const tx = db.transaction(_storeName, 'readwrite');
      const store = tx.objectStore(_storeName);
      await store.put(data);
      await tx.complete;
    };

    this.delete = async function () {
      const db = await this.openDatabase();
      const tx = db.transaction(_storeName, 'readwrite');
      const store = tx.objectStore(_storeName);
      await store.delete(id);
      await tx.complete;
    };

    this.query = async function (condition) {
      const db = await this.openDatabase();
      const tx = db.transaction(_storeName, 'readonly');
      const store = tx.objectStore(_storeName);
      const request = store.openCursor();

      let results = [];

      return new Promise((resolve, reject) => {
        request.onsuccess = event => {
          const cursor = event.target.result;

          if (cursor) {
            const data = cursor.value;

            // 根据条件过滤数据
            if (_checkCondition(data, condition)) {
              results.push(data);
            }

            cursor.continue();
          } else {
            resolve(results);
          }
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    };

    function _checkCondition(data, condition) {
      if (!condition) {
        return true;
      } else if (typeof condition != 'function') {
        return true;
      }

      return condition(data);
    }

    return this;
  };
});
