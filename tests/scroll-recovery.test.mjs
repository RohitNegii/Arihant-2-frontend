import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const dependency = createRequire(import.meta.url);
function load(path, mocks, globals = {}) {
  const code = ts.transpileModule(fs.readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, {
    exports, require: name => name in mocks ? mocks[name] : dependency(name), ...globals,
  });
  return exports;
}

const flush = () => new Promise(resolve => setImmediate(resolve));
function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

// Run the real host's effects across routes, including in-flight preparation.
function showroom() {
  let pathname = '/products', cursor = 0, mediaCalls = 0, textureCalls = 0;
  const hooks = [], pending = [];
  const media = deferred(), textures = deferred();
  const state = { menuOpen: false, navigationFrom: null, running: false,
    endNavigation: () => { state.navigationFrom = null; },
    setRunning: value => { state.running = value; } };
  const store = selector => selector(state);
  store.getState = () => state;
  const component = load('src/components/ShowroomHost.tsx', {
    react: {
      useState(initial) {
        const index = cursor++;
        hooks[index] ??= { value: initial };
        return [hooks[index].value, value => { hooks[index].value = value; }];
      },
      useEffect(fn, deps) {
        const index = cursor++;
        const previous = hooks[index];
        if (!previous || deps.some((value, i) => !Object.is(value, previous.deps[i]))) {
          pending.push(() => {
            previous?.cleanup?.();
            hooks[index] = { deps, cleanup: fn() };
          });
        }
      },
    },
    'next/dynamic': { default: () => function Canvas() {} },
    'next/navigation': { usePathname: () => pathname },
    '@/content/home-media': { loadHomeMedia: () => { mediaCalls++; return media.promise; } },
    './3d/preload': { preloadTextures: () => { textureCalls++; return textures.promise; } },
    '@/store/showroom-store': { useShowroomStore: store },
    '@/store/authStore': { useAuthStore: selector => selector({ showAuthModal: false }) },
    '@/store/cartStore': { useCartStore: selector => selector({ isCartOpen: false }) },
    '@/store/scroll-store': { sceneInteraction: { hovered: false, focused: false } },
  }, { document: { hidden: false, addEventListener() {}, removeEventListener() {} },
    window: { addEventListener() {}, removeEventListener() {} }, AbortController, setTimeout, clearTimeout }).default;
  return { state, media, textures,
    render(route = pathname) {
      pathname = route; cursor = 0;
      const output = component();
      pending.splice(0).forEach(run => run());
      return output;
    },
    get mediaCalls() { return mediaCalls; },
    get textureCalls() { return textureCalls; },
  };
}

test('opening products directly does not initialize the hidden showroom', async () => {
  const app = showroom();
  assert.equal(app.render(), null);
  await flush();
  assert.equal(app.mediaCalls, 0);
  assert.equal(app.textureCalls, 0);
});

test('leaving home while the manifest loads cancels scene initialization', async () => {
  const app = showroom();
  assert.equal(app.render('/'), null);
  app.render('/products'); app.media.resolve(); await flush();
  assert.equal(app.render(), null);
  assert.equal(app.textureCalls, 0);
});

test('leaving during preparation cannot mount a hidden canvas; returning retries', async () => {
  const app = showroom();
  app.render('/'); app.media.resolve(); await flush();
  assert.equal(app.textureCalls, 1);
  app.render('/products'); app.textures.resolve(); await flush();
  assert.equal(app.render(), null);
  app.render('/'); await flush();
  assert.ok(app.render());
});

test('returning from products retains the prepared canvas and resumes rendering', async () => {
  const app = showroom();
  app.render('/'); app.media.resolve(); app.textures.resolve(); await flush();
  const home = app.render();
  assert.equal(home.props.children.props.running, true);
  const products = app.render('/products');
  assert.equal(products.props.children.type, home.props.children.type);
  assert.equal(products.props.children.props.running, false);
  assert.equal(products.props.inert, true);
  const returned = app.render('/');
  assert.equal(returned.props.children.type, home.props.children.type);
  assert.equal(returned.props.children.props.running, true);
  assert.equal(app.textureCalls, 1);
  app.state.menuOpen = true;
  assert.equal(app.render().props.children.props.running, false);
  app.state.menuOpen = false;
  assert.equal(app.render().props.children.props.running, true);
});

