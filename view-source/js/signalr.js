$(function () {
  $.createSignalR = function (url, isDebugger = false) {
    const _connectdCallback = [];
    const _subscribeHandler = [];

    if (isDebugger == void 0 || typeof isDebugger != 'boolean') {
      isDebugger = false;
    }

    const that = this;

    this.instance = void 0;

    this.connect = async function () {
      await that.instance.start();
    };

    this.disconnect = async function () {
      if (!that.instance) {
        return;
      }

      await that.instance.stop();
    };

    this.on = function (eventName, callback) {
      let data = {
        eventName,
        callback,
        subscribe: false
      };

      // 获取现有的订阅列表中该渠道名的数据索引
      let index = _subscribeHandler.findIndex(x => x.eventName == data.eventName);

      if (index == -1) {
        // 不存在该渠道名，则添加至订阅列表中
        _subscribeHandler.push(data);
        // 重新赋值数据索引
        index = _subscribeHandler.findIndex(x => x.eventName == data.eventName);
      } else {
        // 已存在的数据索引，则覆盖
        _subscribeHandler[index] = data;
      }

      // 如果当前实例未连接
      if (!that.instance) {
        // 则将当前订阅设置为未连接
        _subscribeHandler[index].subscribe = false;
        return;
      } else {
        // 订阅当前渠道
        that.instance.on(_subscribeHandler[index].eventName, _subscribeHandler[index].callback);
        // 订阅后，将订阅状态改为 true
        _subscribeHandler[index].subscribe = true;
      }
    };

    this.unbind = function (eventName) {
      if (!that.instance) {
        console.error('signalR disconnect');
        return;
      }

      let index = _subscribeHandler.findIndex(x => x.eventName == eventName);
      if (index > -1) {
        _subscribeHandler.splice(index, 1);
        that.instance.off(eventName);
      }
    };

    this.call = async function (methodName, ...args) {
      if (!that.instance) {
        throw new Error('signalR disconnect');
      }

      await that.instance.invoke(methodName, ...args);
    };

    this.connectdHadler = function (callback) {
      if (that.instance != null) {
        callback();
      } else {
        _connectdCallback.push(callback);
      }
    };

    _init = function () {
      that.instance = new signalR.HubConnectionBuilder()
        .withUrl(url)
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.previousRetryCount > 15) {
              return 90000;
            } else if (retryContext.previousRetryCount > 10) {
              return 60000;
            } else if (retryContext.previousRetryCount > 3) {
              return 30000;
            } else {
              return 3000;
            }
          }
        })
        .configureLogging(isDebugger ? signalR.LogLevel.Information : signalR.LogLevel.Error)
        .build();

      // 实例连接上后，需要重新将原有的监听重新续上
      that.instance.onreconnected(() => {
        if (_subscribeHandler.length > 0) {
          for (let item of _subscribeHandler) {
            that.on(item.eventName, item.callback);
          }
        }
      });
    };

    _init();

    return this;
  };
});
