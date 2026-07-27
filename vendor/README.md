# vendor/

Third-party libraries, kept here as a convenience for wikis that cannot reach a
CDN. They are not part of this project and are not covered by its licence.

**If your wiki can reach the internet, take these from their official sources** —
you get current releases and security fixes, and the browser can cache them across
sites.

| File | Package | Version | Official source |
|---|---|---|---|
| `cytoscape.min.js` | [cytoscape](https://www.npmjs.com/package/cytoscape) | 3.34.0 | [github.com/cytoscape/cytoscape.js](https://github.com/cytoscape/cytoscape.js) · [js.cytoscape.org](https://js.cytoscape.org) |
| `cytoscape-dagre.js` | [cytoscape-dagre](https://www.npmjs.com/package/cytoscape-dagre) | 3.0.0 | [github.com/cytoscape/cytoscape.js-dagre](https://github.com/cytoscape/cytoscape.js-dagre) |

Both are MIT licensed. `cytoscape-dagre` 3.x bundles dagre and graphlib, so dagre
does not have to be loaded separately. See [../NOTICE](../NOTICE).

## CDN

```html
<script src="https://cdn.jsdelivr.net/npm/cytoscape@3.34.0/dist/cytoscape.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/cytoscape-dagre@3.0.0/cytoscape-dagre.js"></script>
```

`unpkg.com` and `cdnjs.cloudflare.com` serve the same packages.

## Minimum versions

* Cytoscape.js **≥ 3.30**
* cytoscape-dagre **≥ 3.0** — required. The map enables the layout option
  `useDagreEdgeControlPoints`, added in 3.0, which returns dagre's routed path for
  every edge. Without it the lines are drawn straight and run through the device
  cards, which is exactly the problem this project exists to avoid.
