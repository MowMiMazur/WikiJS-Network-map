# Mapa sieci — strona testowa

> Wklej **całą** treść tego pliku do nowej strony Wiki.js w trybie **Markdown**
> (np. `/test/mapa-sieci`) i zapisz. Każda sekcja sprawdza inny element mapy.
> Listę kontrolną znajdziesz na końcu.

---

## Test 1 — zgodność ze starą składnią pozycyjną

Mapa w zapisie `link a b "opis" "portA" "portB"`. Powinna się wyrenderować
i **na dole pokazać 2 uwagi o powtórzonych portach** (`ether2`, `Gi10`).

<pre class="network-map" data-title="Mapa infrastruktury głównej">
node internet "Internet" cloud "Łącze główne"
node router "MikroTik RB5009" router "192.168.1.1"
node firewall "Firewall główny" firewall "Brama sieci LAN"
node sw01 "Cisco SW-01" switch "192.168.243.2"
node pve01 "Proxmox PVE-01" hypervisor "192.168.243.10"
node nas01 "Serwer NAS" nas "192.168.243.20"
node ap01 "UniFi AP-01" wifi "192.168.243.30"
node kamera01 "Kamera CCTV" camera "192.168.66.10"

link internet router "WAN" "Port operatora" "ether1"
link router firewall "Połączenie WAN" "ether2" "WAN"
link firewall sw01 "Trunk VLAN 243" "LAN" "Gi10"
link sw01 pve01 "VLAN 243" "Gi1" "eno1"
link sw01 nas01 "VLAN 243" "Gi2" "LAN1"
link sw01 ap01 "Trunk" "Gi3" "LAN"
link sw01 kamera01 "VLAN 66" "Gi4" "LAN"
link router sw01 "Trunk VLAN 243" "ether2" "Gi10"
</pre>

---

## Test 2 — nowa składnia, porty po obu stronach

Główny test opisywania portów. Zwróć uwagę na łącze zapasowe `ether3 → Gi1/0/47`,
które **łagodnym łukiem omija** urządzenia w środku mapy.

<pre class="network-map">
title "Infrastruktura – siedziba główna"
height 720

# --- brzeg sieci ---
node internet "Internet"        internet info="Orange 1 Gb/s"
node router   "MikroTik RB5009" router   ip=192.168.1.1 tag=core note="RouterOS 7.14, 2x SFP+"
node firewall "Firewall główny" firewall ip=192.168.1.2 tag=brzeg

# --- rdzeń ---
node sw01 "Cisco SW-01" switch ip=192.168.243.2 tag="szafa A" note="48x 1G PoE + 4x SFP+"
node sw02 "Cisco SW-02" switch ip=192.168.243.3 tag="szafa B"

# --- usługi ---
node pve01 "Proxmox PVE-01" hypervisor ip=192.168.243.10
node nas01 "Serwer NAS"     nas        ip=192.168.243.20

# --- końcówki ---
node ap01     "UniFi AP-01"     wifi   ip=192.168.243.30
node ap02     "UniFi AP-02"     wifi   ip=192.168.243.31
node kamera01 "Kamera CCTV hol" camera ip=192.168.66.10
node nvr01    "Rejestrator NVR" nvr    ip=192.168.66.2
node ups01    "UPS APC 3000"    ups    ip=192.168.243.90

internet:"Port ONT" -> router:ether1  "WAN"            speed=1G
router:ether2       -> firewall:WAN   "Łącze brzegowe" speed=1G
firewall:LAN1       -> sw01:Gi1/0/1   "Trunk"          vlan=243 speed=10G
sw01:Gi1/0/48       -> sw02:Gi1/0/48  "Stos / uplink"  speed=10G
sw01:Gi1/0/2        -> pve01:eno1     "Hosty"          vlan=243
sw01:Gi1/0/3        -> nas01:LAN1     "Storage"        vlan=243 speed=10G
sw01:Gi1/0/4        -> ap01:eth0      "Trunk AP"       vlan=243
sw02:Gi1/0/4        -> ap02:eth0      "Trunk AP"       vlan=243
sw02:Gi1/0/10       -> kamera01:LAN   "Monitoring"     vlan=66
sw02:Gi1/0/11       -> nvr01:LAN1     "Monitoring"     vlan=66
router:ether3       -> sw02:Gi1/0/47  "Łącze zapasowe" style=dashed
ups01:LAN           -> sw01:Gi1/0/24  "Zarządzanie"    vlan=99
</pre>

