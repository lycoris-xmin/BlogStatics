$(function () {
  $.createHttpRequest = function () {
    const that = this;
    const _supportFetch = typeof window.fetch === 'function';
    let _baseUrl = `${window.lycoris ? window.lycoris.console || '' : ''}/`;

    this.url = '';
    this.timeout = 60000;
    this.headers = {};
    this.data = {};
    this.formData = void 0;

    this.setBaseUrl = url => {
      _baseUrl = url || '';
    };

    this.get = function () {
      return new Promise((resolve, reject) => {
        let option = {
          url: _getUrl(),
          type: 'GET'
        };

        if (that.data && Object.keys(that.data).length > 0) {
          option.data = { ...that.data };
        }

        _request(
          option,
          resp => {
            resolve(resp);
          },
          err => {
            reject(err);
          }
        );
      });
    };

    this.post = function (files) {
      return new Promise((resolve, reject) => {
        let option = {
          url: _getUrl(),
          type: 'POST'
        };

        if (that.data && Object.keys(that.data).length > 0) {
          option.data = { ...that.data };
        } else if (that.formData) {
          option.formData = objectToFormData(that.formData);
        }

        if (files) {
          if (Array.isArray(files) && files.length) {
            for (let i = 0; i < files.length; i++) {
              option.formData.append(`file[${i}]`, files[i]);
            }
          } else if (Object.keys(files).length) {
            for (let key in files) {
              option.formData.append(key, files[key]);
            }
          }
        }

        _request(
          option,
          resp => {
            resolve(resp);
          },
          err => {
            reject(err);
          }
        );
      });
    };

    this.interceptors = {
      request: option => {
        option.headers['X-Timestamp'] = +new Date();
        return option;
      },
      response: async option => {
        try {
          if (option.response.status == 200) {
            const json = option.response.json();

            if (!json) {
              window.lycoris.totast.error('请求失败');
              return;
            }

            if (json.resCode == -99) {
              window.lycoris.totast.warn(json.resMsg || '请求失败');
              return;
            }

            if (json.resCode == -21) {
              window.lycoris.totast.warn('登录过期，请重新登录');
              setTimeout(() => {
                const loginPath = `${window.lycoris.console}/authentication/login`;
                if (window.top == window.self) {
                  location.href = loginPath;
                } else {
                  window.parent.location.href = loginPath;
                }
              }, 1000);
              return;
            }
          }
        } catch (error) {
          debugger;
        }
      }
    };

    function _getUrl() {
      const url = `${_baseUrl}${that.url.startsWith('/') ? that.url.replace('/', '') : that.url}`;
      if (url.startsWith('/')) {
        return url;
      }

      return `/${url}`;
    }

    function _request() {
      if (_supportFetch) {
        _request = async function (option, success, error) {
          option.headers = option.headers || {};

          if (that.headers && Object.keys(that.headers).length > 0) {
            Object.assign(option.headers, { ...that.headers });
          }

          if (that.interceptors.request && typeof that.interceptors.request == 'function') {
            option = await that.interceptors.request(option);
          }

          let config = {
            method: option.type,
            headers: option.headers
          };

          if (config.method == 'GET') {
            if (option.data) {
              const paramsArray = [];
              Object.keys(option.data).forEach(key => paramsArray.push(`${key}=${option.data[key]}`));
              option.url += `${option.url.search(/\?/) === -1 ? '?' : '&'}${paramsArray.join('&')}`;
            }
          } else if (config.method == 'POST') {
            if (option.data && Object.keys(option.data).length) {
              if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
              }
              config.body = JSON.stringify(option.data);
            } else if (option.formData) {
              config.body = option.formData;
            }
          }

          fetch(option.url, config)
            .then(async resp => {
              const json = await resp.json();
              if (that.interceptors.response && typeof that.interceptors.response == 'function') {
                const opt = {
                  response: {
                    status: resp.status,
                    json: () => {
                      return json;
                    }
                  },
                  request: { option: { ...option }, success, error }
                };

                await that.interceptors.response(opt);
              }

              success(json);
            })
            .catch(async err => {
              if (that.interceptors.response && typeof that.interceptors.response == 'function') {
                const opt = {
                  response: {},
                  error: { ...err },
                  request: { option: { ...option }, success, error }
                };

                await that.interceptors.response(opt);
              }

              error(err);
            });
        };
      } else {
        _request = async function (option, success, error) {
          option.headers = option.headers || {};

          if (that.headers && Object.keys(that.headers).length > 0) {
            Object.assign(option.headers, { ...that.headers });
          }

          option.timeout = that.timeout;
          option.dataType = 'json';

          if (that.interceptors.request && typeof that.interceptors.request == 'function') {
            option = await that.interceptors.request(option);
          }

          if (option.type == 'GET') {
            if (option.data) {
              const paramsArray = [];
              Object.keys(option.data).forEach(key => paramsArray.push(`${key}=${option.data[key]}`));
              option.url += `${option.url.search(/\?/) === -1 ? '?' : '&'}${paramsArray.join('&')}`;
            }
          } else if (option.type == 'POST') {
            if (!option.contentType) {
              option.contentType = 'application/json';
            }
            if (option.data && Object.keys(option.data).length) {
              option.data = JSON.stringify(option.data);
            } else if (option.formData) {
              option.contentType == false;
              option.processData = false;
              option.cache = false;
              option.data = option.formData;
            }
          }

          $.ajax({
            ...option,
            success: async function (resp, textStatus, jqXHR) {
              if (that.interceptors.response && typeof that.interceptors.response == 'function') {
                const opt = {
                  response: {
                    ...jqXHR,
                    json: () => {
                      return resp;
                    }
                  },
                  request: { option: { ...option }, success, error }
                };

                await that.interceptors.response(opt);
              }

              success(resp);
            },
            error: async function (jqXHR, textStatus, errorThrown) {
              if (that.interceptors.response && typeof that.interceptors.response == 'function') {
                const opt = {
                  response: { ...jqXHR },
                  error: { ...err },
                  request: { option: { ...option }, success, error }
                };

                await that.interceptors.response(opt);
              }

              error(err);
            }
          });
        };
      }
    }

    function objectToFormData(obj, parentKey) {
      let formData = new FormData();

      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          var value = obj[key];
          var formKey = parentKey ? `${parentKey}[${key}]` : key;

          if (Array.isArray(value)) {
            for (var i = 0; i < value.length; i++) {
              if (typeof value[i] == 'object') {
                debugger;
                objectToFormData(value[i], formData, `${formKey}[${i}]`);
              } else {
                formData.append(`${formKey}[${i}]`, value[i]);
              }
            }
          } else if (typeof value === 'object' && !(value instanceof Blob)) {
            objectToFormData(value, formData, formKey);
          } else {
            formData.append(formKey, value);
          }
        }
      }

      return formData;
    }

    _request();

    return this;
  };
});
