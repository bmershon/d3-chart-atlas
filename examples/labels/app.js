"use strict";
(function() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      padding = {top: 0, right: 60, bottom: 120, left: 60},
      outerWidth = 1200,
      outerHeight = 750,
      innerWidth = outerWidth - margin.left - margin.right,
      innerHeight = outerHeight - margin.top - margin.bottom,
      width = innerWidth - padding.left - padding.right,
      height = innerHeight - padding.top - padding.bottom;

  var smallFontScale = d3.scale.linear().domain([height/2, 0]).range([8, 18]);
  var bigFontScale = d3.scale.linear().domain([height/2, 0]).range([8, 22]);
  var opacityScale = d3.scale.linear().domain([.8*height/2, 0]).range([0, 1]);
  var tightOpacityScale = d3.scale.linear().domain([.6*height/2, 0]).range([0, .6]);
  var hexagonOpacity = d3.scale.linear().domain([.85*height/2, 0]).range([0, 1]);

  var radius = d3.scale.sqrt()
    .domain([0, 900])
    .range([7, 25]);

  var center = [165, 0];

  var bins;

  var hexbin = d3.hexbin()
      .size([width, height])
      .radius(6); //spherical coordinates, degrees

  var λ = d3.scale.linear()
      .domain([0, outerWidth])
      .range([-210, 210]);

  var φ = d3.scale.linear()
      .domain([0, outerHeight])
      .range([90, -90]);

  var time0 = Date.now(),
      time1;

  var timer = d3.select("#timer span");

  var data;

  var background = d3.select("#nuclear-testing");

  var svg = background.append("g")
                      .attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")")
                      .attr("id", "globe")
  var powers = {
    "FRA": "France",
    "CHN": "China",
    "PAK": "Pakistan",
    "IND": "India",
    "USA": "United States",
    "RUS": "Russia",
    "GBR": "UK",
    "DZA": ""
  }

  var options = {};
  options.layers = [];
  options.labels = [];

  // define a layer and labels
  options.layers.push({
    class: "land",
    object: "land"
  });

  options.layers.push({
    class: "country",
    id: function(d) {return d.properties["adm0_a3"]},
    object: "countries",
    filter: function(d) {return powers.hasOwnProperty(d.properties["adm0_a3"])},
  });

  // country labels
  options.labels.push({
    id: function(d) {return d.properties["adm0_a3"]},
    object: "countries",
    class: "country",
    text: function(d) {return powers[d.properties["adm0_a3"]]},
    filter: function(d) {return powers.hasOwnProperty(d.properties["adm0_a3"])}
  });

  // locators for important events
  options.layers.push({
    object: "events",
    class: "event",
    text: function(d) {return d.properties.blurb}
  });

  // labels for important events -- tied to "events" topology object
  options.labels.push({
    object: "events",
    class: "blurb",
    text: function(d) {return d.properties.blurb}
  });

  var ellipse = background.append("ellipse");

  // d3.chart grafts itself onto and modifies the d3 selection.
  var globe = svg.chart("atlas", options)
             .width(width)
             .height(height)
             .rotate(center)
             .sphere({type: "Sphere"})
             .precision(.3)
             .graticule(d3.geo.graticule().step([20, 20]))
             .projection(d3.geo.orthographic().clipAngle(90))
             .pointRadius(function(d) {
               if(d.properties) {
                 return (d.properties.blurb) ? 20 : 5;
               }
             })
  /*
    Define a callback to be called when "change:projection" events are triggered
    within the chart.

    Mutators like .rotate() and .zoomToLayer() trigger change:projection internally.
    This approach allows the *this* context passed to the callback to refer to the chart instance.

    This is useful when we want access things like the internal projection
    and d3.geo.path instance for calculating the centroid of a feature.
  */
  globe.on("change:projection", function() {
    var chart = this;
    var path = chart._path;
    var projection = chart._projection;

    if(!chart.data) return;

    svg.selectAll(".label-countries")
        .style("fill-opacity", function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          return tightOpacityScale(Math.sqrt(dx * dx + dy * dy));
        })
        .style("font-size", function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          return smallFontScale(Math.sqrt(dx * dx + dy * dy));
        })

    svg.selectAll(".event")
        .style("stroke-opacity", function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          return opacityScale(Math.sqrt(dx * dx + dy * dy));
        })
    svg.selectAll(".blurb")
        .attr("x", 30)
        .attr("y", 60)
        .style("fill-opacity", function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          return opacityScale(Math.sqrt(dx * dx + dy * dy));
        })
        .style("font-size", function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          return bigFontScale(Math.sqrt(dx * dx + dy * dy));
        })
  })

  queue()
    .defer(d3.json, "combined.json")
    .await(ready);


  function ready(error, topology) {
    console.debug(topology)
    data = topology;

    var locations = topojson.feature(topology, topology.objects.nuclear).features;
    locations.forEach(function(d) {
      var p = d.geometry.coordinates;
      d[0] = p[0], d[1] = p[1];
    });

    globe.draw(data)
     .rotateToLayer("land");

    var projection = globe.projection();
    var path = globe.path();

    bins = hexbin(locations).sort(function(a, b) { return b.length - a.length; });

    // find dominate country in bin and use that for color coding
    bins.map(function(d) {
      var length = d.length;
      for(var i = 0; i < length; i++) {
        var country = d[i].properties.country;

      }
      d.properties = {};
      d.properties.country = country;
    })

    updateHexagons(projection, path);

    background.on("mousemove", function() {
      var p = d3.mouse(this);
      time0 = Date.now();
      globe.rotate([(λ(p[0]) + center[0] % 360), (φ(p[1]) + center[1] % 90)]);
      updateHexagons(projection, path);
      time1 = Date.now();
      timer.text((1000/(time1 - time0)).toPrecision(2));
    });

    // <defs> defined in index.html

    // DROP SHADOW
    ellipse
          .attr("cx", width * .45 + margin.left + padding.left).attr("cy", outerHeight - globe.scale()*.20*2 - 10)
          .attr("rx", globe.scale()*.7)
          .attr("ry", globe.scale()*.20)
          .attr("class", "noclicks")
          .style("fill", "url(#drop_shadow)");

    // NORTH EAST HIGHLIGHT (from sun)
    svg.append("circle")
          .attr("cx", width / 2).attr("cy", height / 2)
          .attr("r", globe.scale())
          .attr("class","noclicks")
          .style("fill", "url(#globe_highlight)");

    // SOUTH WEST SHADING
    svg.append("circle")
          .attr("cx", width / 2).attr("cy", height / 2)
          .attr("r", globe.scale())
          .attr("class","noclicks")
          .style("fill", "url(#globe_shading)");
  }

  function updateHexagons(projection, path) {
    var hexagons = svg.selectAll(".hexagon")
                      .data(bins.filter(function(d) {return visible(d, path)}))

    hexagons.enter().append("path")

    hexagons.attr("d", function(d) { return hexbin.hexagon(radius(d.length)); })
        .classed("hexagon", true)
        .attr("id", function(d) {return d.properties.country})
        .attr("transform", function(d) { return "translate(" + projection([d.x, d.y])[0] + "," + projection([d.x, d.y])[1] + ")"; })
        .style("fill-opacity", function(d) {
          var test = {
                "type": "Point",
                "coordinates": [d.x, d.y] // spherical coordinates
              }
          var c = path.centroid(test);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          return hexagonOpacity(Math.sqrt(dx * dx + dy * dy));
        })

    hexagons.exit().remove();
  }

  // Run a point through the geometry pipeline to test for orthographic clipping
  function visible(d, path) {
    var test = {
          "type": "Point",
          "coordinates": [d.x, d.y] // spherical coordinates
        }
    var c = path.centroid(test);
    return !(isNaN(c[0]) || isNaN(c[1]));
  }

})();
