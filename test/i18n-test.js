'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { translate: t, catalog, normalize, locale } = require('../src/i18n/translate');
assert.equal(locale('unknown'), 'vi');
assert.equal(t('设置', 'vi'), 'Cài đặt');
assert.equal(t('设置', 'en'), 'Settings');
assert.equal(t('设置', 'zh-CN'), '设置');
assert.equal(t('  设置  ', 'en'), '  Settings  ');
assert.equal(t('正在安装 My App', 'en'), 'Installing My App');
assert.equal(t('清除「我的应用」的全部数据？此操作不可撤销。', 'en'), 'Clear all data for “我的应用”? This cannot be undone.');
assert.equal(t('C:\\应用\\x.apk', 'vi'), 'C:\\应用\\x.apk');
assert.equal(t('Unmapped diagnostic: 失败', 'en'), 'Unmapped diagnostic: 失败');
for (const [source, translations] of Object.entries(catalog)) {
  assert.equal(normalize(source), source, 'Catalog keys must be normalized');
  for (const lang of ['vi', 'en']) {
    assert.ok(translations[lang]?.trim(), `${source}: missing ${lang}`);
    assert.ok(!/[\u4e00-\u9fff]/.test(translations[lang]), `${source}: untranslated ${lang}`);
  }
}
// Cover every static Chinese text node and tooltip in the three app windows.
for (const name of ['index', 'shell', 'splash']) {
  const html = fs.readFileSync(path.join(__dirname, '../src/ui', `${name}.html`), 'utf8')
    .replace(/<!--[\s\S]*?-->/g, '').replace(/<select id="uiLanguage"[\s\S]*?<\/select>/, '');
  const texts = [...html.matchAll(/>([^<>]+)</g)].map(m => m[1]);
  texts.push(...[...html.matchAll(/(?:title|placeholder|aria-label)="([^"]*)"/g)].map(m => m[1]));
  for (const text of texts) if (/[\u4e00-\u9fff]/.test(text)) {
    assert.ok(catalog[normalize(text)], `${name}: missing ${text}`);
  }
}
console.log(`i18n: ${Object.keys(catalog).length} bilingual messages, static coverage and fallback checks passed`);
