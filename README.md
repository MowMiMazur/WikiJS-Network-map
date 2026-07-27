# WikiJS Network Map

Interactive network infrastructure diagrams for [Wiki.js](https://js.wiki), written
as plain text inside the page — including the port on **both** ends of every cable.

Interaktywne mapy infrastruktury sieciowej dla [Wiki.js](https://js.wiki), opisywane
zwykłym tekstem wewnątrz strony — razem z portem po **obu** stronach kabla.

![Network map](preview/en/01-map-light.png)

```html
<pre class="network-map" data-title="Head office network">
node router "MikroTik RB5009" router ip=192.168.1.1
node sw01   "Cisco SW-01"     switch ip=192.168.243.2

router:ether1 -> sw01:Gi1/0/48 "Uplink" vlan=243 speed=10G
</pre>
```

| | | |
|---|---|---|
| 🇬🇧 | **[English ↓](#english)** | [full documentation](en/README.md) · [syntax reference](en/SYNTAX.md) · [test page](en/TEST-PAGE.md) |
| 🇵🇱 | **[Polski ↓](#polski)** | [pełna dokumentacja](pl/README.md) · [opis składni](pl/SKLADNIA.md) · [strona testowa](pl/STRONA-TESTOWA.md) |

```
en/       English build: network-map.js, network-map.css, documentation
pl/       wersja polska: network-map.js, network-map.css, dokumentacja
preview/  screenshots · zrzuty ekranu
vendor/   Cytoscape.js + cytoscape-dagre · for wikis with no CDN access
```

<br>

---

<br>

# English

Both language folders hold a complete, standalone copy of the script. The only
difference is the language of the interface, the messages and the comments — load
the one you want and ignore the other.

## Install

Everything happens in **Administration → Theme → Code injection**.

```html
<!-- Head -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/MowMiMazur/WikiJS-Network-map@v1.0.2/en/network-map.css">
```

```html
<!-- Body -->
<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.34.0/dist/cytoscape.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@3.0.0/cytoscape-dagre.js"></script>
<script src="https://cdn.jsdelivr.net/gh/MowMiMazur/WikiJS-Network-map@v1.0.2/en/network-map.js"></script>
```

Use `/pl/` instead of `/en/` for the Polish interface. That is the whole
installation — drop a `<pre class="network-map">…</pre>` block into any wiki page
and the map draws itself.

### Version in the address

| Address | What you get |
|---|---|
| `@v1.0.2` | exactly this release, for good — nothing changes under your wiki until you edit the address |
| `@1` | the newest `1.x`, arriving on its own, without breaking changes |
| `@latest` | the newest release of any kind, a future `2.x` included |

`@1` and `@latest` trail a new release by up to a day of CDN and browser caching;
a pinned address has no such delay, because it is a different address.
[Releases](https://github.com/MowMiMazur/WikiJS-Network-map/releases) lists what
each version changed.

`raw.githubusercontent.com` will not work here — it serves `text/plain` with
`nosniff`, so browsers refuse to execute the files. Cytoscape should always come
from its own official releases. GitHub Pages and self-hosted setups are covered in
the [English README](en/README.md).

## Requirements

* Wiki.js 2.x with code injection enabled
* [Cytoscape.js](https://github.com/cytoscape/cytoscape.js) ≥ 3.30
* [cytoscape.js-dagre](https://github.com/cytoscape/cytoscape.js-dagre) ≥ 3.0
  (3.0 introduced `useDagreEdgeControlPoints`, which the map needs to route lines
  around device cards; dagre itself is bundled in that package)

## Licence

[Apache License 2.0](LICENSE) — free to use, modify and redistribute, including
commercially, as long as the author and licence notices are kept. See [NOTICE](NOTICE).

```
Copyright 2026 Mateusz Mazur (MAZNET)
```

Cytoscape.js and cytoscape.js-dagre are MIT licensed and remain the property of
their respective authors.

<br>

---

<br>

# Polski

Oba foldery językowe zawierają kompletną, samodzielną kopię skryptu. Różnią się
tylko językiem interfejsu, komunikatów i komentarzy — wczytujesz ten, który Cię
interesuje, drugi możesz zignorować.

## Instalacja

Wszystko odbywa się w **Administracja → Wygląd → Wstrzykiwanie kodu**.

```html
<!-- Head -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/MowMiMazur/WikiJS-Network-map@v1.0.2/pl/network-map.css">
```

```html
<!-- Body -->
<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.34.0/dist/cytoscape.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@3.0.0/cytoscape-dagre.js"></script>
<script src="https://cdn.jsdelivr.net/gh/MowMiMazur/WikiJS-Network-map@v1.0.2/pl/network-map.js"></script>
```

Dla interfejsu angielskiego użyj `/en/` zamiast `/pl/`. To cała instalacja —
wstawiasz na stronie wiki blok `<pre class="network-map">…</pre>` i mapa rysuje
się sama.

### Wersja w adresie

| Adres | Co dostajesz |
|---|---|
| `@v1.0.2` | dokładnie to wydanie, na stałe — nic nie zmieni się pod Twoją wiki, dopóki sam nie poprawisz adresu |
| `@1` | najnowsze `1.x`, przychodzi samo, bez zmian łamiących zgodność |
| `@latest` | najnowsze wydanie w ogóle, także przyszłe `2.x` |

`@1` i `@latest` doganiają nowe wydanie z opóźnieniem do doby, przez cache CDN-u
i przeglądarki; przypięty adres nie ma tego opóźnienia, bo jest po prostu innym
adresem. Co się zmieniło w danej wersji, opisuje
[lista wydań](https://github.com/MowMiMazur/WikiJS-Network-map/releases).

`raw.githubusercontent.com` tu nie zadziała — serwuje pliki jako `text/plain`
z `nosniff`, więc przeglądarka odmawia ich wykonania. Cytoscape zawsze bierz
z jego oficjalnych wydań. GitHub Pages i hosting na własnym serwerze opisuje
[polskie README](pl/README.md).

## Wymagania

* Wiki.js 2.x z włączonym wstrzykiwaniem kodu
* [Cytoscape.js](https://github.com/cytoscape/cytoscape.js) ≥ 3.30
* [cytoscape.js-dagre](https://github.com/cytoscape/cytoscape.js-dagre) ≥ 3.0
  (w 3.0 pojawiło się `useDagreEdgeControlPoints`, którego mapa potrzebuje, żeby
  prowadzić linie wokół kart urządzeń; sam dagre jest dołączony do tej paczki)

## Licencja

[Apache License 2.0](LICENSE) — wolno używać, modyfikować i rozpowszechniać, także
komercyjnie, o ile zachowasz informacje o autorze i licencji. Zobacz [NOTICE](NOTICE).

```
Copyright 2026 Mateusz Mazur (MAZNET)
```

Cytoscape.js i cytoscape.js-dagre są na licencji MIT i pozostają własnością
swoich autorów.
