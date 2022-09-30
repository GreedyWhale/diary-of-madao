/*
 * @Description: event hub
 * @Author: MADAO
 * @Date: 2022-09-30 15:49:53
 * @LastEditors: MADAO
 * @LastEditTime: 2022-09-30 15:56:45
 */
export type EventHandler = (..._args: any[]) => void;

class EventHub {
  private eventPool: Record<string, EventHandler[]>;

  constructor() {
    this.eventPool = {};
  }

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
}

export default new EventHub();
