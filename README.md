# d3-chart-atlas

## topojson --> layers

You give atlas topojson like this:

```
objects: [
          countries: Object
          land: Object
          ne_10m_rivers_lake_centerlines: Object
         ]
```

*You tell Atlas what layers. Atlas render layers.*

*You configure map instance. Atlas do what you want. You no say how, Atlas do something reasonable.*

**You give bad directions, Atlas do bad things.**


## Background

The canonical representation of data in D3.js is the [array][array-manipulation]. D3 allows for the binding of arbitrary data to elements in the DOM, and it's declarative approach to managing sets of bound data and DOM elements, using [d3.selection][d3.selection], provides a flexible engine for building novel data visualizations.

Miso Project has released a neat little library called [d3.chart][d3.chart], which aims to make the creation of reusable charts a more organized process. According to @themisoproject, reusable charts should be:

* repeatable
* configurable
* extensible
* composable

The underlying components that d3.chart seeks to manage are called *layers*. A layer is a natural grouping of elements that are bound to data and constite a component of a chart. A simple bar-chart, for example, may require a layer for the bars, a layer for the axis and axis labels, and another layer for the labels positioned at the tips of the bars. Each of these three layers has ways to handle entering elements, updating elements, and exiting elements. Where d3.js is, at its heart, concerned with the manipulation of arrays, d3.chart sits on top of d3 and concerns itself with drawing the many layers of a chart.

`d3-chart-atlas` aims to help manage the d3 geometry pipeline for maps with one or more layers of geometry. This d3.chart abstracts away the management of enter, update, and exit selections without preventing users from configuring the functions used at any stage of the d3.geo pipeline.

In addition, d3-chart-atlas solves the most common problems users seem to encounter when it comes to scaling maps, zooming, and changing projections.


[array-manipulation]: https://github.com/mbostock/d3/wiki/Arrays

[d3.selection]: https://github.com/mbostock/d3/wiki/Selections

[d3.chart]: http://misoproject.com/d3-chart/