---

## Test 3 — układ poziomy i rodzaje linii

Sprawdza `direction LR`, groty strzałek, linie przerywane i kropkowane oraz własny kolor.

<pre class="network-map">
title "Strefa DMZ – rodzaje połączeń"
direction LR
height 520

node fw     "Firewall UTM"    firewall ip=10.0.0.1
node dmz    "Switch DMZ"      switch   ip=10.0.9.1
node web    "Serwer WWW"      server   ip=10.0.9.10
node mail   "Serwer poczty"   server   ip=10.0.9.11
node backup "Kopie zapasowe"  storage  ip=10.0.9.90

fw:Gi0/2    -> dmz:Gi1/0/1  "Trunk DMZ"        vlan=9 speed=10G
dmz:Gi1/0/2 -- web:eno1     "Bez grotu"        vlan=9
dmz:Gi1/0/3 <-> mail:eno1   "Groty obustronne" vlan=9
web:eno2    -> backup:LAN1  "Replikacja nocna" style=dashed color=#f59e0b
mail:eno2   -> backup:LAN2  "Replikacja nocna" style=dotted color=#f59e0b
</pre>

---

## Test 4 — połączenia równoległe (LAG / EtherChannel)

Trzy osobne linie między tą samą parą urządzeń **nie mogą się na siebie nałożyć**,
a wszystkie 6 etykiet portów musi być widocznych.

<pre class="network-map">
title "Agregacja LAG między szafami"
height 460
legend off

node sw_a "Switch szafa A" switch ip=10.10.0.2 tag="szafa A"
node sw_b "Switch szafa B" switch ip=10.10.0.3 tag="szafa B"

sw_a:Gi1/0/49 -- sw_b:Gi1/0/49 "LAG1 – port 1" speed=10G
sw_a:Gi1/0/50 -- sw_b:Gi1/0/50 "LAG1 – port 2" speed=10G
sw_a:Gi1/0/51 -- sw_b:Gi1/0/51 "LAG1 – port 3" speed=10G
</pre>

---

## Test 5a — typy urządzeń: brzeg sieci i serwerownia

Sprawdź, czy każda ikona i kolor pasują do typu (legenda w lewym dolnym narożniku).
Zwróć uwagę na porty ze spacjami: `"Port ONT"`, `"Kontroler A"`, `"Tunel IPsec"`.

<pre class="network-map">
title "Typy urządzeń – brzeg i serwerownia"
height 700

node net   "Internet"            internet   info="2x 1 Gb/s"
node az    "Chmura Azure"        cloud      info="tunel IPsec"
node gw    "Modem ONT"           gateway    ip=10.0.0.254
node fw    "Firewall UTM"        firewall   ip=10.0.0.1
node core  "Switch rdzeniowy"    switch     ip=10.0.0.2 tag="szafa A"
node patch "Patchpanel 24p"      patchpanel tag="szafa A"
node srv   "Dell R650"           server     ip=10.0.10.5
node hv    "Proxmox PVE-02"      hypervisor ip=10.0.10.6
node vm    "VM: kontroler AD"    vm         ip=10.0.10.11
node nas   "QNAP TS-873"         nas        ip=10.0.10.31
node san   "Macierz MD2412"      storage    ip=10.0.10.30
node ups   "UPS APC 3000"        ups        ip=10.0.10.90
node other "Sterownik bez opisu" device

