# preview/

Screenshots used by the documentation. One set per language, because the map's
interface is translated too.

Zrzuty ekranu używane w dokumentacji. Jeden zestaw na język, bo interfejs mapy
też jest tłumaczony.

```
preview/en/   used by en/README.md
preview/pl/   używane przez pl/README.md
```

| File | Shows / Pokazuje |
|---|---|
| `01-map-light.png` | network map, light theme · mapa w motywie jasnym |
| `02-map-dark.png` | the same map in the dark Wiki.js theme · motyw ciemny |
| `03-details.png` | details panel with the `port → port` list · panel szczegółów |
| `04-horizontal.png` | horizontal layout (`direction LR`) and line styles · układ poziomy |
| `05-validation.png` | syntax notes listed under the map · uwagi do składni |
| `06-builder.png` | the map builder, `builder.html` · kreator map |

## Replacing a screenshot

* **1240 px wide** — renders in a GitHub README without rescaling.
* Capture **only the map**, without browser chrome or page background. Easiest
  route: put the complete example from the syntax reference on a wiki page, set
  the map to fullscreen (last toolbar button) and grab the window. `06-builder.png`
  is the exception — that one is the whole builder page.
* Light and dark shots come from the wiki's own theme switch.
* Keep the filenames from the table — then neither README needs editing. Add new
  shots as `06-…`, `07-…` and reference them yourself.
* PNG, and avoid upscaled HiDPI captures: the port labels are small and blur quickly.

The current shots were generated with headless Chrome
(`--headless --window-size=1240,762 --screenshot`), so they are sharp and reproducible.

## Podmiana zrzutów (PL)

* **Szerokość 1240 px** — dobrze wygląda w README na GitHubie, bez skalowania.
* Rób zrzut **samej mapy**, bez paska przeglądarki i tła strony. Najprościej:
  wstaw kompletny przykład z opisu składni na stronę wiki, włącz pełny ekran
  (ostatni przycisk w pasku narzędzi) i zrób zrzut okna. Wyjątkiem jest
  `06-builder.png` — to zrzut całej strony kreatora.
* Jasny i ciemny wariant bierze się z przełącznika motywu w samej wiki.
* Zachowaj nazwy plików z tabeli — wtedy nie trzeba ruszać żadnego README.
* Format PNG. Unikaj zrzutów z ekranów HiDPI przeskalowanych w górę — etykiety
  portów są małe i szybko się rozmywają.
