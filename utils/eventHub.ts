/*
 * @Description: 事件中心
 * @Author: MADAO
 * @Date: 2021-07-24 15:44:59
 * @LastEditors: MADAO
 * @LastEditTime: 2021-07-24 15:48:43
 */

export type EventHandler = (..._args: any[]) => void;

class EventHub {
  private eventPool: {
    [key: string]: EventHandler[];
  };

  public on(eventName: string, handler: EventHandler) {
    if (!this.eventPool[eventName]) {
      this.eventPool[eventName] = [];
    }

    this.eventPool[eventName].push(handler);
    return handler;
  }

  public emit(eventName: string, ...args: any[]) {
    if (!this.eventPool[eventName]) {
      return;
    }

    this.eventPool[eventName].forEach(handler => {
      handler(...args);
    });
  }

  public off(eventName: string, handler?: EventHandler) {
    if (!this.eventPool[eventName]) {
      return;
    }

    if (handler) {
      this.eventPool[eventName] = this.eventPool[eventName].filter(fn => fn !== handler);
      return;
    }

    delete this.eventPool[eventName];
  }

  public clear(eventName: string) {
    delete this.eventPool[eventName];
  }

  constructor() {
    this.eventPool = {};
  }
}

export default new EventHub();
