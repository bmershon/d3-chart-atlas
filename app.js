'use strict';
(function() {

  var width = 960,
      height = 500;

  var data;

  var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

  var options = {};
  options.layers = [];

  // this is how you define a layer of countries for the map
  options.layers.push({
    class: "countries", // use for CSS
    object: "countries", // identify the topology object for the layer
    interactions: { // user-interaction event handlers to register for this layer's paths
    id: function(d, i) {return i}, // values or function can be used
      // this context is the DOM element, chart is a reference to the chart
      "mouseenter": function(d, i) {
        d3.select(this).classed("active", true);
      },
      "mouseleave": function(d, i) {
        d3.select(this).classed("active", false)
      }
    }
  });

  // another layer of rivers, with no interactions
  options.layers.push({
    class: "rivers",
    id: function(d, i) {return i},
    object: "ne_10m_rivers_lake_centerlines" // identify the topology object for the layer
  });

  var m = svg.chart("atlas", options)
             .precision(0.1)
             .graticule(d3.geo.graticule().outline())
             .projection(d3.geo.robinson());

  queue()
    .defer(d3.json, "combined.json")
    .await(ready);


  function ready(error, topology) {
    data = topology;
    m.draw(data);
    m.zoomToLayer("countries"); // use bounding box of the union of all countries
  }

})();
