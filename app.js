'use strict';
(function() {

  var width = 960,
      height = 500;

  var data;

  var svg = d3.select("body")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

  // events
  var dispatch = d3.dispatch("zoomToFeature","resetAffine");

  var options = {};
  options.layers = [];
  options.dispatch = dispatch;

  // layer defined, with UI event callbacks
  options.layers.push({
    class: "countries",
    object: "countries",
    id: function(d, i) {return "country-" + i},
    interactions: {
      "mouseenter": mouseenter,
      "mouseleave": mouseleave,
      "click": click
    }
  });

  // another layer of rivers, with no interactions
  options.layers.push({
    class: "rivers",
    id: function(d, i) {return i},
    object: "ne_10m_rivers_lake_centerlines" // identify the topology object for the layer
  });

  function mouseenter(d, i) {
    d3.select(this).classed("highlight", true);
  }

  function mouseleave(d, i) {
    d3.select(this).classed("highlight", false);
  }

  function click(d, i) {
    d3.select(this).classed("highlight", false);
    d3.selectAll(".countries").classed("active", false)
    d3.select(this).classed("active", true);

    dispatch.zoomToFeature.apply(this, arguments);
  }

  var m = svg.chart("atlas", options)
             .precision(0.1) // optional
             .graticule(d3.geo.graticule().outline) // optional
             .projection(d3.geo.kavrayskiy7()); // optional

  queue()
    .defer(d3.json, "combined.json")
    .await(ready);

  function ready(error, topology) {
    data = topology;
    m.draw(data);
    m.zoomToLayer("countries"); // use bounding box of the union of all countries
  }

})();
