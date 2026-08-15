# Network infrastructure map — syntax

*[🇵🇱 Opis składni](../pl/SKLADNIA.md) · [🇬🇧 Syntax](SYNTAX.md) · [← Repository home](../README.md)*

You can paste this file into your own wiki as a help page.

A map is one HTML block. In the Markdown editor you write:

```html
<pre class="network-map" data-title="Head office network">
node router "MikroTik RB5009" router ip=192.168.1.1
node sw01   "Cisco SW-01"     switch ip=192.168.243.2

router:ether1 -> sw01:Gi1/0/48 "Uplink" speed=10G vlan=243
</pre>
```

Everything inside the block is plain text — one line per map element.
Blank lines and lines starting with `#`, `//` or `;` are ignored.

---

## 1. Devices

```
node <id> "<Name>" [type] ["Address / info"] [key=value ...]
```

| Part | Meaning |
|---|---|
| `<id>` | short identifier used by links (letters, digits, `_`, `.`, `-`) |
| `"<Name>"` | name shown on the card |
| `type` | icon and colour — list below (defaults to `device`) |
| `"Address / info"` | second line on the card, usually an IP address |

Additional attributes:

| Attribute | Effect |
|---|---|
| `ip=` / `info=` | same as the fourth argument (address / info) |
| `tag=` | small corner badge, e.g. `tag="rack A"`, `tag=core` |
| `note=` | note shown in the details panel |
| `url=` | link to the wiki page for that device (button in the panel) |
| `color=` | override the accent colour, e.g. `color=#dc2626` |
| `type=` | alternative way to give the type |

```
node sw01 "Cisco C9200-48P" switch ip=192.168.243.2 tag="rack A" note="48x1G PoE + 4x SFP+" url="/network/sw01"
node pve01 "Proxmox PVE-01" hypervisor ip=192.168.243.10
node unknown1 "Something in the rack"
```

### Available types

`internet` `cloud` `router` `gateway` `firewall` `switch` `patchpanel` `wifi`
`server` `hypervisor` `vm` `nas` `storage` `computer` `laptop` `printer`
`phone` `display` `camera` `nvr` `alarm` `firepanel` `sensor` `ups` `device`

Common abbreviations work as aliases, among others:
`ap` / `wlan` → `wifi`, `sw` → `switch`, `fw` / `utm` → `firewall`,
`pve` / `proxmox` / `esxi` → `hypervisor`, `cam` / `cctv` → `camera`,
`dvr` / `recorder` → `nvr`, `pc` / `workstation` → `computer`,
`modem` / `ont` → `gateway`, `fire` → `firepanel`, `intruder` → `alarm`,
`iot` / `probe` → `sensor`, `pdu` / `power` → `ups`.

An unknown type does not stop rendering — the device gets the generic icon and
the map reports a note.

---

## 2. Links and ports

The clearest form puts the port after a colon on each device:

```
<deviceA>:<portA> -> <deviceB>:<portB> "<Description>" [key=value ...]
```

```
router:ether1 -> sw01:Gi1/0/48 "Uplink to rack A" speed=10G vlan=243
sw01:Gi1/0/2  -> pve01:eno1    "Virtualisation hosts" vlan=243
```

A port containing spaces goes in quotes **directly after the colon**:

```
internet:"Carrier ONT port" -> router:ether1 "WAN"
```

The arrow is optional and only affects the look:

| Notation | Effect |
|---|---|
| `--` or nothing | plain line, no arrowheads (recommended for LANs) |
| `->` | arrowhead at the target device |
| `<->` | arrowheads on both ends |

You can also prefix the line with `link`, which additionally enables the
positional form (kept for compatibility with older maps):

```
link router sw01 "Trunk VLAN 243" "ether1" "Gi1/0/48"
       │     │          │            │          └─ port on the target side
       │     │          │            └──────────── port on the source side
       │     │          └───────────────────────── link description
       └─────┴──────────────────────────────────── device identifiers
```

Link attributes:

