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

---

## Documentation / Dokumentacja

| | |
|---|---|
| 🇬🇧 **[English](en/README.md)** | installation, syntax, configuration · [syntax reference](en/SYNTAX.md) · [test page](en/TEST-PAGE.md) |
| 🇵🇱 **[Polski](pl/README.md)** | instalacja, składnia, konfiguracja · [opis składni](pl/SKLADNIA.md) · [strona testowa](pl/STRONA-TESTOWA.md) |

Both folders contain a complete, standalone copy of the script — the only
difference is the language of the user interface, the messages and the comments.
Load the one you want and ignore the other.

Oba foldery zawierają kompletną, samodzielną kopię skryptu — różnią się tylko
językiem interfejsu, komunikatów i komentarzy. Wczytujesz ten, który Cię
interesuje, drugi możesz zignorować.

## Repository layout

```
en/       English build: network-map.js, network-map.css, docs, local preview
pl/       Polish build:  network-map.js, network-map.css, docs, local preview
preview/  screenshots used in the documentation
vendor/   Cytoscape.js + cytoscape-dagre copies for offline testing only
```

## Quick install (jsDelivr, straight from GitHub)

**Administration → Theme → Code injection → Head:**

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/MowMiMazur/WikiJS-Network-map@main/en/network-map.css">
```

**…→ Body:**

```html
<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.34.0/dist/cytoscape.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@3.0.0/cytoscape-dagre.js"></script>
<script src="https://cdn.jsdelivr.net/gh/MowMiMazur/WikiJS-Network-map@main/en/network-map.js"></script>
```

Use `/pl/` instead of `/en/` for the Polish interface. Note that
`raw.githubusercontent.com` cannot be used for this — it serves `text/plain` with
`nosniff`, so browsers refuse to execute the files. Cytoscape should always come
from its own official releases. Details, tag pinning, GitHub Pages and
self-hosted setups are covered in the language-specific READMEs.

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
