'use strict';
(function() {
  var width = 960/2,
      height = width;

  var globes = [];

  var containers = d3.selectAll(".globe")
                     .datum(function(d) {return d3.select(this).attr("id")})

  containers.each(function(_d) {

    var options = {};
    options.layers = [];

    options.layers.push({
      class: function(d, i) {return "country " + d.properties.admin.replace(/\s+/g, '')},
      object: "countries",
      id: function(d, i) {return d.properties.admin.replace(/\s+/g, '');}
    });

    options.layers.push({
      class: function(d, i) {return "test " + d.properties.country},
      object: "nuclear",
      id: function(d, i) {return "test-" + d.properties.year},
      filter: function(d) {return d.properties.country == _d}
    });

    // optional projection, orthographic is the default
    var m = d3.select(this).append("svg")
              .attr("width", width)
              .attr("height", height)
            .chart("atlas", options)
              .width(width)
              .height(height)
              .graticule(d3.geo.graticule().step([20, 20]))
              .projection(d3.geo.orthographic().clipAngle(90))
              .pointRadius(3.5);

    globes.push(m);

  })

  queue()
    .defer(d3.json, "combined.json")
    .await(ready);

  function ready(error, topology) {
    containers.each(function(_d, i) {
      globes[i].draw(topology)
       .rotateToLayer("nuclear", function(d) {return d.properties.country == _d});
    })

  }

})();
