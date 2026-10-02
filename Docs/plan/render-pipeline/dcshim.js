// Minimal local stand-in for the Design canvas runtime: runs renderVals() and expands {{holes}}, <sc-for>, <sc-if>.
(function () {
  window.DCLogic = class { constructor(p) { this.props = p || {}; this.state = {}; } setState(s) { Object.assign(this.state, s); } forceUpdate() {} };
  const sc = document.querySelector('script[data-dc-script]');
  let vals = {};
  if (sc) { const Comp = new Function(sc.textContent + '\n;return Component;')(); const inst = new Comp({}); vals = inst.renderVals ? inst.renderVals() : {}; }
  const get = (scope, path) => { path = path.trim(); if (path === 'true') return true; if (path === 'false') return false; if (/^-?\d/.test(path)) return +path; return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), scope); };
  const interp = (str, scope) => str.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, p) => { const v = get(scope, p); return v == null || typeof v === 'function' ? '' : String(v); });
  const strip = (s) => s.replace(/[{}]/g, '');
  function walk(node, scope) {
    for (const child of [...node.childNodes]) {
      if (child.nodeType === 3) { if (child.nodeValue.includes('{{')) child.nodeValue = interp(child.nodeValue, scope); continue; }
      if (child.nodeType !== 1) continue;
      const tag = child.tagName.toLowerCase();
      if (tag === 'sc-for') {
        const list = get(scope, strip(child.getAttribute('list'))) || [];
        const as = child.getAttribute('as') || 'item';
        list.forEach((item, i) => { const holder = document.createElement(node.namespaceURI === 'http://www.w3.org/2000/svg' ? 'g' : 'div'); holder.innerHTML = child.innerHTML; const s2 = Object.assign(Object.create(scope), { [as]: item, $index: i }); walk(holder, s2); while (holder.firstChild) node.insertBefore(holder.firstChild, child); });
        child.remove(); continue;
      }
      if (tag === 'sc-if') { const v = get(scope, strip(child.getAttribute('value'))); if (v) { walk(child, scope); while (child.firstChild) node.insertBefore(child.firstChild, child); } child.remove(); continue; }
      for (const a of [...child.attributes]) {
        if (!a.value.includes('{{')) continue;
        const m = a.value.match(/^\{\{\s*([^}]+?)\s*\}\}$/);
        if (m) { const v = get(scope, m[1]); if (typeof v === 'function' || v == null) child.removeAttribute(a.name); else child.setAttribute(a.name, String(v)); }
        else child.setAttribute(a.name, interp(a.value, scope));
      }
      walk(child, scope);
    }
  }
  const root = document.querySelector('x-dc'); if (root) walk(root, vals);
  window.__shimmed = true;
})();
