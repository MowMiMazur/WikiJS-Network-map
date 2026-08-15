# preview/

*[🇵🇱 Polski](#polski) · [🇬🇧 English](#english) · [← README](../README.md)*

Zrzuty ekranu używane w dokumentacji. Jeden zestaw na język, bo interfejs mapy
też jest tłumaczony.

Screenshots used by the documentation. One set per language, because the map's
interface is translated too.

```
preview/en/   used by en/README.md
preview/pl/   używane przez pl/README.md
```

| Plik / File | Pokazuje / Shows |
|---|---|
| `01-map-light.png` | mapa w motywie jasnym · network map, light theme |
| `02-map-dark.png` | ten sam widok w ciemnym motywie Wiki.js · the same map, dark theme |
| `03-details.png` | panel szczegółów z listą `port → port` · details panel |
| `04-horizontal.png` | układ poziomy (`direction LR`) i style linii · horizontal layout |
| `05-validation.png` | uwagi do składni pod mapą · syntax notes under the map |
| `06-builder.png` | kreator map, `builder.html` · the map builder |

---

## Polski

### Podmiana zrzutów

* **Szerokość 1240 px** — dobrze wygląda w README na GitHubie, bez skalowania.
* Rób zrzut **samej mapy**, bez paska przeglądarki i tła strony. Najprościej:
  wstaw kompletny przykład z opisu składni na stronę wiki, włącz pełny ekran
  (ostatni przycisk w pasku narzędzi) i zrób zrzut okna. Wyjątkiem jest
  `06-builder.png` — to zrzut całej strony kreatora.
* Jasny i ciemny wariant bierze się z przełącznika motywu w samej wiki.
* Zachowaj nazwy plików z tabeli — wtedy nie trzeba ruszać żadnego README.
  Nowe zrzuty dodawaj jako `07-…`, `08-…` i podlinkuj je samodzielnie.
* Format PNG. Unikaj zrzutów z ekranów HiDPI przeskalowanych w górę — etykiety
  portów są małe i szybko się rozmywają.

Obecne zrzuty powstały w Chrome bez interfejsu
(`--headless --window-size=1240,762 --screenshot`), więc są ostre i powtarzalne.

<div align="right"><a href="#preview">↑ do góry</a></div>

---

## English

### Replacing a screenshot

* **1240 px wide** — renders in a GitHub README without rescaling.
* Capture **only the map**, without browser chrome or page background. Easiest
  route: put the complete example from the syntax reference on a wiki page, set
  the map to fullscreen (last toolbar button) and grab the window. `06-builder.png`
  is the exception — that one is the whole builder page.
* Light and dark shots come from the wiki's own theme switch.
* Keep the filenames from the table — then neither README needs editing. Add new
  shots as `07-…`, `08-…` and reference them yourself.
* PNG, and avoid upscaled HiDPI captures: the port labels are small and blur quickly.

The current shots were generated with headless Chrome
(`--headless --window-size=1240,762 --screenshot`), so they are sharp and reproducible.

<div align="right"><a href="#preview">↑ back to top</a></div>