| Attribute | Effect |
|---|---|
| `vlan=243` | a "VLAN 243" badge next to the description |
| `speed=10G` | a bandwidth badge |
| `style=dashed` \| `dotted` \| `solid` | line style (e.g. a backup link) |
| `color=#f59e0b` | custom line colour |
| `note=` | extra text in the details panel |
| `label="…"` | description (alternative to the quoted text) |
| `porta=` / `portb=` | ports, if you prefer not to use the colon notation |

```
router:ether3 -> sw02:Gi1/0/47 "Backup link" style=dashed color=#f59e0b
link ups01 sw01 label="Management" porta=LAN portb=Gi1/0/24 vlan=99
```

---

## 3. Whole-map settings

Put these anywhere in the block:

| Line | Meaning |
|---|---|
| `title "Map name"` | title in the toolbar (alternative to `data-title` on `<pre>`) |
| `direction TB` | vertical layout (default); `LR` = horizontal, `BT`, `RL` |
| `height 700` | map height in pixels (260–2000) |
| `legend off` | hide the type legend |
| `table off` | hide the collapsible link list below the map |

Or on the tag itself:
`<pre class="network-map" data-title="…" data-direction="LR" data-height="760">`

---

## 4. What the rendered map gives you

* **Click a device** — highlights its links and opens a panel listing
  "local port → remote port" with descriptions, VLANs and notes.
* **Click a line** — highlights that link alone.
* **Double-click a device** — zooms to its immediate neighbourhood.
* **Search** — by name, IP, identifier, role and type.
* **Toolbar** — zoom, fit, re-run layout, switch vertical/horizontal, switch
  smooth/orthogonal lines, hide descriptions, fullscreen.
* **Ctrl + mouse wheel** — zoom (without Ctrl the page scrolls normally).
* **Link list** under the map — good for printing and for screen readers.
* **Syntax notes** — the map reports typos itself: unknown type, undefined
  device and, most usefully, **the same port used by two links**.

---

## 5. Complete example

```html
<pre class="network-map">
title "Infrastructure – head office"
height 700

# --- network edge ---
node internet "Internet"        internet info="1 Gb/s fibre"
node router   "MikroTik RB5009" router   ip=192.168.1.1 tag=core url="/network/rb5009"
node firewall "Edge firewall"   firewall ip=192.168.1.2 tag=edge

# --- core ---
node sw01 "Cisco SW-01" switch ip=192.168.243.2 tag="rack A" note="48x1G PoE"
node sw02 "Cisco SW-02" switch ip=192.168.243.3 tag="rack B"

# --- services and endpoints ---
node pve01 "Proxmox PVE-01"    hypervisor ip=192.168.243.10
node nas01 "NAS server"        nas        ip=192.168.243.20
node ap01  "UniFi AP-01"       wifi       ip=192.168.243.30
node cam01 "CCTV camera lobby" camera     ip=192.168.66.10
node nvr01 "NVR recorder"      nvr        ip=192.168.66.2
node ups01 "UPS APC 3000"      ups        ip=192.168.243.90

internet:"ONT port" -> router:ether1  "WAN"          speed=1G
router:ether2       -> firewall:WAN   "Edge uplink"  speed=1G
firewall:LAN1       -> sw01:Gi1/0/1   "Trunk"        vlan=243 speed=10G
sw01:Gi1/0/48       -> sw02:Gi1/0/48  "Stack uplink" speed=10G
sw01:Gi1/0/2        -> pve01:eno1     "Hosts"        vlan=243
sw01:Gi1/0/3        -> nas01:LAN1     "Storage"      vlan=243 speed=10G
sw01:Gi1/0/4        -> ap01:eth0      "AP trunk"     vlan=243
sw02:Gi1/0/10       -> cam01:LAN      "CCTV"         vlan=66
sw02:Gi1/0/11       -> nvr01:LAN1     "CCTV"         vlan=66
router:ether3       -> sw02:Gi1/0/47  "Backup link"  style=dashed
ups01:LAN           -> sw01:Gi1/0/24  "Management"   vlan=99
</pre>
```

---

Installation and configuration: [README.md](README.md).
A form-based editor for all of the above: [builder.html](../builder.html).
