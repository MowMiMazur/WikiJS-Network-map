# Mapa infrastruktury sieciowej — składnia

Ten plik możesz wkleić jako stronę pomocy we własnej wiki.

Mapę wstawiasz jednym blokiem HTML. W edytorze Markdown wpisujesz:

```html
<pre class="network-map" data-title="Mapa infrastruktury głównej">
node router "MikroTik RB5009" router ip=192.168.1.1
node sw01   "Cisco SW-01"     switch ip=192.168.243.2

router:ether1 -> sw01:Gi1/0/48 "Uplink" speed=10G vlan=243
</pre>
```

Wszystko wewnątrz bloku to zwykły tekst — jedna linia to jeden element mapy.
Puste linie oraz linie zaczynające się od `#`, `//` lub `;` są pomijane.

---

## 1. Urządzenia

```
node <id> "<Nazwa>" [typ] ["Adres / opis"] [klucz=wartość ...]
```

| Element | Znaczenie |
|---|---|
| `<id>` | krótki identyfikator używany w połączeniach (litery, cyfry, `_`, `.`, `-`) |
| `"<Nazwa>"` | nazwa widoczna na kaflu |
| `typ` | ikona i kolor — lista niżej (domyślnie `device`) |
| `"Adres / opis"` | druga linijka na kaflu, zwykle IP |

Dodatkowe atrybuty:

| Atrybut | Działanie |
|---|---|
| `ip=` / `info=` | to samo co czwarty argument (adres / opis) |
| `tag=` | mała plakietka w narożniku, np. `tag="szafa A"`, `tag=core` |
| `note=` | notatka widoczna w panelu szczegółów |
| `url=` | link do strony wiki tego urządzenia (przycisk w panelu) |
| `color=` | wymuszony kolor akcentu, np. `color=#dc2626` |
| `type=` | alternatywny zapis typu |

```
node sw01 "Cisco C9200-48P" switch ip=192.168.243.2 tag="szafa A" note="48x1G PoE + 4x SFP+" url="/siec/sw01"
node pve01 "Proxmox PVE-01" hypervisor ip=192.168.243.10
node nieznane "Coś w szafie"
```

### Dostępne typy

`internet` `cloud` `router` `gateway` `firewall` `switch` `patchpanel` `wifi`
`server` `hypervisor` `vm` `nas` `storage` `computer` `laptop` `printer`
`phone` `display` `camera` `nvr` `alarm` `firepanel` `sensor` `ups` `device`

Działają też skróty i polskie nazwy, m.in.:
`ap` → `wifi`, `sw` / `przelacznik` → `switch`, `fw` / `zapora` → `firewall`,
`pve` / `proxmox` / `esxi` → `hypervisor`, `kamera` / `cctv` → `camera`,
`dvr` / `rejestrator` → `nvr`, `pc` / `komputer` → `computer`,
`modem` / `ont` → `gateway`, `sap` → `firepanel`, `sswin` → `alarm`,
`iot` / `czujnik` → `sensor`.

Nieznany typ nie przerywa renderowania — urządzenie dostaje ikonę ogólną,
a mapa zgłasza uwagę.

---

## 2. Połączenia i porty

Najczytelniejszy zapis — port podajesz po dwukropku przy urządzeniu:

```
<urządzenieA>:<portA> -> <urządzenieB>:<portB> "<Opis>" [klucz=wartość ...]
```

```
router:ether1 -> sw01:Gi1/0/48 "Uplink do szafy A" speed=10G vlan=243
sw01:Gi1/0/2  -> pve01:eno1    "Hosty wirtualizacji" vlan=243
```

Port zawierający spacje zapisz w cudzysłowie **bezpośrednio po dwukropku**:

```
internet:"Port ONT operatora" -> router:ether1 "WAN"
```

Strzałka jest opcjonalna i decyduje tylko o wyglądzie:

| Zapis | Efekt |
|---|---|
| `--` lub brak | linia bez grotów (zalecane dla sieci LAN) |
| `->` | grot przy urządzeniu docelowym |
| `<->` | groty z obu stron |

Można też poprzedzić linię słowem `link` — wtedy działa również zapis pozycyjny
(zgodny ze starszymi mapami):

```
link router sw01 "Trunk VLAN 243" "ether1" "Gi1/0/48"
       │     │          │            │          └─ port po stronie docelowej
       │     │          │            └──────────── port po stronie źródłowej
       │     │          └───────────────────────── opis połączenia
       └─────┴──────────────────────────────────── identyfikatory urządzeń
```

Atrybuty połączenia:

