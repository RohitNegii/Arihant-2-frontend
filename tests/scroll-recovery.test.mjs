import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const loadDependency = createRequire(import.meta.url);

function load(path, mocks, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, require: name => name in mocks ? mocks[name] : loadDependency(name), ...globals,
  });
  return exports;
}

function loader() {
  const flags = { ready: false, complete: false };
  const states = [], effects = [], timers = new Map();
  let now = 0, id = 0;
  const schedule = (fn, delay) => { timers.set(++id, { fn, at: now + delay }); return id; };
  let completed = () => {};
  const component = load('src/components/LoadingScreen.tsx', {
    react: {
      useState: initial => {
        const index = states.length;
        states.push(typeof initial === 'function' ? initial() : initial);
        return [states[index], value => { states[index] = typeof value === 'function' ? value(states[index]) : value; }];
      },
      useEffect: fn => effects.push(fn),
    },
    'framer-motion': { motion: { div: 'div' }, AnimatePresence: 'div' },
    '@/components/global/CrestMark': { default: () => null },
    '@/hooks/useScrollLock': { useScrollLock: () => {} },
    '@/components/3d/scene-ready': {
      isSceneReady: () => flags.ready,
      setSceneRevealed: () => {},
      onSceneReady: fn => { if (flags.ready) fn(); return () => {}; },
    },
    '@/components/3d/preload': {
      fullPreload: () => true,
      isPreloadComplete: () => flags.complete,
      markPreloadComplete: () => { flags.complete = true; completed(); },
      onPreloadComplete: fn => { completed = fn; if (flags.complete) fn(); return () => { completed = () => {}; }; },
      onPreloadProgress: () => () => {}, preloadAssets: () => Promise.resolve(), preloadProgress: () => 0,
    },
  }, {
    performance: { now: () => now },
    setTimeout: schedule, clearTimeout: id => timers.delete(id),
    setInterval: schedule, clearInterval: id => timers.delete(id),
  }).default;
  component();
  return { flags, states, mount: () => effects.map(fn => fn()), advance(time) {
    const end = now + time;
    for (;;) {
      const next = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      now = next[1].at; timers.delete(next[0]); next[1].fn();
    }
    now = end;
  } };
}

test('return-home readiness race clears the blocking loader', () => {
  const app = loader();
  assert.equal(app.states[1], false);
  app.flags.ready = app.flags.complete = true;
  app.mount(); app.advance(1);
  assert.equal(app.states[1], true);
});

test('loader deadline releases UI even if WebGL never reports ready', () => {
  const app = loader(); app.mount(); app.advance(41000);
  assert.equal(app.flags.ready, false);
  assert.equal(app.states[1], true);
});

test('leaving home cancels pending loader completion', () => {
  const app = loader();
  app.flags.ready = app.flags.complete = true;
  app.mount().forEach(cleanup => cleanup?.()); app.advance(41000);
  assert.equal(app.states[1], false);
});

test('overlapping overlays restore scrolling only after the final cleanup', () => {
  function element() {
    const values = new Map([['overflow-y', 'scroll']]);
    return { style: { getPropertyValue: key => values.get(key) || '', getPropertyPriority: () => '',
      setProperty: (key, value) => values.set(key, value), removeProperty: key => values.delete(key) } };
  }
  const html = element(), body = element();
  let stopped = false;
  const { acquireScrollLock } = load('src/hooks/useScrollLock.ts', {
    react: { useEffect: () => {} },
    '@/store/scroll-store': { useScrollStore: { getState: () => ({ lenis: { stop: () => { stopped = true; }, start: () => { stopped = false; } } }) } },
  }, { document: { documentElement: html, body } });
  const closeMenu = acquireScrollLock(), closeLoader = acquireScrollLock();
  closeMenu(); closeMenu();
  assert.equal(stopped, true);
  assert.equal(html.style.getPropertyValue('overflow-y'), 'hidden');
  closeLoader();
  assert.equal(stopped, false);
  assert.equal(html.style.getPropertyValue('overflow-y'), 'scroll');
  assert.equal(body.style.getPropertyValue('overflow-y'), 'scroll');
});
