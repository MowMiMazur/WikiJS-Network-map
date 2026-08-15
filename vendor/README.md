# vendor/

*[🇵🇱 Polski](#polski) · [🇬🇧 English](#english) · [← README](../README.md)*

Biblioteki firm trzecich, trzymane tutaj dla wygody wiki, które nie mają dostępu
do CDN-u. Nie są częścią tego projektu i nie obejmuje ich jego licencja.

Third-party libraries, kept here as a convenience for wikis that cannot reach a
CDN. They are not part of this project and are not covered by its licence.

| Plik / File | Pakiet / Package | Wersja / Version | Źródło / Official source |
|---|---|---|---|
| `cytoscape.min.js` | [cytoscape](https://www.npmjs.com/package/cytoscape) | 3.34.0 | [github.com/cytoscape/cytoscape.js](https://github.com/cytoscape/cytoscape.js) · [js.cytoscape.org](https://js.cytoscape.org) |
| `cytoscape-dagre.js` | [cytoscape-dagre](https://www.npmjs.com/package/cytoscape-dagre) | 3.0.0 | [github.com/cytoscape/cytoscape.js-dagre](https://github.com/cytoscape/cytoscape.js-dagre) |

Obie biblioteki są na licencji MIT · both are MIT licensed — [../NOTICE](../NOTICE).

```html
<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.34.0/dist/cytoscape.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@3.0.0/cytoscape-dagre.js"></script>
```

---

## Polski

**Jeśli Twoja wiki ma dostęp do internetu, bierz te pliki z oficjalnych źródeł** —
dostajesz aktualne wydania i poprawki bezpieczeństwa, a przeglądarka może je
współdzielić między stronami. Te same paczki serwują `unpkg.com`
i `cdnjs.cloudflare.com`.

`cytoscape-dagre` w wersji 3.x zawiera w sobie dagre i graphlib, więc dagre nie
musi być wczytywany osobno.

### Wersje minimalne

* Cytoscape.js **≥ 3.30**
* cytoscape-dagre **≥ 3.0** — wymagane. Mapa włącza opcję układu
  `useDagreEdgeControlPoints`, dodaną w 3.0, która zwraca wyliczoną przez dagre
  trasę każdej krawędzi. Bez niej linie rysują się prosto i przechodzą przez karty
  urządzeń, czyli dokładnie tak, jak ten projekt starał się nie robić.

<div align="right"><a href="#vendor">↑ do góry</a></div>

---

## English

**If your wiki can reach the internet, take these from their official sources** —
you get current releases and security fixes, and the browser can cache them across
sites. `unpkg.com` and `cdnjs.cloudflare.com` serve the same packages.

`cytoscape-dagre` 3.x bundles dagre and graphlib, so dagre does not have to be
loaded separately.

### Minimum versions

* Cytoscape.js **≥ 3.30**
* cytoscape-dagre **≥ 3.0** — required. The map enables the layout option
  `useDagreEdgeControlPoints`, added in 3.0, which returns dagre's routed path for
  every edge. Without it the lines are drawn straight and run through the device
  cards, which is exactly the problem this project exists to avoid.

<div align="right"><a href="#vendor">↑ back to top</a></div>
