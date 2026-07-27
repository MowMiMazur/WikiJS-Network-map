# Network map — test page

> Paste the **whole** contents of this file into a new Wiki.js page in **Markdown**
> mode (e.g. `/test/network-map`) and save. Each section exercises a different part
> of the renderer. The checklist is at the end.

---

## Test 1 — legacy positional syntax

A map written as `link a b "description" "portA" "portB"`. It should render and
**report 2 notes about reused ports** (`ether2`, `Gi10`) underneath.

<pre class="network-map" data-title="Head office network">
node internet "Internet" cloud "Main uplink"
node router "MikroTik RB5009" router "192.168.1.1"
node firewall "Edge firewall" firewall "LAN gateway"
node sw01 "Cisco SW-01" switch "192.168.243.2"
node pve01 "Proxmox PVE-01" hypervisor "192.168.243.10"
node nas01 "NAS server" nas "192.168.243.20"
node ap01 "UniFi AP-01" wifi "192.168.243.30"
node cam01 "CCTV camera" camera "192.168.66.10"

link internet router "WAN" "Carrier port" "ether1"
link router firewall "WAN link" "ether2" "WAN"
link firewall sw01 "Trunk VLAN 243" "LAN" "Gi10"
link sw01 pve01 "VLAN 243" "Gi1" "eno1"
link sw01 nas01 "VLAN 243" "Gi2" "LAN1"
link sw01 ap01 "Trunk" "Gi3" "LAN"
link sw01 cam01 "VLAN 66" "Gi4" "LAN"
link router sw01 "Trunk VLAN 243" "ether2" "Gi10"
</pre>

---

## Test 2 — modern syntax, ports on both ends

The main port-labelling test. Note the backup link `ether3 → Gi1/0/47`, which
**curves around** the devices sitting in the middle of the map.

<pre class="network-map">
title "Infrastructure – head office"
height 720

# --- network edge ---
node internet "Internet"        internet info="1 Gb/s fibre"
node router   "MikroTik RB5009" router   ip=192.168.1.1 tag=core note="RouterOS 7.14, 2x SFP+"
node firewall "Edge firewall"   firewall ip=192.168.1.2 tag=edge

# --- core ---
node sw01 "Cisco SW-01" switch ip=192.168.243.2 tag="rack A" note="48x 1G PoE + 4x SFP+"
node sw02 "Cisco SW-02" switch ip=192.168.243.3 tag="rack B"

# --- services ---
node pve01 "Proxmox PVE-01" hypervisor ip=192.168.243.10
node nas01 "NAS server"     nas        ip=192.168.243.20

# --- endpoints ---
node ap01  "UniFi AP-01"       wifi   ip=192.168.243.30
node ap02  "UniFi AP-02"       wifi   ip=192.168.243.31
node cam01 "CCTV camera lobby" camera ip=192.168.66.10
node nvr01 "NVR recorder"      nvr    ip=192.168.66.2
node ups01 "UPS APC 3000"      ups    ip=192.168.243.90

internet:"ONT port" -> router:ether1  "WAN"           speed=1G
router:ether2       -> firewall:WAN   "Edge uplink"   speed=1G
firewall:LAN1       -> sw01:Gi1/0/1   "Trunk"         vlan=243 speed=10G
sw01:Gi1/0/48       -> sw02:Gi1/0/48  "Stack uplink"  speed=10G
sw01:Gi1/0/2        -> pve01:eno1     "Hosts"         vlan=243
sw01:Gi1/0/3        -> nas01:LAN1     "Storage"       vlan=243 speed=10G
sw01:Gi1/0/4        -> ap01:eth0      "AP trunk"      vlan=243
sw02:Gi1/0/4        -> ap02:eth0      "AP trunk"      vlan=243
sw02:Gi1/0/10       -> cam01:LAN      "CCTV"          vlan=66
sw02:Gi1/0/11       -> nvr01:LAN1     "CCTV"          vlan=66
router:ether3       -> sw02:Gi1/0/47  "Backup link"   style=dashed
ups01:LAN           -> sw01:Gi1/0/24  "Management"    vlan=99
</pre>

---

## Test 3 — horizontal layout and line styles

Exercises `direction LR`, arrowheads, dashed and dotted lines, and a custom colour.

<pre class="network-map">
title "DMZ – link types"
direction LR
height 520

node fw     "UTM firewall"   firewall ip=10.0.0.1
node dmz    "DMZ switch"     switch   ip=10.0.9.1
node web    "Web server"     server   ip=10.0.9.10
node mail   "Mail server"    server   ip=10.0.9.11
node backup "Backup storage" storage  ip=10.0.9.90

