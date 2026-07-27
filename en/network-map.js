/*!
 * network-map — interactive network maps for Wiki.js
 * Renders <pre class="network-map"> blocks. Requires cytoscape.js + cytoscape-dagre.
 *
 * Copyright 2026 Mateusz Mazur (MAZNET)
 * SPDX-License-Identifier: Apache-2.0
 * https://github.com/MowMiMazur/WikiJS-Network-map
 */
(function () {
  'use strict';


  var CFG = {
    nodeWidth: 236,          // px, model space
    nodeHeightFallback: 86,  // when measuring fails
    rankSep: 108,            // must fit two port labels plus a description
    nodeSep: 54,             // within a rank
    edgeSep: 28,             // between edges

    // Spreading out dense maps. Dagre knows nothing about port labels or edge
    // descriptions, so once there are many links the cards sit so close that a
    // description has nowhere to land and ends up pushed off to the side of the
    // map instead of resting on its line.
    autoSpread: true,        // false = fixed separations, as above
    spreadFrom: 10,          // spreading starts above this many links
    spreadRank: 0.10,        // growth of the between-rank gap per link
    spreadNode: 0.035,       // growth of the within-rank gap
    fanFrom: 4,              // above this many links on a single device…
    fanStep: 0.06,           // …its rank is pushed further apart sideways
    spreadMax: 2.2,          // upper bound on the multiplier

    stageHeight: 700,        // px, unless height is given
    fitPadding: 24,
    fitMargin: 30,           // slack for labels sticking out of the cards
    fitMaxZoom: 1.15,
    minZoom: 0.2,
    maxZoom: 2.6,
    hideDescZoom: 0.46,      // below this, descriptions fade out
    hidePortZoom: 0.32,      // below this, port labels fade out too
    parallelShift: 34,       // px

    // wheel zoom
    wheelStep: 1.55,         // factor per wheel notch
    buttonStep: 1.4,         // factor for the +/- buttons
    wheelNeedsCtrl: true,    // false = wheel zooms without Ctrl

    // corner credit; see NOTICE
    author: {
      brand: 'MAZNET',
      name: 'Mateusz Mazur',
      url: '',               // a URL turns the credit into a link
      show: true
    }
  };


  var ICONS = {
    globe: '<circle cx="12" cy="12" r="8.4"/><path d="M3.6 12h16.8M12 3.6c2.4 2.4 3.5 5.3 3.5 8.4s-1.1 6-3.5 8.4c-2.4-2.4-3.5-5.3-3.5-8.4s1.1-6 3.5-8.4Z"/>',
    cloud: '<path d="M7.3 18.2h9.9a3.3 3.3 0 0 0 .4-6.6 5.5 5.5 0 0 0-10.6-1.5 3.6 3.6 0 0 0 .3 8.1Z"/>',
    router: '<rect x="2.6" y="13.4" width="18.8" height="7" rx="2.2"/><path d="M6.2 16.9h.01M9.3 16.9h.01M12.4 16.9h.01M16.6 16.9h2.4"/><path d="M12 13.4V9.2m0 0 3.6-3.6M12 9.2 8.4 5.6"/>',
    gateway: '<rect x="2.6" y="13.2" width="18.8" height="7.2" rx="2.2"/><path d="M6.4 16.8h.01M9.5 16.8h.01"/><path d="M8.6 8.8 12 5.4l3.4 3.4M12 5.4v7.2"/>',
    firewall: '<path d="M12 3.2 19.3 6v5.3c0 4.3-2.9 8.1-7.3 9.5-4.4-1.4-7.3-5.2-7.3-9.5V6Z"/><path d="M4.9 10.1h14.2M12 3.4v17.1"/>',
    switch: '<rect x="2.6" y="6.6" width="18.8" height="10.8" rx="2.2"/><path d="M6.4 14.4v3M9.6 14.4v3M12.8 14.4v3M16 14.4v3M19 14.4v3"/><path d="M6.2 10.4h9.4m0 0-2.1-2.1m2.1 2.1-2.1 2.1"/>',
    patchpanel: '<rect x="2.4" y="7.8" width="19.2" height="8.4" rx="1.8"/><path d="M5.4 10.9v2.6M8 10.9v2.6M10.6 10.9v2.6M13.2 10.9v2.6M15.8 10.9v2.6M18.4 10.9v2.6"/>',
    wifi: '<path d="M4.4 9.2a10.6 10.6 0 0 1 15.2 0"/><path d="M7.5 12.5a6.3 6.3 0 0 1 9 0"/><path d="M10.4 15.8a2.3 2.3 0 0 1 3.2 0"/><path d="M12 19.3h.01"/>',
    server: '<rect x="3.8" y="3.4" width="16.4" height="7.2" rx="1.8"/><rect x="3.8" y="13.4" width="16.4" height="7.2" rx="1.8"/><path d="M7.2 7h.01M7.2 17h.01M15.8 7h2.4M15.8 17h2.4"/>',
    hypervisor: '<rect x="3.2" y="3.2" width="7.6" height="7.6" rx="1.8"/><rect x="13.2" y="3.2" width="7.6" height="7.6" rx="1.8"/><rect x="3.2" y="13.2" width="7.6" height="7.6" rx="1.8"/><rect x="13.2" y="13.2" width="7.6" height="7.6" rx="1.8"/>',
    vm: '<rect x="2.8" y="4.4" width="18.4" height="15.2" rx="2.2"/><rect x="7.4" y="8.8" width="9.2" height="6.4" rx="1.4"/>',
    nas: '<rect x="4.4" y="2.8" width="15.2" height="18.4" rx="2.2"/><path d="M7.8 6.6h8.4M7.8 10.2h8.4M7.8 13.8h8.4"/><path d="M7.8 17.6h.01"/>',
    disk: '<ellipse cx="12" cy="6" rx="7.6" ry="3"/><path d="M4.4 6v12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V6"/><path d="M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3"/>',
    computer: '<rect x="2.6" y="4" width="18.8" height="11.6" rx="2.2"/><path d="M9 19.8h6M12 15.6v4.2"/>',
    laptop: '<path d="M5.2 6.4h13.6v9.2H5.2Z"/><path d="M2.6 18.6h18.8"/>',
    printer: '<path d="M7 8.4V3.6h10v4.8"/><rect x="3.4" y="8.4" width="17.2" height="7.4" rx="1.8"/><path d="M7 13.2h10v7H7Z"/>',
    phone: '<rect x="6.6" y="2.6" width="10.8" height="18.8" rx="2.6"/><path d="M10.6 18.4h2.8"/>',
    camera: '<path d="M2.8 8.2h9.6a1.6 1.6 0 0 1 1.6 1.6v4.4a1.6 1.6 0 0 1-1.6 1.6H2.8Z"/><path d="M14 11.3l5.3-2.6a.9.9 0 0 1 1.3.8v4.8a.9.9 0 0 1-1.3.8L14 12.9Z"/><path d="M6.4 15.8v3.6"/>',
    nvr: '<rect x="2.6" y="6.6" width="18.8" height="10.8" rx="2.2"/><circle cx="8.4" cy="12" r="2.6"/><path d="M14 10.2h4.4M14 13.8h4.4"/>',
    alarm: '<path d="M12 3.4A5.6 5.6 0 0 0 6.4 9c0 5-2 6.4-2 6.4h15.2s-2-1.4-2-6.4A5.6 5.6 0 0 0 12 3.4Z"/><path d="M10.1 18.8a2.1 2.1 0 0 0 3.8 0"/>',
    flame: '<path d="M12 2.8s4.8 4.2 4.8 8.6a4.8 4.8 0 0 1-9.6 0C7.2 7 12 2.8 12 2.8Z"/><path d="M12 20.8v.01"/>',
    sensor: '<circle cx="12" cy="12" r="2.4"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4M5 5a9.8 9.8 0 0 0 0 14M19 5a9.8 9.8 0 0 1 0 14"/>',
    ups: '<rect x="2.8" y="6.6" width="16.2" height="10.8" rx="2.2"/><path d="M21.2 10.4v3.2"/><path d="M11.8 8.6 9.2 12.4h2.6l-.6 3 3.2-4.2h-2.6Z"/>',
    display: '<rect x="2.6" y="4.6" width="18.8" height="12" rx="2.2"/><path d="M8.4 20h7.2"/>',
    chip: '<rect x="5" y="5" width="14" height="14" rx="2.4"/><path d="M9.4 5V2.8M14.6 5V2.8M9.4 21.2V19M14.6 21.2V19M5 9.4H2.8M5 14.6H2.8M21.2 9.4H19M21.2 14.6H19"/>',
    // UI
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    fit: '<circle cx="12" cy="12" r="4.6"/><path d="M12 2.6v3.4M12 18v3.4M2.6 12H6M18 12h3.4"/>',
    refresh: '<path d="M20 11a8 8 0 1 0-2.6 5.9"/><path d="M20 4.6V11h-6.2"/>',
    flow: '<path d="M4.4 7.6h15.2M4.4 12h15.2M4.4 16.4h9"/>',
    orgV: '<rect x="8.8" y="2.8" width="6.4" height="4.4" rx="1.2"/><rect x="2.4" y="16.8" width="6.4" height="4.4" rx="1.2"/><rect x="15.2" y="16.8" width="6.4" height="4.4" rx="1.2"/><path d="M12 7.2v4.4M5.6 16.8v-2.6h12.8v2.6"/>',
    orgH: '<rect x="2.8" y="8.8" width="4.4" height="6.4" rx="1.2"/><rect x="16.8" y="2.4" width="4.4" height="6.4" rx="1.2"/><rect x="16.8" y="15.2" width="4.4" height="6.4" rx="1.2"/><path d="M7.2 12h4.4M16.8 5.6h-2.6v12.8h2.6"/>',
    tag: '<path d="M4 10.4V4.8A.8.8 0 0 1 4.8 4h5.6L20 13.6 13.6 20Z"/><path d="M7.6 7.6h.01"/>',
    curve: '<path d="M4 18c6 0 10-12 16-12"/>',
    angle: '<path d="M4 18h7V6h9"/>',
    expand: '<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/>',
    collapse: '<path d="M4 9h5V4M20 9h-5V4M4 15h5v5M20 15h-5v5"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    search: '<circle cx="11" cy="11" r="6.4"/><path d="M15.8 15.8 20.5 20.5"/>'
  };


  var TYPES = {
    internet:   { label: 'Internet / WAN',     icon: 'globe',      color: '#0284c7' },
    cloud:      { label: 'Cloud / uplink',     icon: 'cloud',      color: '#64748b' },
    router:     { label: 'Router',             icon: 'router',     color: '#2563eb' },
    gateway:    { label: 'Gateway / modem',      icon: 'gateway',    color: '#0ea5e9' },
    firewall:   { label: 'Firewall',           icon: 'firewall',   color: '#e11d48' },
    switch:     { label: 'Switch',        icon: 'switch',     color: '#0891b2' },
    patchpanel: { label: 'Patch panel',      icon: 'patchpanel', color: '#0d9488' },
    wifi:       { label: 'Access point',    icon: 'wifi',       color: '#16a34a' },
    server:     { label: 'Server',             icon: 'server',     color: '#7c3aed' },
    hypervisor: { label: 'Hypervisor',         icon: 'hypervisor', color: '#4f46e5' },
    vm:         { label: 'Virtual machine',  icon: 'vm',         color: '#6366f1' },
    nas:        { label: 'NAS',                icon: 'nas',        color: '#9333ea' },
    storage:    { label: 'Storage array',  icon: 'disk',       color: '#a855f7' },
    computer:   { label: 'Computer',           icon: 'computer',   color: '#475569' },
    laptop:     { label: 'Laptop',             icon: 'laptop',     color: '#64748b' },
    printer:    { label: 'Printer',           icon: 'printer',    color: '#57534e' },
    phone:      { label: 'Phone / VoIP',     icon: 'phone',      color: '#0f766e' },
    display:    { label: 'Display / TV',       icon: 'display',    color: '#525252' },
    camera:     { label: 'Camera',             icon: 'camera',     color: '#ea580c' },
    nvr:        { label: 'Recorder / NVR',        icon: 'nvr',        color: '#c2410c' },
    alarm:      { label: 'Intruder alarm',      icon: 'alarm',      color: '#f59e0b' },
    firepanel:  { label: 'Fire alarm panel',       icon: 'flame',      color: '#dc2626' },
    sensor:     { label: 'Sensor / IoT',      icon: 'sensor',     color: '#65a30d' },
    ups:        { label: 'UPS / power',    icon: 'ups',        color: '#ca8a04' },
    device:     { label: 'Device',         icon: 'chip',       color: '#64748b' }
  };

  var ALIASES = {
    isp: 'internet', wan: 'internet', net: 'internet', www: 'internet',
    modem: 'gateway', ont: 'gateway', onu: 'gateway', gw: 'gateway',
    fw: 'firewall', utm: 'firewall',
    sw: 'switch', l3: 'switch',
    patch: 'patchpanel', 'patch-panel': 'patchpanel',
    ap: 'wifi', wlan: 'wifi', 'wi-fi': 'wifi', accesspoint: 'wifi',
    srv: 'server', host: 'server',
    pve: 'hypervisor', proxmox: 'hypervisor', esxi: 'hypervisor', hyperv: 'hypervisor',
    guest: 'vm', container: 'vm', lxc: 'vm',
    san: 'storage', disk: 'storage', array: 'storage',
    pc: 'computer', workstation: 'computer', desktop: 'computer',
    notebook: 'laptop',
    mfp: 'printer',
    voip: 'phone', sip: 'phone', tel: 'phone',
    tv: 'display', monitor: 'display', screen: 'display',
    cam: 'camera', cctv: 'camera', ipcam: 'camera',
    dvr: 'nvr', recorder: 'nvr',
    intruder: 'alarm', alarmpanel: 'alarm', ids: 'alarm',
    fire: 'firepanel', firealarm: 'firepanel',
    iot: 'sensor', probe: 'sensor',
    pdu: 'ups', power: 'ups',
    other: 'device', unknown: 'device', misc: 'device'
  };

  var ARROW_RE = /^(?:<?[-=~]{1,4}>?|<>|>|<)$/;


  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null && text !== '') e.textContent = text;
    return e;
  }

  function icon(name, cls) {
    var span = el('span', 'nm-i' + (cls ? ' ' + cls : ''));
    span.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      (ICONS[name] || ICONS.chip) + '</svg>';
    return span;
  }

  function button(iconName, title, onClick, cls) {
    var b = el('button', 'nm-btn' + (cls ? ' ' + cls : ''));
    b.type = 'button';
    b.title = title;
    b.setAttribute('aria-label', title);
    b.appendChild(icon(iconName));
    b.addEventListener('click', onClick);
    return b;
  }

  function authorMark() {
    var a = CFG.author || {};
    if (a.show === false || (!a.brand && !a.name)) return null;

    var node = el(a.url ? 'a' : 'div', 'nm-mark');
    if (a.url) {
      node.href = a.url;
      node.target = '_blank';
      node.rel = 'noopener noreferrer';
      node.classList.add('is-link');
    }
    node.title = 'Network infrastructure map - ' +
      [a.brand, a.name].filter(Boolean).join(' · ') + ' (Apache 2.0 licence)';
    if (a.brand) node.appendChild(el('span', 'nm-mark-brand', a.brand));
    if (a.brand && a.name) node.appendChild(el('span', 'nm-mark-sep', '·'));
    if (a.name) node.appendChild(el('span', 'nm-mark-name', a.name));
    return node;
  }

  function isDark() {
    var h = document.documentElement, b = document.body;
    return (h && h.classList.contains('theme--dark')) ||
           (b && b.classList.contains('theme--dark')) ||
           (h && h.getAttribute('data-theme') === 'dark');
  }

  // --- parser ---

  // tokens: id:"port with spaces" | key=value | "text" | word
  function tokenize(line) {
    var re = /([A-Za-z0-9_.-]+):"([^"]*)"|([A-Za-z_][\w.-]*)=(?:"([^"]*)"|'([^']*)'|(\S+))|"([^"]*)"|'([^']*)'|(\S+)/g;
    var out = [], m;
    while ((m = re.exec(line)) !== null) {
      if (m[1] !== undefined) {
        out.push({ kind: 'text', quoted: false, value: m[1] + ':' + m[2] });
      } else if (m[3] !== undefined) {
        out.push({
          kind: 'attr',
          key: m[3].toLowerCase(),
          value: m[4] !== undefined ? m[4] : (m[5] !== undefined ? m[5] : m[6])
        });
      } else if (m[7] !== undefined || m[8] !== undefined) {
        out.push({ kind: 'text', quoted: true, value: m[7] !== undefined ? m[7] : m[8] });
      } else {
        out.push({ kind: 'text', quoted: false, value: m[9] });
      }
    }
    return out;
  }

  function split(rest) {
    var bag = { attrs: {}, bare: [], quoted: [], arrow: null };
    rest.forEach(function (t) {
      if (t.kind === 'attr') { bag.attrs[t.key] = t.value; return; }
      if (!t.quoted && ARROW_RE.test(t.value)) { bag.arrow = t.value; return; }
      (t.quoted ? bag.quoted : bag.bare).push(t.value);
    });
    return bag;
  }

  function endpoint(raw) {
    if (!raw) return { id: '', port: '' };
    var i = raw.indexOf(':');
    if (i < 0) return { id: raw, port: '' };
    return { id: raw.slice(0, i), port: raw.slice(i + 1) };
  }

  function normalizeType(raw) {
    if (!raw) return null;
    var t = String(raw).toLowerCase();
    if (TYPES[t]) return t;
    if (ALIASES[t]) return ALIASES[t];
    return null;
  }

  function unescapeText(s) {
    return String(s == null ? '' : s).replace(/\\n/g, '\n');
  }

  function parseSource(text) {
    var doc = {
      title: '', direction: 'TB', legend: true, table: true, height: 0,
      nodes: [], links: [], warnings: []
    };
    var byId = Object.create(null);

    function warn(lineNo, msg) {
      doc.warnings.push((lineNo ? 'Line ' + lineNo + ': ' : '') + msg);
    }

    function addNode(rest, lineNo) {
      var bag = split(rest);
      var id = bag.bare.shift();
      if (!id) { warn(lineNo, 'missing device id.'); return; }
      if (!/^[A-Za-z0-9_.-]+$/.test(id)) {
        warn(lineNo, 'id "' + id + '" may only contain letters, digits, _ . and -');
        return;
      }
      var name = bag.attrs.name || (bag.quoted.length ? bag.quoted.shift() : (bag.bare.length ? bag.bare.shift() : id));
      var rawType = bag.attrs.type || bag.bare.shift() || 'device';
      var type = normalizeType(rawType);
      if (!type) { warn(lineNo, 'unknown type "' + rawType + '" - falling back to "device".'); type = 'device'; }
      var info = bag.attrs.info || bag.attrs.ip || bag.attrs.desc || bag.quoted.shift() || '';

      var node = {
        id: id,
        name: unescapeText(name),
        type: type,
        info: unescapeText(info),
        note: unescapeText(bag.attrs.note || ''),
        tag: unescapeText(bag.attrs.tag || bag.attrs.role || bag.attrs.zone || ''),
        url: bag.attrs.url || bag.attrs.link || '',
        color: bag.attrs.color || '',
        auto: false
      };
      if (byId[id]) {
        warn(lineNo, 'device "' + id + '" is defined more than once - the duplicate was ignored.');
        return;
      }
      byId[id] = node;
      doc.nodes.push(node);
    }

    function addLink(rest, lineNo) {
      var bag = split(rest);
      var a = endpoint(bag.bare.shift());
      var b = endpoint(bag.bare.shift());
      if (!a.id || !b.id) { warn(lineNo, 'a link needs two devices.'); return; }

      var label = bag.attrs.label || bag.attrs.desc || bag.quoted.shift() || '';
      var portA = a.port || bag.attrs.porta || bag.attrs.port1 || bag.attrs.srcport || bag.quoted.shift() || '';
      var portB = b.port || bag.attrs.portb || bag.attrs.port2 || bag.attrs.dstport || bag.quoted.shift() || '';
      var style = String(bag.attrs.style || 'solid').toLowerCase();
      if (['solid', 'dashed', 'dotted'].indexOf(style) < 0) style = 'solid';
      var arrow = bag.arrow || '';

      doc.links.push({
        id: 'l' + doc.links.length,
        source: a.id,
        target: b.id,
        sourcePort: unescapeText(portA),
        targetPort: unescapeText(portB),
        label: unescapeText(label),
        note: unescapeText(bag.attrs.note || ''),
        vlan: unescapeText(bag.attrs.vlan || ''),
        speed: unescapeText(bag.attrs.speed || bag.attrs.rate || ''),
        media: unescapeText(bag.attrs.media || bag.attrs.medium || ''),
        color: bag.attrs.color || '',
        style: style,
        arrowTarget: arrow.indexOf('>') >= 0,
        arrowSource: arrow.indexOf('<') === 0,
        line: lineNo
      });
    }

    String(text).replace(/\r/g, '').split('\n').forEach(function (raw, idx) {
      var lineNo = idx + 1;
      var line = raw.trim();
      if (!line) return;
      if (line.charAt(0) === '#' || line.charAt(0) === ';' || line.slice(0, 2) === '//') return;

      var tokens = tokenize(line);
      if (!tokens.length) return;

      var first = tokens[0];
      var cmd = first.kind === 'attr' ? first.key : String(first.value).toLowerCase();
      var rest = tokens.slice(1);

      switch (cmd) {
        case 'node': case 'device': case 'dev':
          addNode(rest, lineNo); return;

        case 'link': case 'conn': case 'connect':
          addLink(rest, lineNo); return;

        case 'title':
          doc.title = unescapeText(first.kind === 'attr' ? first.value : (split(rest).quoted[0] || split(rest).bare.join(' ')));
          return;

        case 'direction': case 'dir': case 'layout': {
          var d = String(first.kind === 'attr' ? first.value : (rest[0] && rest[0].value) || '').toUpperCase();
          if (['TB', 'LR', 'BT', 'RL'].indexOf(d) >= 0) doc.direction = d;
          else if (d === 'VERTICAL' || d === 'V') doc.direction = 'TB';
          else if (d === 'HORIZONTAL' || d === 'H') doc.direction = 'LR';
          else warn(lineNo, 'unknown direction "' + d + '" (allowed: TB, LR, BT, RL).');
          return;
        }

        case 'legend':
          doc.legend = !/^(off|no|false|0|hide|none)$/i.test(String(first.kind === 'attr' ? first.value : (rest[0] && rest[0].value) || 'on'));
          return;

        case 'table':
          doc.table = !/^(off|no|false|0|hide|none)$/i.test(String(first.kind === 'attr' ? first.value : (rest[0] && rest[0].value) || 'on'));
          return;

        case 'height': {
          var h = parseInt(first.kind === 'attr' ? first.value : (rest[0] && rest[0].value), 10);
          if (h >= 260 && h <= 2000) doc.height = h;
          else warn(lineNo, 'height must be a number between 260 and 2000.');
          return;
        }

        default:
          // shorthand without the "link" keyword: a:port -> b:port "description"
          if (tokens.some(function (t) { return t.kind === 'text' && !t.quoted && ARROW_RE.test(t.value); })) {
            addLink(tokens, lineNo);
            return;
          }
          warn(lineNo, 'unknown command "' + cmd + '".');
      }
    });

    // a typo in an id must not take the whole map down
    doc.links.forEach(function (l) {
      [l.source, l.target].forEach(function (id) {
        if (byId[id]) return;
        var node = {
          id: id, name: id, type: 'device', info: '', note: '', tag: '',
          url: '', color: '', auto: true
        };
        byId[id] = node;
        doc.nodes.push(node);
        doc.warnings.push('Line ' + l.line + ': device "' + id + '" was never defined (added automatically).');
      });
    });

    var portUse = Object.create(null);
    doc.links.forEach(function (l) {
      [[l.source, l.sourcePort], [l.target, l.targetPort]].forEach(function (pair) {
        if (!pair[1]) return;
        var key = pair[0] + '|' + pair[1].toLowerCase();
        (portUse[key] || (portUse[key] = { dev: pair[0], port: pair[1], lines: [] })).lines.push(l.line);
      });
    });
    Object.keys(portUse).forEach(function (key) {
      var u = portUse[key];
      if (u.lines.length < 2) return;
      doc.warnings.push('Port "' + u.port + '" on "' + u.dev + '" is used by ' +
        u.lines.length + ' links (lines: ' + u.lines.join(', ') + ').');
    });

    // spread parallel links apart
    var groups = Object.create(null);
    doc.links.forEach(function (l) {
      var key = [l.source, l.target].sort().join('|');
      (groups[key] || (groups[key] = [])).push(l);
    });
    Object.keys(groups).forEach(function (key) {
      var list = groups[key];
      list.forEach(function (l, i) {
        l.shift = list.length < 2 ? 0 : (i - (list.length - 1) / 2) * CFG.parallelShift;
      });
    });

    doc.byId = byId;
    return doc;
  }


  function finitePoint(p) {
    return p && isFinite(p.x) && isFinite(p.y) ? p : null;
  }

  function borderPoint(from, to, w, h) {
    var dx = to.x - from.x, dy = to.y - from.y;
    if (!dx && !dy) return { x: from.x, y: from.y + h / 2 };
    var sx = dx === 0 ? Infinity : (w / 2) / Math.abs(dx);
    var sy = dy === 0 ? Infinity : (h / 2) / Math.abs(dy);
    var s = Math.min(sx, sy);
    return { x: from.x + dx * s, y: from.y + dy * s };
  }

  function overlaps(a, b) {
    return a.x1 < b.x2 && b.x1 < a.x2 && a.y1 < b.y2 && b.y1 < a.y2;
  }

  function rectAt(x, y, w, h, pad) {
    pad = pad || 0;
    return { x1: x - w / 2 - pad, y1: y - h / 2 - pad, x2: x + w / 2 + pad, y2: y + h / 2 + pad };
  }


  // Label position candidates. Moving along the line (a) keeps a label on its
  // own edge; moving sideways (p) tears it off the line and leaves it hanging in
  // mid-air — so sideways costs far more than travelling along the line.
  function buildSlots(maxAlong, maxPerp, perpCost) {
    var out = [];
    for (var a = 0; a <= maxAlong; a++) {
      for (var p = 0; p <= maxPerp; p++) {
        if (p === 0) out.push({ a: a, p: 0 });
        else { out.push({ a: a, p: p }); out.push({ a: a, p: -p }); }
      }
    }
    return out.sort(function (x, y) {
      return (Math.abs(x.a) + Math.abs(x.p) * perpCost) - (Math.abs(y.a) + Math.abs(y.p) * perpCost);
    });
  }

  // a description may step aside as a last resort, a port label never may — cut
  // loose from its line it no longer says which cable it belongs to
  var LABEL_SLOTS = buildSlots(3, 2, 2.4);
  var PORT_SLOTS = buildSlots(5, 0, 1);

  function placeLabels(items, obstacles) {
    var taken = obstacles.slice();

    items.sort(function (a, b) { return b.priority - a.priority; });

    items.forEach(function (it) {
      var slide = it.slide || it.dir;
      var perp = { x: -slide.y, y: slide.x };
      var slots = it.slots || LABEL_SLOTS;
      // the step scales with the label: on a vertical edge a sideways move
      // has to clear its width, not its height
      var stepPerp = Math.abs(perp.x) * it.w + Math.abs(perp.y) * it.h + 6;
      var stepAlong = Math.abs(slide.x) * it.w + Math.abs(slide.y) * it.h + 6;
      var placed = null;

      for (var i = 0; i < slots.length && !placed; i++) {
        var s = slots[i];
        // a port label may not travel past the middle of its own line — beyond
        // that it reads as a port of the device on the other end of the cable
        if (it.limit && s.a * stepAlong > it.limit) continue;
        var x = it.x + perp.x * stepPerp * s.p + slide.x * stepAlong * s.a;
        var y = it.y + perp.y * stepPerp * s.p + slide.y * stepAlong * s.a;
        var r = rectAt(x, y, it.w, it.h, 1.5);
        var hit = false;
        for (var j = 0; j < taken.length; j++) {
          if (overlaps(taken[j], r)) { hit = true; break; }
        }
        if (!hit) placed = { x: x, y: y, r: r };
      }

      if (!placed && it.priority >= 2) {
        // port labels are never dropped
        placed = { x: it.x, y: it.y, r: rectAt(it.x, it.y, it.w, it.h, 1.5) };
      }

      if (placed) {
        it.el.classList.remove('is-crowded');
        it.el.style.left = placed.x + 'px';
        it.el.style.top = placed.y + 'px';
        taken.push(placed.r);
      } else {
        // the description shows up once the edge is selected
        it.el.classList.add('is-crowded');
        it.el.style.left = it.x + 'px';
        it.el.style.top = it.y + 'px';
      }
    });
  }


  function edgeColors(dark) {
    return dark
      ? { base: '#5c6b80', active: '#60a5fa', muted: 0.10 }
      : { base: '#9aa7b8', active: '#2563eb', muted: 0.10 };
  }

  function buildStylesheet(dark) {
    var c = edgeColors(dark);
    return [
      {
        selector: 'node',
        style: {
          'shape': 'round-rectangle',
          'width': 'data(w)',
          'height': 'data(h)',
          'background-opacity': 0,
          'border-width': 0,
          'text-opacity': 0,
          'overlay-opacity': 0,
          'events': 'yes'
        }
      },
      {
        selector: 'edge',
        style: {
          'curve-style': 'unbundled-bezier',
          'control-point-weights': function (e) { return e.data('cpw'); },
          'control-point-distances': function (e) { return e.data('cpd'); },
          'edge-distances': 'intersection',
          'width': 2.2,
          'line-color': c.base,
          'line-cap': 'round',
          'target-arrow-color': c.base,
          'source-arrow-color': c.base,
          'arrow-scale': 0.85,
          'overlay-opacity': 0,
          'z-index': 1
        }
      },
      { selector: 'edge.nm-taxi', style: {
          'curve-style': 'taxi',
          'taxi-direction': 'auto',
          'taxi-turn': 'data(turn)',
          'taxi-turn-min-distance': 12,
          'taxi-radius': 10
      } },
      { selector: 'edge.nm-loop', style: { 'curve-style': 'bezier', 'loop-direction': '-45deg', 'loop-sweep': '35deg' } },
      { selector: 'edge.nm-dashed', style: { 'line-style': 'dashed', 'line-dash-pattern': [8, 5] } },
      { selector: 'edge.nm-dotted', style: { 'line-style': 'dotted' } },
      { selector: 'edge.nm-arrow-t', style: { 'target-arrow-shape': 'triangle' } },
      { selector: 'edge.nm-arrow-s', style: { 'source-arrow-shape': 'triangle' } },
      { selector: 'edge.nm-custom', style: {
          'line-color': 'data(color)',
          'target-arrow-color': 'data(color)',
          'source-arrow-color': 'data(color)'
      } },
      { selector: '.is-dim', style: { 'opacity': c.muted } },
      { selector: 'edge.is-active', style: {
          'width': 3.4,
          'line-color': c.active,
          'target-arrow-color': c.active,
          'source-arrow-color': c.active,
          'opacity': 1,
          'z-index': 30
      } }
    ];
  }


  function build(pre) {
    var doc = parseSource(pre.textContent || '');
    var title = doc.title || pre.dataset.title || 'Network infrastructure map';
    var direction = (pre.dataset.direction || '').toUpperCase() || doc.direction;
    if (['TB', 'LR', 'BT', 'RL'].indexOf(direction) < 0) direction = 'TB';
    var stageHeight = doc.height || parseInt(pre.dataset.height, 10) || CFG.stageHeight;

    var root = el('div', 'nm-root');
    root.setAttribute('data-nm-direction', direction);

    var bar = el('div', 'nm-bar');
    var titleBox = el('div', 'nm-bar-title');
    titleBox.appendChild(icon('flow', 'nm-bar-icon'));
    titleBox.appendChild(el('span', 'nm-bar-text', title));
    var counter = el('span', 'nm-bar-count', doc.nodes.length + ' devices - ' + doc.links.length + ' links');
    titleBox.appendChild(counter);

    var tools = el('div', 'nm-bar-tools');
    var searchWrap = el('label', 'nm-search');
    searchWrap.appendChild(icon('search'));
    var search = el('input', 'nm-search-input');
    search.type = 'search';
    search.placeholder = 'Search…';
    search.setAttribute('aria-label', 'Search devices');
    searchWrap.appendChild(search);
    tools.appendChild(searchWrap);

    bar.append(titleBox, tools);

    var stage = el('div', 'nm-stage');
    stage.style.height = stageHeight + 'px';
    var canvas = el('div', 'nm-canvas');
    var layer = el('div', 'nm-layer');
    var panel = el('aside', 'nm-panel');
    panel.setAttribute('aria-live', 'polite');
    var legend = el('div', 'nm-legend');
    var hint = el('div', 'nm-hint',
      'Click a device for details - hold Ctrl and scroll to zoom');
    var mark = authorMark();
    stage.append(canvas, layer, legend, panel, hint);
    if (mark) stage.appendChild(mark);

    root.append(bar, stage);
    pre.insertAdjacentElement('afterend', root);

    var view = {};       // id -> { node, el, cy }
    doc.nodes.forEach(function (n) {
      var t = TYPES[n.type] || TYPES.device;
      var card = el('div', 'nm-node nm-type-' + n.type + (n.auto ? ' is-auto' : ''));
      card.style.setProperty('--nm-accent', n.color || t.color);
      card.style.width = CFG.nodeWidth + 'px';

      var ic = el('span', 'nm-node-icon');
      ic.appendChild(icon(t.icon));
      var body = el('span', 'nm-node-body');
      body.appendChild(el('span', 'nm-node-name', n.name));
      if (n.info) body.appendChild(el('span', 'nm-node-meta', n.info));
      card.append(ic, body);
      if (n.tag) card.appendChild(el('span', 'nm-node-tag', n.tag));

      layer.appendChild(card);
      view[n.id] = { node: n, el: card, cy: null };
    });

    // the layer is still at scale(1), so offsetHeight is the model height
    doc.nodes.forEach(function (n) {
      var h = view[n.id].el.offsetHeight;
      view[n.id].h = h > 40 ? h : CFG.nodeHeightFallback;
    });

    var labels = [];     // { link, portA, portB, desc }
    doc.links.forEach(function (l) {
      var entry = { link: l, portA: null, portB: null, desc: null };

      if (l.sourcePort) {
        entry.portA = el('span', 'nm-port', l.sourcePort);
        layer.appendChild(entry.portA);
      }
      if (l.targetPort) {
        entry.portB = el('span', 'nm-port', l.targetPort);
        layer.appendChild(entry.portB);
      }

      var descText = l.label || (l.vlan ? 'VLAN ' + l.vlan : '');
      if (descText || l.speed || (l.vlan && l.label)) {
        var d = el('span', 'nm-elabel');
        if (descText) d.appendChild(el('span', 'nm-elabel-text', descText));
        if (l.vlan && l.label) d.appendChild(el('span', 'nm-chip', 'VLAN ' + l.vlan));
        if (l.speed) d.appendChild(el('span', 'nm-chip nm-chip-speed', l.speed));
        if (l.color) d.style.setProperty('--nm-accent', l.color);
        layer.appendChild(d);
        entry.desc = d;
      }
      labels.push(entry);
    });

    var elements = [];
    doc.nodes.forEach(function (n) {
      elements.push({
        data: { id: n.id, w: CFG.nodeWidth, h: view[n.id].h, kind: 'node' }
      });
    });
    doc.links.forEach(function (l) {
      elements.push({
        data: {
          id: l.id, source: l.source, target: l.target,
          cpw: [0.5], cpd: [l.shift || 0], turn: '50%',
          color: l.color || undefined
        }
      });
    });

    var dark = isDark();
    var cy = cytoscape({
      container: canvas,
      elements: elements,
      style: buildStylesheet(dark),
      layout: { name: 'preset' },
      minZoom: CFG.minZoom,
      maxZoom: CFG.maxZoom,
      boxSelectionEnabled: false,
      selectionType: 'single',
      autoungrabify: false
    });

    doc.nodes.forEach(function (n) { view[n.id].cy = cy.getElementById(n.id); });
    doc.links.forEach(function (l) {
      var e = cy.getElementById(l.id);
      if (l.source === l.target) e.addClass('nm-loop');
      if (l.style === 'dashed') e.addClass('nm-dashed');
      if (l.style === 'dotted') e.addClass('nm-dotted');
      if (l.arrowTarget) e.addClass('nm-arrow-t');
      if (l.arrowSource) e.addClass('nm-arrow-s');
      if (l.color) e.addClass('nm-custom');
      l.cy = e;
    });

    if (doc.legend) {
      var used = Object.create(null);
      doc.nodes.forEach(function (n) { used[n.type] = (used[n.type] || 0) + 1; });
      var list = el('div', 'nm-legend-items');
      Object.keys(TYPES).forEach(function (t) {
        if (!used[t]) return;
        var item = el('span', 'nm-legend-item');
        item.style.setProperty('--nm-accent', TYPES[t].color);
        item.appendChild(icon(TYPES[t].icon));
        item.appendChild(el('span', null, TYPES[t].label + ' (' + used[t] + ')'));
        list.appendChild(item);
      });
      legend.appendChild(list);
    } else {
      legend.remove();
    }

    var neighbours = Object.create(null);
    doc.links.forEach(function (l) {
      (neighbours[l.source] || (neighbours[l.source] = [])).push({ link: l, peer: l.target, near: l.sourcePort, far: l.targetPort });
      if (l.target !== l.source) {
        (neighbours[l.target] || (neighbours[l.target] = [])).push({ link: l, peer: l.source, near: l.targetPort, far: l.sourcePort });
      }
    });

    function fillPanel(id) {
      var n = doc.byId[id];
      if (!n) return;
      var t = TYPES[n.type] || TYPES.device;
      panel.innerHTML = '';

      var head = el('div', 'nm-panel-head');
      var badge = el('span', 'nm-panel-icon');
      badge.style.setProperty('--nm-accent', n.color || t.color);
      badge.appendChild(icon(t.icon));
      var headText = el('div', 'nm-panel-headtext');
      headText.appendChild(el('div', 'nm-panel-name', n.name));
      headText.appendChild(el('div', 'nm-panel-type', t.label));
      head.append(badge, headText);
      head.appendChild(button('close', 'Close panel', function () { clearSelection(); }, 'nm-btn-ghost nm-panel-close'));
      panel.appendChild(head);

      var meta = el('div', 'nm-panel-meta');
      if (n.info) meta.appendChild(metaRow('Address / info', n.info, true));
      if (n.tag) meta.appendChild(metaRow('Role', n.tag));
      if (n.note) meta.appendChild(metaRow('Note', n.note));
      meta.appendChild(metaRow('ID', n.id, true));
      panel.appendChild(meta);

      var conns = neighbours[id] || [];
      panel.appendChild(el('div', 'nm-panel-section', 'Links (' + conns.length + ')'));
      var ul = el('ul', 'nm-conn-list');
      conns.forEach(function (c) {
        var peer = doc.byId[c.peer];
        var pt = TYPES[peer.type] || TYPES.device;
        var li = el('li', 'nm-conn');
        var link = el('button', 'nm-conn-btn');
        link.type = 'button';
        var pi = el('span', 'nm-conn-icon');
        pi.style.setProperty('--nm-accent', peer.color || pt.color);
        pi.appendChild(icon(pt.icon));
        var txt = el('span', 'nm-conn-text');
        txt.appendChild(el('span', 'nm-conn-peer', peer.name));
        var ports = el('span', 'nm-conn-ports');
        ports.appendChild(el('code', 'nm-port-inline', c.near || '—'));
        ports.appendChild(el('span', 'nm-conn-arrow', '→'));
        ports.appendChild(el('code', 'nm-port-inline', c.far || '—'));
        txt.appendChild(ports);
        if (c.link.label || c.link.vlan || c.link.speed || c.link.note) {
          var extra = [c.link.label, c.link.vlan ? 'VLAN ' + c.link.vlan : '', c.link.speed, c.link.note]
            .filter(Boolean).join(' · ');
          txt.appendChild(el('span', 'nm-conn-desc', extra));
        }
        link.append(pi, txt);
        link.addEventListener('click', function () { selectNode(c.peer, true); });
        li.appendChild(link);
        ul.appendChild(li);
      });
      panel.appendChild(ul);

      if (n.url) {
        var a = el('a', 'nm-panel-link', 'Open device page');
        a.href = n.url;
        panel.appendChild(a);
      }
      panel.classList.add('is-open');
    }

    function metaRow(label, value, mono) {
      var row = el('div', 'nm-meta-row');
      row.appendChild(el('span', 'nm-meta-label', label));
      row.appendChild(el('span', 'nm-meta-value' + (mono ? ' is-mono' : ''), value));
      return row;
    }

    if (doc.table && doc.links.length) {
      var details = el('details', 'nm-table');
      details.appendChild(el('summary', 'nm-table-summary', 'Link list (' + doc.links.length + ')'));
      var table = el('table', 'nm-table-el');
      var thead = el('thead');
      var hr = el('tr');
      ['Device A', 'Port A', 'Device B', 'Port B', 'Description', 'VLAN', 'Speed'].forEach(function (h) {
        hr.appendChild(el('th', null, h));
      });
      thead.appendChild(hr);
      var tbody = el('tbody');
      doc.links.forEach(function (l) {
        var tr = el('tr');
        [
          doc.byId[l.source].name, l.sourcePort || '—',
          doc.byId[l.target].name, l.targetPort || '—',
          l.label || '—', l.vlan || '—', l.speed || '—'
        ].forEach(function (v, i) {
          var td = el('td', (i === 1 || i === 3) ? 'is-mono' : null, v);
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
      table.append(thead, tbody);
      details.appendChild(table);
      root.appendChild(details);
    }

    if (doc.warnings.length) {
      var box = el('div', 'nm-warnings');
      box.appendChild(el('div', 'nm-warnings-title', 'Network map - syntax notes (' + doc.warnings.length + ')'));
      var wl = el('ul');
      doc.warnings.forEach(function (w) { wl.appendChild(el('li', null, w)); });
      box.appendChild(wl);
      root.appendChild(box);
    }

    // --- HTML layer above the canvas ---
    var frame = null, timer = null;
    function syncTransform() {
      var pan = cy.pan(), z = cy.zoom();
      layer.style.transform = 'translate(' + pan.x + 'px,' + pan.y + 'px) scale(' + z + ')';
      layer.classList.toggle('is-tiny', z < CFG.hideDescZoom);
      layer.classList.toggle('is-micro', z < CFG.hidePortZoom);
    }

    function endpointOf(edge, which) {
      var p = null;
      try {
        p = finitePoint(which === 'source' ? edge.sourceEndpoint() : edge.targetEndpoint());
      } catch (e) { p = null; }
      if (p) return p;
      var self = which === 'source' ? edge.source() : edge.target();
      var other = which === 'source' ? edge.target() : edge.source();
      return borderPoint(self.position(), other.position(), self.width(), self.height());
    }

    function midOf(edge, s, t) {
      var p = null;
      try { p = finitePoint(edge.midpoint()); } catch (e) { p = null; }
      return p || { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 };
    }

    function syncGeometry() {
      doc.nodes.forEach(function (n) {
        var v = view[n.id];
        var p = v.cy.position();
        v.el.style.left = p.x + 'px';
        v.el.style.top = p.y + 'px';
      });

      var obstacles = doc.nodes.map(function (n) {
        var v = view[n.id], p = v.cy.position();
        return rectAt(p.x, p.y, CFG.nodeWidth, v.h, 4);
      });

      var items = [];
      labels.forEach(function (entry) {
        var l = entry.link;
        var edge = l.cy;
        var s = endpointOf(edge, 'source');
        var t = endpointOf(edge, 'target');
        var m = midOf(edge, s, t);

        // the edge midpoint as a reference: a port label that has to give way
        // travels into its own line rather than along the tangent of the card
        if (entry.portA) items.push(portItem(entry.portA, s, view[l.source], m, 2));
        if (entry.portB) items.push(portItem(entry.portB, t, view[l.target], m, 2));

        if (entry.desc) {
          var dx = t.x - s.x, dy = t.y - s.y;
          var len = Math.hypot(dx, dy) || 1;
          items.push({
            el: entry.desc,
            x: m.x, y: m.y,
            w: entry.desc.offsetWidth, h: entry.desc.offsetHeight,
            dir: { x: dx / len, y: dy / len },
            priority: 1
          });
        }
      });

      placeLabels(items, obstacles);
    }

    function portItem(node, point, ownerView, toward, priority) {
      var center = ownerView.cy.position();
      var dx = point.x - center.x, dy = point.y - center.y;
      var len = Math.hypot(dx, dy) || 1;
      // "away from the card" — this is what lifts the label off the device border
      var dir = { x: dx / len, y: dy / len };
      var w = node.offsetWidth, h = node.offsetHeight;
      var clear = 7 + (w / 2) * Math.abs(dir.x) + (h / 2) * Math.abs(dir.y);

      // "into the line" — the direction the label escapes a collision along; on
      // an edge bent into an arc it tracks the curve better than a card radius
      var slide = dir;
      var sx = toward ? toward.x - point.x : 0, sy = toward ? toward.y - point.y : 0;
      var sl = Math.hypot(sx, sy);
      if (sl > 1) slide = { x: sx / sl, y: sy / sl };

      return {
        el: node,
        x: point.x + dir.x * clear,
        y: point.y + dir.y * clear,
        w: w, h: h, dir: dir, slide: slide, slots: PORT_SLOTS,
        limit: Math.max(0, sl - clear), priority: priority
      };
    }

    // the graph boundingBox() can come back infinite on the first frame, before
    // the renderer projects the curves, so derive the card box from positions
    function nodesBox() {
      var x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
      cy.nodes().forEach(function (n) {
        var p = n.position();
        if (!isFinite(p.x) || !isFinite(p.y)) return;
        var hw = n.width() / 2, hh = n.height() / 2;
        x1 = Math.min(x1, p.x - hw); x2 = Math.max(x2, p.x + hw);
        y1 = Math.min(y1, p.y - hh); y2 = Math.max(y2, p.y + hh);
      });
      if (!isFinite(x1) || !isFinite(x2)) return null;
      return { x1: x1, y1: y1, x2: x2, y2: y2, w: x2 - x1, h: y2 - y1 };
    }

    function fitView() {
      var bb = nodesBox();
      if (!bb) return;

      // fold in edge bows once they are known
      var all = cy.elements().boundingBox();
      if (all && isFinite(all.w) && isFinite(all.h) && all.w > 0 && all.h > 0) {
        bb = {
          x1: Math.min(bb.x1, all.x1), y1: Math.min(bb.y1, all.y1),
          x2: Math.max(bb.x2, all.x2), y2: Math.max(bb.y2, all.y2)
        };
        bb.w = bb.x2 - bb.x1;
        bb.h = bb.y2 - bb.y1;
      }

      var m = CFG.fitMargin;
      var w = Math.max(1, bb.w) + m * 2, h = Math.max(1, bb.h) + m * 2;
      var vw = cy.width(), vh = cy.height();
      if (!vw || !vh) {
        cy.resize();
        vw = cy.width();
        vh = cy.height();
      }
      if (!vw || !vh) return;

      var bottom = CFG.fitPadding;
      if (legend.isConnected) bottom = Math.max(bottom, legend.offsetHeight + 20);
      if (!hint.classList.contains('is-hidden')) bottom = Math.max(bottom, hint.offsetHeight + 20);
      if (mark) bottom = Math.max(bottom, mark.offsetHeight + 18);

      var availW = Math.max(80, vw - CFG.fitPadding * 2);
      var availH = Math.max(80, vh - CFG.fitPadding - bottom);
      var z = Math.min(availW / w, availH / h, CFG.fitMaxZoom);
      z = Math.max(CFG.minZoom, Math.min(CFG.maxZoom, z));

      var cx = bb.x1 + bb.w / 2, cyy = bb.y1 + bb.h / 2;
      var panX = CFG.fitPadding + availW / 2 - z * cx;
      var panY = CFG.fitPadding + availH / 2 - z * cyy;
      if (!isFinite(z) || !isFinite(panX) || !isFinite(panY)) return;

      cy.viewport({ zoom: z, pan: { x: panX, y: panY } });
    }

    function runSync() {
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      if (timer) { clearTimeout(timer); timer = null; }
      syncTransform();
      syncGeometry();
    }

    // rAF is frozen in a background tab, so a timer backs it up
    function scheduleSync() {
      if (frame || timer) return;
      frame = requestAnimationFrame(runSync);
      timer = setTimeout(runSync, 120);
    }

    var orthogonal = false;

    // How much room to add so descriptions still fit on their lines. The gap
    // between ranks grows with the number of links (that is where descriptions
    // and port labels sit); the gap within a rank grows with the widest fan-out
    // as well — one host with a dozen guests spreads its rank harder than a
    // regular switch does.
    function spreadFactors() {
      if (!CFG.autoSpread) return { rank: 1, node: 1 };

      var deg = Object.create(null), fan = 0;
      doc.links.forEach(function (l) {
        deg[l.source] = (deg[l.source] || 0) + 1;
        deg[l.target] = (deg[l.target] || 0) + 1;
      });
      Object.keys(deg).forEach(function (id) { if (deg[id] > fan) fan = deg[id]; });

      var over = Math.max(0, doc.links.length - CFG.spreadFrom);
      var wide = Math.max(0, fan - CFG.fanFrom);

      return {
        rank: Math.min(CFG.spreadMax, 1 + over * CFG.spreadRank),
        node: Math.min(CFG.spreadMax, 1 + over * CFG.spreadNode + wide * CFG.fanStep)
      };
    }

    function runLayout(fit) {
      var sp = spreadFactors();
      var opts = {
        name: 'dagre',
        rankDir: direction,
        ranker: 'network-simplex',
        nodeSep: Math.round(CFG.nodeSep * sp.node),
        edgeSep: Math.round(CFG.edgeSep * sp.node),
        rankSep: Math.round(CFG.rankSep * sp.rank),
        nodeDimensionsIncludeLabels: false,
        animate: false,
        fit: false,
        padding: CFG.fitPadding,
        // dagre hands back a routed path per edge; that is what keeps lines off the cards
        useDagreEdgeControlPoints: true,
        automaticDagreEdgeStyle: false
      };

      try {
        cy.layout(opts).run();
      } catch (err) {
        console.warn('[network-map] dagre unavailable, falling back to breadthfirst', err);
        cy.layout({
          name: 'breadthfirst', directed: true,
          spacingFactor: 1.3 * sp.node, animate: false, fit: false
        }).run();
      }

      applyRouting();
      if (fit !== false) fitView();
      runSync();
      // re-fit once the renderer has projected the curves
      setTimeout(function () {
        if (fit !== false) fitView();
        runSync();
      }, 90);
    }

    function applyRouting() {
      doc.links.forEach(function (l) {
        var e = l.cy;
        if (l.source === l.target) return;

        if (orthogonal) {
          e.addClass('nm-taxi');
          var s = e.source().position(), t = e.target().position();
          var span = direction === 'LR' || direction === 'RL' ? t.x - s.x : t.y - s.y;
          var turn = 50 + (l.shift || 0) * 0.6;
          e.data('turn', Math.max(15, Math.min(85, span === 0 ? 50 : turn)) + '%');
          return;
        }

        e.removeClass('nm-taxi');
        var w = e.scratch('controlPointWeights');
        var d = e.scratch('controlPointDistances');
        if (!Array.isArray(w) || !w.length || !Array.isArray(d) || !d.length || w.length !== d.length) {
          w = [0.5];
          d = [0];
        }
        var shift = l.shift || 0;
        e.data('cpw', w.slice());
        e.data('cpd', d.map(function (v) { return v + shift; }));
      });
      cy.style().update();
    }

    var selected = null;

    function clearSelection() {
      selected = null;
      cy.elements().removeClass('is-dim is-active');
      layer.querySelectorAll('.nm-node, .nm-port, .nm-elabel').forEach(function (n) {
        n.classList.remove('is-dim', 'is-active', 'is-forced');
      });
      panel.classList.remove('is-open');
      root.classList.remove('is-focused');
    }

    function selectNode(id, keepView) {
      var v = view[id];
      if (!v) return;
      selected = id;
      var node = v.cy;
      var edges = node.connectedEdges();
      var near = edges.connectedNodes().union(node);

      cy.elements().addClass('is-dim').removeClass('is-active');
      near.removeClass('is-dim');
      edges.removeClass('is-dim').addClass('is-active');

      var nearIds = Object.create(null);
      near.forEach(function (e) { if (e.isNode()) nearIds[e.id()] = true; });
      doc.nodes.forEach(function (n) {
        var card = view[n.id].el;
        card.classList.toggle('is-dim', !nearIds[n.id]);
        card.classList.toggle('is-active', n.id === id);
      });

      var activeLinks = Object.create(null);
      edges.forEach(function (e) { activeLinks[e.id()] = true; });
      labels.forEach(function (entry) {
        var on = !!activeLinks[entry.link.id];
        [entry.portA, entry.portB, entry.desc].forEach(function (node2) {
          if (!node2) return;
          node2.classList.toggle('is-dim', !on);
          node2.classList.toggle('is-active', on);
          node2.classList.toggle('is-forced', on);
        });
      });

      root.classList.add('is-focused');
      fillPanel(id);
      hint.classList.add('is-hidden');

      if (keepView) {
        cy.animate({ center: { eles: node }, duration: 220, easing: 'ease-out' });
      } else if (cy.width() > 820) {
        // keep the selected device clear of the panel
        var limit = cy.width() - panel.offsetWidth - 26 - (node.width() * cy.zoom()) / 2;
        var rx = node.renderedPosition('x');
        if (rx > limit) cy.panBy({ x: limit - rx, y: 0 });
      }
    }

    function selectEdge(edgeId) {
      var l = doc.links.filter(function (x) { return x.id === edgeId; })[0];
      if (!l) return;
      cy.elements().addClass('is-dim').removeClass('is-active');
      l.cy.removeClass('is-dim').addClass('is-active');
      l.cy.connectedNodes().removeClass('is-dim');
      doc.nodes.forEach(function (n) {
        var on = n.id === l.source || n.id === l.target;
        view[n.id].el.classList.toggle('is-dim', !on);
        view[n.id].el.classList.toggle('is-active', on);
      });
      labels.forEach(function (entry) {
        var on = entry.link.id === l.id;
        [entry.portA, entry.portB, entry.desc].forEach(function (node2) {
          if (!node2) return;
          node2.classList.toggle('is-dim', !on);
          node2.classList.toggle('is-active', on);
          node2.classList.toggle('is-forced', on);
        });
      });
      root.classList.add('is-focused');
      hint.classList.add('is-hidden');
    }

    cy.on('tap', 'node', function (evt) { selectNode(evt.target.id(), false); });
    cy.on('tap', 'edge', function (evt) { selectEdge(evt.target.id()); });
    cy.on('tap', function (evt) { if (evt.target === cy) clearSelection(); });
    cy.on('dbltap', 'node', function (evt) {
      var n = evt.target;
      cy.animate({ fit: { eles: n.closedNeighborhood(), padding: 80 }, duration: 260, easing: 'ease-out' });
    });

    cy.on('mouseover', 'node', function () { canvas.style.cursor = 'pointer'; });
    cy.on('mouseover', 'edge', function (evt) {
      canvas.style.cursor = 'pointer';
      var entry = labels.filter(function (x) { return x.link.id === evt.target.id(); })[0];
      if (entry && entry.desc) entry.desc.classList.add('is-forced');
    });
    cy.on('mouseout', 'edge', function (evt) {
      var entry = labels.filter(function (x) { return x.link.id === evt.target.id(); })[0];
      if (entry && entry.desc && !entry.desc.classList.contains('is-active')) entry.desc.classList.remove('is-forced');
    });
    cy.on('mouseout', 'node, edge', function () { canvas.style.cursor = ''; });

    // the wheel scrolls the page, Ctrl zooms. Cytoscape never sees the event, so
    // the zoom step is ours; pinch gestures keep working
    var hintTimer = null;
    function flashHint(text) {
      hint.textContent = text;
      hint.classList.remove('is-hidden');
      clearTimeout(hintTimer);
      hintTimer = setTimeout(function () { hint.classList.add('is-hidden'); }, 2600);
    }

    var WHEEL_K = Math.log(CFG.wheelStep) / 100;   // 100 = typical deltaY of one notch

    stage.addEventListener('wheel', function (e) {
      e.stopPropagation();

      var allow = !CFG.wheelNeedsCtrl || e.ctrlKey || root.classList.contains('is-fullscreen');
      if (!allow) {
        flashHint('Hold Ctrl and scroll to zoom the map');
        return;
      }
      e.preventDefault();

      var d = e.deltaY;
      if (e.deltaMode === 1) d *= 16;        // linie
      else if (e.deltaMode === 2) d *= 400;  // strony
      if (!d) return;

      var rect = canvas.getBoundingClientRect();
      cy.zoom({
        level: Math.max(CFG.minZoom, Math.min(CFG.maxZoom, cy.zoom() * Math.exp(-d * WHEEL_K))),
        renderedPosition: { x: e.clientX - rect.left, y: e.clientY - rect.top }
      });
      scheduleSync();
    }, { capture: true, passive: false });

    cy.on('pan zoom', syncTransform);
    cy.on('position', 'node', scheduleSync);
    cy.on('drag', 'node', scheduleSync);

    function zoomBy(f) {
      cy.zoom({
        level: Math.max(CFG.minZoom, Math.min(CFG.maxZoom, cy.zoom() * f)),
        renderedPosition: { x: cy.width() / 2, y: cy.height() / 2 }
      });
      scheduleSync();
    }

    tools.appendChild(button('minus', 'Zoom out', function () { zoomBy(1 / CFG.buttonStep); }));
    tools.appendChild(button('plus', 'Zoom in', function () { zoomBy(CFG.buttonStep); }));
    tools.appendChild(button('fit', 'Fit to view', function () {
      fitView();
      scheduleSync();
    }));
    tools.appendChild(button('refresh', 'Re-run layout', function () { runLayout(true); }));

    var horizontal = (direction === 'LR' || direction === 'RL');
    var dirBtn = button(horizontal ? 'orgH' : 'orgV', 'Layout: ' + (horizontal ? 'horizontal' : 'vertical') + ' (click to switch)', function () {
      horizontal = !horizontal;
      direction = horizontal ? 'LR' : 'TB';
      root.setAttribute('data-nm-direction', direction);
      dirBtn.innerHTML = '';
      dirBtn.appendChild(icon(horizontal ? 'orgH' : 'orgV'));
      dirBtn.title = 'Layout: ' + (horizontal ? 'horizontal' : 'vertical') + ' (click to switch)';
      runLayout(true);
    });
    tools.appendChild(dirBtn);

    var routeBtn = button('angle', 'Edge routing: orthogonal', function () {
      orthogonal = !orthogonal;
      routeBtn.innerHTML = '';
      routeBtn.appendChild(icon(orthogonal ? 'curve' : 'angle'));
      routeBtn.classList.toggle('is-on', orthogonal);
      routeBtn.title = 'Edge routing: ' + (orthogonal ? 'smooth curves' : 'orthogonal');
      applyRouting();
      scheduleSync();
      setTimeout(scheduleSync, 90);
    });
    tools.appendChild(routeBtn);

    var labelsBtn = button('tag', 'Hide link descriptions', function () {
      layer.classList.toggle('is-labels-off');
      var off = layer.classList.contains('is-labels-off');
      labelsBtn.classList.toggle('is-on', !off);
      labelsBtn.title = off ? 'Show link descriptions' : 'Hide link descriptions';
    }, 'is-on');
    tools.appendChild(labelsBtn);

    // a transformed Wiki.js theme container can trap position: fixed
    var fsAnchor = null;
    function moveToBody() {
      if (fsAnchor || !root.parentNode) return;
      fsAnchor = document.createComment('network-map');
      root.parentNode.insertBefore(fsAnchor, root);
      document.body.appendChild(root);
    }
    function moveBack() {
      if (!fsAnchor || !fsAnchor.parentNode) { fsAnchor = null; return; }
      fsAnchor.parentNode.insertBefore(root, fsAnchor);
      fsAnchor.parentNode.removeChild(fsAnchor);
      fsAnchor = null;
    }

    var fsBtn = button('expand', 'Fullscreen', function () {
      var on = !root.classList.contains('is-fullscreen');
      if (on) moveToBody(); else moveBack();
      root.classList.toggle('is-fullscreen', on);
      document.body.classList.toggle('nm-noscroll', on);
      fsBtn.innerHTML = '';
      fsBtn.appendChild(icon(on ? 'collapse' : 'expand'));
      fsBtn.title = on ? 'Exit fullscreen' : 'Fullscreen';
      stage.style.height = on ? '' : stageHeight + 'px';
      requestAnimationFrame(function () {
        cy.resize();
        fitView();
        scheduleSync();
      });
    });
    tools.appendChild(fsBtn);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (root.classList.contains('is-fullscreen')) fsBtn.click();
      else if (selected) clearSelection();
    });

    search.addEventListener('input', function () {
      var q = search.value.trim().toLowerCase();
      if (!q) {
        doc.nodes.forEach(function (n) { view[n.id].el.classList.remove('is-dim', 'is-match'); });
        if (!selected) cy.elements().removeClass('is-dim');
        return;
      }
      clearSelection();
      var hits = 0;
      doc.nodes.forEach(function (n) {
        var hay = [n.name, n.info, n.id, n.tag, n.note, (TYPES[n.type] || {}).label].join(' ').toLowerCase();
        var hit = hay.indexOf(q) >= 0;
        if (hit) hits++;
        view[n.id].el.classList.toggle('is-match', hit);
        view[n.id].el.classList.toggle('is-dim', !hit);
        view[n.id].cy.toggleClass('is-dim', !hit);
      });
      cy.edges().addClass('is-dim');
      if (!hits) doc.nodes.forEach(function (n) { view[n.id].el.classList.remove('is-dim'); });
    });

    function applyTheme() {
      var d = isDark();
      root.classList.toggle('is-dark', d);
      var c = edgeColors(d);
      cy.style()
        .selector('edge').style({ 'line-color': c.base, 'target-arrow-color': c.base, 'source-arrow-color': c.base })
        .selector('edge.nm-custom').style({ 'line-color': 'data(color)', 'target-arrow-color': 'data(color)', 'source-arrow-color': 'data(color)' })
        .selector('.is-dim').style({ 'opacity': c.muted })
        .selector('edge.is-active').style({ 'line-color': c.active, 'target-arrow-color': c.active, 'source-arrow-color': c.active, 'opacity': 1 })
        .update();
    }
    applyTheme();

    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
    if (document.body) {
      new MutationObserver(applyTheme).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    document.addEventListener('visibilitychange', function () {
      if (!document.hidden) scheduleSync();
    });

    if (typeof ResizeObserver === 'function') {
      var ro = new ResizeObserver(function () {
        cy.resize();
        scheduleSync();
      });
      ro.observe(stage);
    } else {
      window.addEventListener('resize', function () { cy.resize(); scheduleSync(); });
    }

    root.__nm = {
      cy: cy, doc: doc, view: view,
      fitView: fitView, layout: runLayout,
      select: selectNode, clear: clearSelection
    };

    runLayout(true);
    setTimeout(function () { hint.classList.add('is-hidden'); }, 7000);
    // webfonts can change label metrics
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(scheduleSync);
  }


  function renderOne(pre) {
    if (pre.dataset.nmDone === '1') return;
    pre.dataset.nmDone = '1';
    try {
      build(pre);
    } catch (err) {
      console.error('[network-map]', err);
      var box = el('div', 'nm-error');
      box.appendChild(el('div', 'nm-error-title', 'Could not render the network map'));
      box.appendChild(el('pre', 'nm-error-msg', String(err && err.message ? err.message : err)));
      pre.insertAdjacentElement('afterend', box);
    }
  }

  function init() {
    if (typeof window.cytoscape !== 'function') {
      console.warn('[network-map] Cytoscape.js is not loaded.');
      return;
    }
    if (window.cytoscapeDagre && !window.__nmDagreRegistered) {
      try { window.cytoscapeDagre(window.cytoscape); } catch (e) { /* already registered */ }
      window.__nmDagreRegistered = true;
    }
    document.querySelectorAll('pre.network-map:not([data-nm-done])').forEach(renderOne);
  }

  window.NetworkMap = {
    parse: parseSource,
    types: TYPES,
    aliases: ALIASES,
    config: CFG,
    refresh: function () { document.querySelectorAll('pre.network-map:not([data-nm-done])').forEach(renderOne); }
  };

  var pending = false;
  function schedule() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; init(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule);
  }
  if (document.body) {
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener('DOMContentLoaded', function () {
      new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    });
  }
  schedule();
})();