test('texture preparation stops between tasks when home is left, and can retry', async () => {
  const abort = new AbortController();
  let count = 0;
  const names = ['leafMaps', 'brassMaps', 'contactShadowMap', 'lightPoolMap',
    'paintedWoodMaps', 'plasterMaps', 'rugMaps', 'stoneSlabMaps'];
  const { preloadTextures } = load('src/components/3d/preload.ts', {
    '@/content/gallery': {}, '@/content/home-media': {}, '@/content/jewelry': {}, './quality': {},
    './procedural-textures': Object.fromEntries(names.map(name => [name, () => {
      count++;
      if (count === 1) abort.abort();
    }])),
  }, { setTimeout });
  await preloadTextures(abort.signal);
  assert.equal(count, 1);
  await preloadTextures();
  assert.equal(count, 9);
});

function profile({ userAgent = '', platform = '', maxTouchPoints = 0, touch = true, search = '' } = {}) {
  return load('src/components/3d/quality.ts', {}, {
    URLSearchParams,
    window: { devicePixelRatio: 3, location: { search }, matchMedia: () => ({ matches: touch }) },
    navigator: { userAgent, platform, maxTouchPoints, hardwareConcurrency: 8 },
  }).quality();
}

test('iPhones and desktop-mode iPads use a bounded GPU budget', () => {
  for (const device of [{ userAgent: 'iPhone' }, { platform: 'MacIntel', maxTouchPoints: 5 }]) {
    const quality = profile(device);
    assert.equal(quality.tier, 'mid');
    assert.ok(quality.dpr[1] <= 1.5);
    assert.equal(quality.shadows, false);
    assert.equal(quality.transmission, false);
    assert.equal(quality.sparkles, 0);
    assert.ok(quality.envResolution <= 128);
  }
});

test('Android and desktop retain their profiles; quality overrides still work', () => {
  const android = profile({ userAgent: 'Android' });
  assert.equal(android.tier, 'high');
  assert.equal(android.dpr[0], 2);
  assert.equal(android.dpr[1], 3);
  const desktop = profile({ touch: false, platform: 'MacIntel' });
  assert.equal(desktop.tier, 'high');
  assert.equal(desktop.shadows, true);
  assert.equal(profile({ userAgent: 'iPhone', search: '?q=low' }).tier, 'low');
});

for (const touch of [false, true]) {
  test(`overlapping overlays release scroll locks after the final cleanup (touch=${touch})`, () => {
    function element() {
      const values = new Map([['overflow-y', 'scroll']]);
      return { style: { getPropertyValue: key => values.get(key) || '', getPropertyPriority: () => '',
        setProperty: (key, value) => values.set(key, value), removeProperty: key => values.delete(key) } };
    }
    const html = element(), body = element();
    let stopped = false;
    const { acquireScrollLock } = load('src/hooks/useScrollLock.ts', {
      react: { useEffect: () => {} },
      '@/store/scroll-store': { useScrollStore: { getState: () => ({ lenis: {
        stop: () => { stopped = true; }, start: () => { stopped = false; },
      } }) } },
    }, { document: { documentElement: html, body }, window: { matchMedia: () => ({ matches: touch }) } });
    const closeMenu = acquireScrollLock(), closeCart = acquireScrollLock();
    closeMenu(); closeMenu();
    assert.equal(stopped, true);
    assert.equal(body.style.getPropertyValue('overflow-y'), 'hidden');
    assert.equal(html.style.getPropertyValue('overflow-y'), touch ? 'scroll' : 'hidden');
    closeCart();
    assert.equal(stopped, false);
    assert.equal(html.style.getPropertyValue('overflow-y'), 'scroll');
    assert.equal(body.style.getPropertyValue('overflow-y'), 'scroll');
  });
}
