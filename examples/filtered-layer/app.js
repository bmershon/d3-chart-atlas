'use strict';
(function() {
  var width = 960,
      height = 500;

  var λ = d3.scale.linear()
      .domain([0, width])
      .range([-180, 180]);

  var φ = d3.scale.linear()
      .domain([0, height])
      .range([90, -90]);

  var time0 = Date.now(),
      time1;

  var timer = d3.select("#timer span");

  var data;

  var svg = d3.select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

  var options = {};
  options.layers = [];

  var whiteListed = ["UnitedStatesofAmerica", "France", "Pakistan", "India", "China", "UnitedKingdom", "Russia"];

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

    svg.on("mousemove", function() {
      var p = d3.mouse(this);
      time0 = Date.now();

      m.rotate([λ(p[0]), φ(p[1])]);

      time1 = Date.now();
      timer.text((time1 - time0));
    });

  }

})();