fw:Gi0/2    -> dmz:Gi1/0/1  "DMZ trunk"           vlan=9 speed=10G
dmz:Gi1/0/2 -- web:eno1     "No arrowhead"        vlan=9
dmz:Gi1/0/3 <-> mail:eno1   "Arrowheads both ends" vlan=9
web:eno2    -> backup:LAN1  "Nightly replication" style=dashed color=#f59e0b
mail:eno2   -> backup:LAN2  "Nightly replication" style=dotted color=#f59e0b
</pre>

---

## Test 4 — parallel links (LAG / EtherChannel)

Three separate lines between the same pair of devices **must not overlap**, and
all 6 port labels have to stay visible.

<pre class="network-map">
title "LAG aggregation between racks"
height 460
legend off

node sw_a "Switch rack A" switch ip=10.10.0.2 tag="rack A"
node sw_b "Switch rack B" switch ip=10.10.0.3 tag="rack B"

sw_a:Gi1/0/49 -- sw_b:Gi1/0/49 "LAG1 – member 1" speed=10G
sw_a:Gi1/0/50 -- sw_b:Gi1/0/50 "LAG1 – member 2" speed=10G
sw_a:Gi1/0/51 -- sw_b:Gi1/0/51 "LAG1 – member 3" speed=10G
</pre>

---

## Test 5a — device types: network edge and server room

Check that every icon and colour matches its type (legend in the bottom-left
corner). Note the ports with spaces: `"ONT port"`, `"Controller A"`, `"IPsec tunnel"`.

<pre class="network-map">
title "Device types – edge and server room"
height 700

node net   "Internet"           internet   info="2x 1 Gb/s"
node az    "Azure cloud"        cloud      info="IPsec tunnel"
node gw    "ONT modem"          gateway    ip=10.0.0.254
node fw    "UTM firewall"       firewall   ip=10.0.0.1
node core  "Core switch"        switch     ip=10.0.0.2 tag="rack A"
node patch "Patch panel 24p"    patchpanel tag="rack A"
node srv   "Dell R650"          server     ip=10.0.10.5
node hv    "Proxmox PVE-02"     hypervisor ip=10.0.10.6
node vm    "VM: AD controller"  vm         ip=10.0.10.11
node nas   "QNAP TS-873"        nas        ip=10.0.10.31
node san   "MD2412 array"       storage    ip=10.0.10.30
node ups   "UPS APC 3000"       ups        ip=10.0.10.90
node other "Undocumented unit"  device

net:"ONT port"     -> gw:WAN              "Carrier uplink" speed=1G
gw:LAN             -> fw:WAN              "Edge"           speed=1G
az:"IPsec tunnel"  -> fw:VPN              "Cloud VPN"      style=dashed
fw:LAN1            -> core:Gi1/0/1        "Trunk"          vlan=10 speed=10G
core:Gi1/0/2       -> patch:"Port 1"      "Patching"
core:Gi1/0/3       -> srv:eno1            "Servers"        vlan=10 speed=10G
core:Gi1/0/4       -> hv:eno1             "Virtualisation" vlan=10 speed=10G
hv:vmbr0           -> vm:net0             "Bridge"         vlan=10
core:Gi1/0/5       -> nas:LAN1            "Backups"        vlan=10
core:Gi1/0/6       -> san:"Controller A"  "Storage"        vlan=10 speed=10G
core:Gi1/0/23      -> other:ETH           "Undocumented"
core:Gi1/0/24      -> ups:LAN             "Management"     vlan=99
</pre>

---

## Test 5b — device types: CCTV, building systems, office

<pre class="network-map">
title "Device types – CCTV and office"
height 620

node acc   "Access switch"      switch     ip=10.0.20.2 tag="rack B"
node ap    "Access point"       wifi       ip=10.0.20.30
node lap   "Service laptop"     laptop
node patch "Office patch panel" patchpanel tag="rack B"
node pc    "Security desk PC"   computer   ip=10.0.20.15
node prn   "HP M479 printer"    printer    ip=10.0.20.40
node voip  "Reception phone"    phone      ip=10.0.30.12
node tv    "Wall display"       display    ip=10.0.20.80
node nvr   "NVR recorder"       nvr        ip=10.0.66.10
node cam   "Gate camera"        camera     ip=10.0.66.21
node ssw   "Intruder panel"     alarm      ip=10.0.70.5
node fire  "Fire alarm panel"   firepanel
node temp  "Temperature sensor" sensor     ip=10.0.70.9

