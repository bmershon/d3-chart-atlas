'use strict';
(function() {
  var width = 960,
      height = 500;

  var timer = d3.select("#timer span");

  var data;

  var svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

  var options = {};
  options.layers = [];

  options.layers.push({
    class: function(d, i) {return "country " + d.properties.continent.replace(/\s+/g, '') + " " + d.properties.admin.replace(/\s+/g, '')},
    object: "countries",
    id: function(d, i) {return d.properties.admin.replace(/\s+/g, '');}
  });

  options.layers.push({
    class: function(d, i) {return "test " + d.properties.country},
    object: "nuclear",
    id: function(d, i) {return "test-" + d.properties.year},
    filter: function(d, i) {return d.properties.year <= 2005}
  });

  // optional projection, orthographic is the default
  var m = svg.chart("atlas", options)
             .graticule(d3.geo.graticule().step([20, 20]))
             .projection(d3.geo.orthographic().clipAngle(90 + 10e-6))
             .pointRadius(4);

  queue()
    .defer(d3.json, "combined.json")
    .await(ready);

  function ready(error, topology) {
    console.debug(topology)
    data = topology;
    m.draw(data)
     .zoomToLayer("countries");
  }

})();