| Atrybut | Działanie |
|---|---|
| `vlan=243` | plakietka „VLAN 243” na opisie |
| `speed=10G` | plakietka z przepustowością |
| `style=dashed` \| `dotted` \| `solid` | rodzaj linii (np. łącze zapasowe) |
| `color=#f59e0b` | własny kolor linii |
| `note=` | dodatkowy tekst w panelu szczegółów |
| `label="…"` | opis (alternatywa dla tekstu w cudzysłowie) |
| `porta=` / `portb=` | porty, jeśli nie chcesz zapisu z dwukropkiem |

```
router:ether3 -> sw02:Gi1/0/47 "Łącze zapasowe" style=dashed color=#f59e0b
link ups01 sw01 label="Zarządzanie" porta=LAN portb=Gi1/0/24 vlan=99
```

---

## 3. Ustawienia całej mapy

Umieszczasz je w dowolnym miejscu bloku:

| Linia | Znaczenie |
|---|---|
| `title "Nazwa mapy"` | tytuł w pasku (alternatywa dla `data-title` w `<pre>`) |
| `direction TB` | układ pionowy (domyślny); `LR` = poziomy, `BT`, `RL` |
| `height 700` | wysokość mapy w pikselach (260–2000) |
| `legend off` | ukrycie legendy typów |
| `table off` | ukrycie rozwijanej listy połączeń pod mapą |

Alternatywnie w samym znaczniku:
`<pre class="network-map" data-title="…" data-direction="LR" data-height="760">`

---

## 4. Co daje gotowa mapa

* **Kliknięcie urządzenia** — wyróżnia jego połączenia i otwiera panel z listą
  „port lokalny → port zdalny”, opisami, VLAN-ami i notatkami.
* **Kliknięcie linii** — wyróżnia samo połączenie.
* **Dwuklik na urządzeniu** — przybliża do jego najbliższego otoczenia.
* **Wyszukiwanie** — po nazwie, IP, identyfikatorze, roli i typie.
* **Pasek narzędzi** — zoom, dopasowanie widoku, ponowne ułożenie, przełączenie
  układu pion/poziom, przełączenie linii krzywe/kątowe, ukrycie opisów, pełny ekran.
* **Ctrl + kółko myszy** — przybliżanie (bez Ctrl strona przewija się normalnie).
* **Lista połączeń** pod mapą — dobra do wydruku i do czytników ekranu.
* **Uwagi do składni** — mapa sama zgłasza literówki: nieznany typ, nieistniejące
  urządzenie, a także **ten sam port użyty w dwóch połączeniach**.

---

## 5. Kompletny przykład

```html
<pre class="network-map">
title "Infrastruktura – siedziba główna"
height 700

# --- brzeg sieci ---
node internet "Internet"        internet info="Orange 1 Gb/s"
node router   "MikroTik RB5009" router   ip=192.168.1.1 tag=core url="/siec/rb5009"
node firewall "Firewall główny" firewall ip=192.168.1.2 tag=brzeg

# --- rdzeń ---
node sw01 "Cisco SW-01" switch ip=192.168.243.2 tag="szafa A" note="48x1G PoE"
node sw02 "Cisco SW-02" switch ip=192.168.243.3 tag="szafa B"

# --- usługi i końcówki ---
node pve01    "Proxmox PVE-01"  hypervisor ip=192.168.243.10
node nas01    "Serwer NAS"      nas        ip=192.168.243.20
node ap01     "UniFi AP-01"     wifi       ip=192.168.243.30
node kamera01 "Kamera CCTV hol" camera     ip=192.168.66.10
node nvr01    "Rejestrator NVR" nvr        ip=192.168.66.2
node ups01    "UPS APC 3000"    ups        ip=192.168.243.90

internet:"Port ONT" -> router:ether1  "WAN"            speed=1G
router:ether2       -> firewall:WAN   "Łącze brzegowe" speed=1G
firewall:LAN1       -> sw01:Gi1/0/1   "Trunk"          vlan=243 speed=10G
sw01:Gi1/0/48       -> sw02:Gi1/0/48  "Stos / uplink"  speed=10G
sw01:Gi1/0/2        -> pve01:eno1     "Hosty"          vlan=243
sw01:Gi1/0/3        -> nas01:LAN1     "Storage"        vlan=243 speed=10G
sw01:Gi1/0/4        -> ap01:eth0      "Trunk AP"       vlan=243
sw02:Gi1/0/10       -> kamera01:LAN   "Monitoring"     vlan=66
sw02:Gi1/0/11       -> nvr01:LAN1     "Monitoring"     vlan=66
router:ether3       -> sw02:Gi1/0/47  "Łącze zapasowe" style=dashed
ups01:LAN           -> sw01:Gi1/0/24  "Zarządzanie"    vlan=99
</pre>
```

---

Instalacja i konfiguracja: [README.md](README.md).
Strona do przetestowania wszystkich funkcji: [STRONA-TESTOWA.md](STRONA-TESTOWA.md).
