const EventEmitter = require('events');

class MessageBus extends EventEmitter {
  constructor() {
    super();
    this._history = [];
  }

  publish(event, data) {
    const message = { event, data, timestamp: Date.now() };
    this._history.push(message);
    this.emit(event, data);
  }

  subscribe(event, listener) {
    this.on(event, listener);
    return () => this.unsubscribe(event, listener);
  }

  unsubscribe(event, listener) {
    this.off(event, listener);
  }

  getHistory() {
    return [...this._history];
  }
}

class Observable {
  constructor(subscribeFn) {
    this._subscribeFn = subscribeFn;
  }

  subscribe(observer) {
    if (typeof observer === 'function') {
      observer = { next: observer };
    }

    const safeObserver = {
      next: observer.next || (() => {}),
      error: observer.error || ((e) => { throw e; }),
      complete: observer.complete || (() => {}),
    };

    let unsubscribed = false;
    let cleanup;

    const subscription = {
      unsubscribe() {
        unsubscribed = true;
        if (cleanup) cleanup();
      }
    };

    const wrappedObserver = {
      next(value) { if (!unsubscribed) safeObserver.next(value); },
      error(err)  { if (!unsubscribed) safeObserver.error(err); },
      complete()  { if (!unsubscribed) safeObserver.complete(); },
    };

    cleanup = this._subscribeFn(wrappedObserver);
    return subscription;
  }

  pipe(...operators) {
    return operators.reduce((obs, op) => op(obs), this);
  }

  static fromEvent(emitter, event) {
    return new Observable((observer) => {
      const handler = (data) => observer.next(data);
      emitter.on(event, handler);
      return () => emitter.off(event, handler);
    });
  }

  static of(...values) {
    return new Observable((observer) => {
      values.forEach((v) => observer.next(v));
      observer.complete();
    });
  }
}

function map(fn) {
  return (source) => new Observable((observer) => {
    const sub = source.subscribe({
      next: (value) => observer.next(fn(value)),
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => sub.unsubscribe();
  });
}

function filter(predicate) {
  return (source) => new Observable((observer) => {
    const sub = source.subscribe({
      next: (value) => { if (predicate(value)) observer.next(value); },
      error: (err) => observer.error(err),
      complete: () => observer.complete(),
    });
    return () => sub.unsubscribe();
  });
}

module.exports = { MessageBus, Observable, map, filter };
