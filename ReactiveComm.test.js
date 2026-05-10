const { MessageBus, Observable, map, filter } = require('./ReactiveComm');

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

section('Observable — basic subscribe');
{
  const results = [];
  Observable.of(1, 2, 3).subscribe({ next: (v) => results.push(v) });
  assert(results.length === 3, 'receives all 3 values');
  assert(results[0] === 1 && results[2] === 3, 'values in correct order');
}

section('Observable — unsubscribe');
{
  const bus = new MessageBus();
  const received = [];
  const obs = Observable.fromEvent(bus, 'tick');
  const sub = obs.subscribe((v) => received.push(v));
  bus.publish('tick', 1);
  sub.unsubscribe();
  bus.publish('tick', 2);
  assert(received.length === 1, 'stops after unsubscribe');
  assert(received[0] === 1, 'received value before unsubscribe');
}

section('Observable — multiple subscribers');
{
  const bus = new MessageBus();
  const log1 = [];
  const log2 = [];
  const obs = Observable.fromEvent(bus, 'data');
  obs.subscribe((v) => log1.push(v));
  obs.subscribe((v) => log2.push(v));
  bus.publish('data', 99);
  assert(log1[0] === 99, 'subscriber 1 receives value');
  assert(log2[0] === 99, 'subscriber 2 receives independently');
}

section('Operators — map and filter');
{
  const results = [];
  Observable.of(1, 2, 3, 4, 5)
    .pipe(
      filter((v) => v % 2 === 0),
      map((v) => v * 10)
    )
    .subscribe((v) => results.push(v));

  assert(results.length === 2, 'filter keeps only even numbers');
  assert(results[0] === 20, 'map multiplies by 10: 2→20');
  assert(results[1] === 40, 'map multiplies by 10: 4→40');
}

console.log(`\n${'═'.repeat(55)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
if (failed === 0) console.log('  All tests passed! 🎉');