net:"Port ONT"   -> gw:WAN            "Łącze operatora" speed=1G
gw:LAN           -> fw:WAN            "Brzeg"           speed=1G
az:"Tunel IPsec" -> fw:VPN            "VPN do chmury"   style=dashed
fw:LAN1          -> core:Gi1/0/1      "Trunk"           vlan=10 speed=10G
core:Gi1/0/2     -> patch:"Port 1"    "Krosowanie"
core:Gi1/0/3     -> srv:eno1          "Serwery"         vlan=10 speed=10G
core:Gi1/0/4     -> hv:eno1           "Wirtualizacja"   vlan=10 speed=10G
hv:vmbr0         -> vm:net0           "Mostek"          vlan=10
core:Gi1/0/5     -> nas:LAN1          "Kopie"           vlan=10
core:Gi1/0/6     -> san:"Kontroler A" "Storage"         vlan=10 speed=10G
core:Gi1/0/23    -> other:ETH         "Nieopisane"
core:Gi1/0/24    -> ups:LAN           "Zarządzanie"     vlan=99
</pre>

---

## Test 5b — typy urządzeń: monitoring, automatyka, biuro

<pre class="network-map">
title "Typy urządzeń – monitoring i biuro"
height 620

node acc   "Switch dostępowy"    switch     ip=10.0.20.2 tag="szafa B"
node ap    "Punkt dostępowy"     wifi       ip=10.0.20.30
node lap   "Laptop serwisowy"    laptop
node patch "Patchpanel biuro"    patchpanel tag="szafa B"
node pc    "Stanowisko ochrony"  computer   ip=10.0.20.15
node prn   "Drukarka HP M479"    printer    ip=10.0.20.40
node voip  "Telefon recepcja"    phone      ip=10.0.30.12
node tv    "Monitor ścienny"     display    ip=10.0.20.80
node nvr   "Rejestrator NVR"     nvr        ip=10.0.66.10
node cam   "Kamera brama"        camera     ip=10.0.66.21
node ssw   "Centrala SSWiN"      alarm      ip=10.0.70.5
node sap   "Centrala SAP"        firepanel
node temp  "Czujnik temperatury" sensor     ip=10.0.70.9

acc:Gi1/0/1      -> patch:"Port 1" "Krosowanie biuro"
acc:Gi1/0/2      -> ap:eth0        "Trunk AP"   vlan=20
ap:"WLAN serwis" -> lap:"Wi-Fi"    "Serwis"
patch:"Port 5"   -> pc:LAN         "Biuro"      vlan=20
patch:"Port 6"   -> prn:LAN        "Biuro"      vlan=20
patch:"Port 7"   -> voip:LAN       "Telefonia"  vlan=30
patch:"Port 8"   -> tv:LAN         "Informacja" vlan=20
acc:Gi1/0/10     -> nvr:LAN1       "Monitoring" vlan=66
nvr:PoE1         -> cam:LAN        "Kamera PoE" vlan=66
acc:Gi1/0/11     -> ssw:ETH        "SSWiN"      vlan=70
acc:Gi1/0/12     -> sap:ETH        "SAP"        vlan=70
acc:Gi1/0/13     -> temp:LAN       "Czujniki"   vlan=70
</pre>

---

## Test 6 — kontrola błędów w opisie

Ta mapa ma **celowe błędy**. Powinna się wyrenderować, a pod nią ma się pojawić
żółta ramka z **4 uwagami**: nieznany typ (`kosmita` → ikona ogólna), nieznane
polecenie, urządzenie dodane automatycznie (`nieistnieje`, przerywana ramka)
i powtórzony port `ether1`.

<pre class="network-map">
title "Test walidacji składni"
height 460

node a "Router brzegowy" router ip=10.0.0.1
node b "Coś dziwnego"    kosmita
node c "Switch"          switch ip=10.0.0.2

a:ether1 -> c:Gi1/0/1 "Poprawne połączenie"
a:ether1 -> b:LAN     "Powtórzony port ether1"
a:ether5 -> nieistnieje:LAN "Nieznane urządzenie"
zupelnie losowa linia bez sensu
</pre>

---

## Test 7 — mapa minimalna, bez legendy i bez tabeli

<pre class="network-map">
title "Łącze zapasowe LTE"
height 300
legend off
table off

node router "Router główny" router  ip=192.168.1.1
node lte    "Modem LTE"     gateway ip=192.168.8.1 tag=backup

router:ether5 -> lte:LAN "Failover" style=dashed
</pre>

---

## Lista kontrolna