acc:Gi1/0/1       -> patch:"Port 1" "Office patching"
acc:Gi1/0/2       -> ap:eth0        "AP trunk"    vlan=20
ap:"WLAN service" -> lap:"Wi-Fi"    "Service"
patch:"Port 5"    -> pc:LAN         "Office"      vlan=20
patch:"Port 6"    -> prn:LAN        "Office"      vlan=20
patch:"Port 7"    -> voip:LAN       "Telephony"   vlan=30
patch:"Port 8"    -> tv:LAN         "Signage"     vlan=20
acc:Gi1/0/10      -> nvr:LAN1       "CCTV"        vlan=66
nvr:PoE1          -> cam:LAN        "PoE camera"  vlan=66
acc:Gi1/0/11      -> ssw:ETH        "Intruder"    vlan=70
acc:Gi1/0/12      -> fire:ETH       "Fire alarm"  vlan=70
acc:Gi1/0/13      -> temp:LAN       "Sensors"     vlan=70
</pre>

---

## Test 6 — syntax error reporting

This map contains **deliberate mistakes**. It should still render, with a yellow
box underneath listing **4 notes**: an unknown type (`martian` → generic icon), an
unknown command, an auto-created device (`nosuchdevice`, dashed border) and the
reused port `ether1`.

<pre class="network-map">
title "Syntax validation test"
height 460

node a "Edge router"    router ip=10.0.0.1
node b "Something odd"  martian
node c "Switch"         switch ip=10.0.0.2

a:ether1 -> c:Gi1/0/1 "Valid link"
a:ether1 -> b:LAN     "Reused port ether1"
a:ether5 -> nosuchdevice:LAN "Undefined device"
completely random line of nonsense
</pre>

---

## Test 7 — minimal map, no legend, no table

<pre class="network-map">
title "LTE failover link"
height 300
legend off
table off

node router "Main router" router  ip=192.168.1.1
node lte    "LTE modem"   gateway ip=192.168.8.1 tag=backup

router:ether5 -> lte:LAN "Failover" style=dashed
</pre>

---

## Checklist

**Look and readability**
- [ ] No line runs through a device card (Test 2: the backup link curves around them).
- [ ] The three parallel lines in Test 4 are spread apart and all 6 ports are readable.
- [ ] No port label overlaps another.
- [ ] Icons and colours in Tests 5a/5b match the legend (25 types in total).
- [ ] The map looks right in the dark theme (switch themes in Wiki.js).
- [ ] A discreet `MAZNET · MATEUSZ MAZUR` credit sits in the bottom-right corner.

**Ports and descriptions**
- [ ] Every link has a port label on **both** devices.
- [ ] `VLAN …` and speed badges (`10G`, `1G`) show next to the descriptions.
- [ ] Test 3: `->` has one arrowhead, `<->` two, `--` none; dashed and dotted differ.
- [ ] Test 5a: ports with spaces (`"ONT port"`, `"Controller A"`, `"IPsec tunnel"`) render in full.

**Interaction**
- [ ] Clicking a device highlights its links and opens the `port → port` panel.
- [ ] Clicking a row in the panel jumps to the device on the other end.
- [ ] Clicking a line highlights that link alone.
- [ ] Double-clicking a device zooms to its neighbourhood.
- [ ] Clicking the background clears the selection (so does `Esc`).
- [ ] Search: type `243` to highlight that subnet; type `camera` for the cameras.
- [ ] Dragging a device moves it and the port labels follow the line.

**Toolbar** (left to right: −, +, fit, re-layout, vertical/horizontal, lines, descriptions, fullscreen)
- [ ] `−` / `+` change the zoom in a noticeable step.
- [ ] Fit frames the map without the legend covering it.
- [ ] Re-layout keeps a sensible arrangement.
- [ ] Vertical/horizontal switches the direction (Test 2 → horizontal and back).
- [ ] Lines switch to orthogonal and back to curves.
- [ ] Descriptions can be hidden, leaving only the ports.
- [ ] Fullscreen fills the window, `Esc` closes it and the map returns to its place.

**Scrolling and zoom**
- [ ] The mouse wheel **over the map** scrolls the page and the map shows the `Ctrl` hint.
- [ ] `Ctrl` + wheel zooms quickly and smoothly, centred on the cursor.
- [ ] In fullscreen the wheel zooms without `Ctrl`.

**Validation and extras**
- [ ] Test 1 reports 2 reused ports (`ether2`, `Gi10`).
- [ ] Test 6 reports 4 notes and still renders; `nosuchdevice` has a dashed border.
- [ ] Test 7 has no legend and no link list underneath.
- [ ] The `Link list` under the map expands and contains ports A/B, VLAN and speed.
- [ ] Print preview (`Ctrl+P`) shows the link list.
- [ ] Navigating to another wiki page and back (without a reload) still renders the map.
- [ ] No errors in the browser console (F12).

**If something does not work**, check in the console:

```js
NetworkMap.parse(document.querySelector('pre.network-map').textContent)
```

which returns the parsed structure together with the list of notes. The internals
of a given map live at `document.querySelectorAll('.nm-root')[0].__nm`
(`cy`, `doc`, `select`, `fitView`).
