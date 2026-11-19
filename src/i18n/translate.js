'use strict';
// Shared by the Electron main process and sandboxed renderer.
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./catalog'));
  else root.ApkStartTranslations = factory(root.ApkStartCatalog);
})(typeof globalThis !== 'undefined' ? globalThis : this, function (catalog) {
  const normalize = s => String(s).replace(/\s+/g, ' ').trim();
  const locale = value => ['vi', 'en', 'zh-CN'].includes(value) ? value : 'vi';
  const patterns = [
    [/^正在安装 (.+)$/, 'Đang cài $1', 'Installing $1'],
    [/^正在打开 (.+)$/, 'Đang mở $1', 'Opening $1'],
    [/^(.+) 已安装$/, 'Đã cài $1', '$1 installed'],
    [/^(\d+) 分钟前$/, '$1 phút trước', '$1 minutes ago'],
    [/^(\d+) 小时前$/, '$1 giờ trước', '$1 hours ago'],
    [/^(\d+) 天前$/, '$1 ngày trước', '$1 days ago'],
    [/^关闭当前应用（(.+)）$/, 'Đóng ứng dụng hiện tại ($1)', 'Close current app ($1)'],
    [/^发现新版本 (.+)$/, 'Có phiên bản mới $1', 'New version $1 available'],
    [/^确定卸载「(.+)」？\s*应用数据会一并被清除，桌面快捷方式也会被删除。$/, 'Gỡ “$1”?\n\nDữ liệu ứng dụng và shortcut Desktop cũng sẽ bị xóa.', 'Uninstall “$1”?\n\nApp data and desktop shortcuts will also be deleted.'],
    [/^清除「(.+)」的全部数据？此操作不可撤销。$/, 'Xóa toàn bộ dữ liệu “$1”? Không thể hoàn tác.', 'Clear all data for “$1”? This cannot be undone.'],
  ];
  function translate(value, lang) {
    if (typeof value !== 'string' || locale(lang) === 'zh-CN') return value;
    lang = locale(lang);
    const key = normalize(value);
    if (catalog[key]) return value.replace(value.trim(), catalog[key][lang]);
    for (const [pattern, vi, en] of patterns) {
      if (pattern.test(key)) return key.replace(pattern, lang === 'vi' ? vi : en);
    }
    if (/\r?\n/.test(value)) return value.split(/(\r?\n)/).map(line => /\r?\n/.test(line) ? line : translate(line, lang)).join('');
    // Preserve unknown diagnostics and identifiers verbatim, never invent a translation.
    return value;
  }
  return { translate, normalize, locale, catalog };
});