**Wygląd i czytelność**
- [ ] Linie nie przechodzą przez kafle urządzeń (Test 2: łącze zapasowe omija je łukiem).
- [ ] Trzy równoległe linie w Teście 4 są rozsunięte i widać wszystkie 6 portów.
- [ ] Żadna etykieta portu nie nakłada się na inną.
- [ ] Ikony i kolory w Testach 5a/5b zgadzają się z legendą (razem 25 typów).
- [ ] Mapa poprawnie wygląda w motywie ciemnym (przełącz motyw w Wiki.js).
- [ ] W prawym dolnym narożniku widnieje dyskretny podpis `MAZNET · MATEUSZ MAZUR`.

**Porty i opisy**
- [ ] Każde połączenie ma etykietę portu przy **obu** urządzeniach.
- [ ] Plakietki `VLAN …` i prędkości (`10G`, `1G`) są widoczne przy opisach.
- [ ] Test 3: `->` ma jeden grot, `<->` dwa, `--` żadnego; linie przerywane i kropkowane różnią się.
- [ ] Test 5a: porty ze spacjami (`"Port ONT"`, `"Kontroler A"`, `"Tunel IPsec"`) wyświetlają się w całości.

**Interakcja**
- [ ] Klik na urządzeniu wyróżnia jego połączenia i otwiera panel z listą `port → port`.
- [ ] Klik na pozycji w panelu przeskakuje do urządzenia po drugiej stronie.
- [ ] Klik na linii wyróżnia samo połączenie.
- [ ] Dwuklik na urządzeniu przybliża do jego otoczenia.
- [ ] Klik w tło czyści zaznaczenie (albo klawisz `Esc`).
- [ ] Wyszukiwanie: wpisz `243` — podświetla urządzenia z tej podsieci; wpisz `kamera` — kamery.
- [ ] Przeciąganie urządzenia przesuwa je, a etykiety portów jadą razem z linią.

**Pasek narzędzi** (od lewej: −, +, wyśrodkuj, ułóż ponownie, pion/poziom, linie, opisy, pełny ekran)
- [ ] `−` / `+` zmieniają zoom wyraźnym skokiem.
- [ ] Wyśrodkuj dopasowuje mapę bez zasłaniania jej legendą.
- [ ] Ułóż ponownie zachowuje sensowny układ.
- [ ] Pion/poziom przełącza kierunek (Test 2 → poziomo i wróć).
- [ ] Linie przełączają się na kątowe i wracają na krzywe.
- [ ] Opisy dają się ukryć — zostają same porty.
- [ ] Pełny ekran wypełnia okno, `Esc` go zamyka, mapa wraca na swoje miejsce w treści.

**Przewijanie i zoom**
- [ ] Kółko myszy **nad mapą** przewija stronę, a mapa pokazuje podpowiedź o `Ctrl`.
- [ ] `Ctrl` + kółko przybliża szybko i płynnie, w punkcie kursora.
- [ ] W pełnym ekranie kółko przybliża bez `Ctrl`.

**Walidacja i dodatki**
- [ ] Test 1 zgłasza 2 powtórzone porty (`ether2`, `Gi10`).
- [ ] Test 6 zgłasza 4 uwagi, a mapa nadal się rysuje; `nieistnieje` ma przerywaną ramkę.
- [ ] Test 7 nie ma legendy ani listy połączeń pod mapą.
- [ ] `Lista połączeń` pod mapą rozwija się i zawiera porty A/B, VLAN i prędkość.
- [ ] Podgląd wydruku (`Ctrl+P`) pokazuje listę połączeń.
- [ ] Przejście na inną stronę wiki i powrót (bez odświeżania) nadal renderuje mapę.
- [ ] W konsoli przeglądarki (F12) nie ma błędów.

**Jeśli coś nie działa**, sprawdź w konsoli:

```js
NetworkMap.parse(document.querySelector('pre.network-map').textContent)
```

zwróci sparsowaną strukturę i listę uwag. Wnętrze konkretnej mapy jest pod
`document.querySelectorAll('.nm-root')[0].__nm` (`cy`, `doc`, `select`, `fitView`).
