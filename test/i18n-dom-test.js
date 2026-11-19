'use strict';
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
async function main() {
  let stored = 'en';
  const html = fs.readFileSync(path.join(root, 'src/ui/index.html'), 'utf8');
  const dom = new JSDOM(html, { runScripts: 'outside-only', url: 'https://local.test/' });
  const w = dom.window;
  const listeners = [];
  w.apkstartLanguage = { get: async () => stored, set: async value => { stored = value; return value; }, onChange: cb => listeners.push(cb) };
  for (const file of ['src/i18n/catalog.js', 'src/i18n/translate.js', 'src/ui/i18n.js']) w.eval(fs.readFileSync(path.join(root, file), 'utf8'));
  await tick();
  const text = id => w.document.getElementById(id).textContent.trim();
  assert.equal(w.document.documentElement.lang, 'en', 'restore persisted language');
  assert.equal(text('btnInstall'), 'Install APK');
  const select = w.document.getElementById('uiLanguage');
  select.value = 'vi'; select.dispatchEvent(new w.Event('change')); await tick();
  assert.equal(stored, 'vi'); assert.equal(text('btnInstall'), 'Cài APK');
  const dynamic = w.document.createElement('div'); dynamic.textContent = '正在安装 TikTok'; w.document.body.append(dynamic);
  const card = w.document.createElement('div'); card.className = 'card'; card.innerHTML = '<div class="name">设置</div>'; w.document.body.append(card);
  await tick(); assert.equal(dynamic.textContent, 'Đang cài TikTok'); assert.equal(card.textContent, '设置');
  listeners[0]('en'); await tick(); assert.equal(dynamic.textContent, 'Installing TikTok');
  listeners[0]('zh-CN'); await tick(); assert.equal(dynamic.textContent, '正在安装 TikTok'); assert.equal(text('btnInstall'), '安装 APK');
  dynamic.textContent = '安装失败'; await tick(); listeners[0]('vi'); await tick(); assert.equal(dynamic.textContent, 'Cài đặt thất bại');
  assert.equal(w.document.getElementById('search').getAttribute('placeholder'), 'Tìm ứng dụng đã cài');
  // A failed save must keep the previous language and give readable feedback.
  let alert = ''; w.alert = message => { alert = message; };
  w.apkstartLanguage.set = async () => { throw new Error('disk full'); };
  select.value = 'en'; select.dispatchEvent(new w.Event('change')); await tick();
  assert.equal(select.value, 'vi'); assert.equal(w.document.documentElement.lang, 'vi'); assert.ok(alert.includes('Không lưu'));
  dom.window.close();
  console.log('i18n DOM: persistence, switching, live updates, placeholders, user data and save failures passed');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
