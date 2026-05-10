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

module.exports = { MessageBus };
