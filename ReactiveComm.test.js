const { MessageBus } = require('./ReactiveComm');

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else {
    console.error(`  ❌  ${label}`);
    failed++;
  }
}

function section(title) {
  console.log(`\n── ${title} ${'─'.repeat(50 - title.length)}`);
}

section('MessageBus — subscribe/publish');
{
  const bus = new MessageBus();
  const received = [];

  bus.subscribe('msg', (data) => received.push(data));
  bus.publish('msg', 'hello');
  bus.publish('msg', 'world');

  assert(received.length === 2, 'receives 2 messages');
  assert(received[0] === 'hello', 'first message is "hello"');
  assert(received[1] === 'world', 'second message is "world"');
}

section('MessageBus — unsubscribe');
{
  const bus = new MessageBus();
  const received = [];

  const unsub = bus.subscribe('msg', (data) => received.push(data));
  bus.publish('msg', 'before');
  unsub();
  bus.publish('msg', 'after');

  assert(received.length === 1, 'stops receiving after unsubscribe');
  assert(received[0] === 'before', 'received message before unsubscribe');
}

section('MessageBus — multiple listeners');
{
  const bus = new MessageBus();
  const log1 = [];
  const log2 = [];

  bus.subscribe('event', (d) => log1.push(d));
  bus.subscribe('event', (d) => log2.push(d));
  bus.publish('event', 42);

  assert(log1[0] === 42, 'listener 1 receives event');
  assert(log2[0] === 42, 'listener 2 receives event independently');
}

section('MessageBus — history');
{
  const bus = new MessageBus();
  bus.publish('a', 1);
  bus.publish('b', 2);

  const history = bus.getHistory();
  assert(history.length === 2, 'history has 2 entries');
  assert(history[0].event === 'a', 'first history entry is event "a"');
  assert(history[1].data === 2, 'second history entry has data 2');
}

console.log(`\n${'═'.repeat(55)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('  All tests passed! 🎉');
