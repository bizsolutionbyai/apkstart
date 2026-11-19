'use strict';
(function () {
  const translations = window.ApkStartTranslations;
  const bridge = window.apkstartLanguage;
  let lang = 'vi';
  const originals = new WeakMap();
  const ignored = 'script,style,code,pre,textarea,[data-no-i18n],.card:not(.card-add) .name,.card .fallback,#appName,#bootName,#uiLanguage';
  const attributes = ['title', 'placeholder', 'aria-label'];
  function rewrite(node, key, value, setter) {
    let cache = originals.get(node);
    if (!cache) { cache = {}; originals.set(node, cache); }
    if (!cache[key] || value !== cache[key].rendered) cache[key] = { source: value, rendered: value };
    const next = translations.translate(cache[key].source, lang);
    cache[key].rendered = next;
    if (next !== value) setter(next);
  }
  function visit(node) {
    if (node.nodeType === 3) {
      if (!node.parentElement || node.parentElement.closest(ignored)) return;
      rewrite(node, 'text', node.nodeValue, v => { node.nodeValue = v; });
      return;
    }
    if (node.nodeType !== 1 || node.matches(ignored)) return;
    for (const attr of attributes) {
      // App titles/package identifiers are user data, not UI messages.
      if (node.matches('.card:not(.card-add)') && attr === 'title') continue;
      if (node.hasAttribute(attr)) rewrite(node, attr, node.getAttribute(attr), v => node.setAttribute(attr, v));
    }
    for (const child of node.childNodes) visit(child);
  }
  const observer = new MutationObserver(records => {
    observer.disconnect();
    for (const record of records) {
      if (record.type === 'childList') record.addedNodes.forEach(visit);
      else visit(record.target);
    }
    observe();
  });
  function observe() {
    observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
  }
  function apply(value) {
    lang = translations.locale(value);
    observer.disconnect();
    document.documentElement.lang = lang;
    visit(document.body);
    const select = document.getElementById('uiLanguage');
    if (select) select.value = lang;
    observe();
    window.dispatchEvent(new CustomEvent('apkstart:language', { detail: lang }));
  }
  // Native JavaScript confirmations do not pass through the DOM observer.
  for (const method of ['confirm', 'alert', 'prompt']) {
    const native = window[method].bind(window);
    window[method] = (message, ...args) => native(translations.translate(message, lang), ...args);
  }
  window.apkstartI18n = { t: text => translations.translate(text, lang), apply, get language() { return lang; } };
  apply(lang);
  bridge?.get().then(apply).catch(() => {});
  bridge?.onChange(apply);
  const select = document.getElementById('uiLanguage');
  if (select) select.addEventListener('change', async () => {
    const previous = lang;
    try {
      if (!bridge) throw new Error('Language settings bridge unavailable');
      const saved = await bridge.set(select.value);
      apply(saved);
    } catch (_) {
      select.value = previous;
      window.alert(previous === 'vi' ? 'Không lưu được ngôn ngữ. Vui lòng thử lại.' : 'Could not save language. Please retry.');
    }
  });
})();
