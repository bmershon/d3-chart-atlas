"use strict";
(function() {
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
      padding = {top: 0, right: 0, bottom: 0, left: 0},
      outerWidth = 960,
      outerHeight = 960,
      innerWidth = outerWidth - margin.left - margin.right,
      innerHeight = outerHeight - margin.top - margin.bottom,
      width = innerWidth - padding.left - padding.right,
      height = innerHeight - padding.top - padding.bottom;

  var smallFontScale = d3.scale.linear().domain([height/2, 0]).range([8, 18]);
  var bigFontScale = d3.scale.linear().domain([height/2, 0]).range([8, 22]);
  var opacityScale = d3.scale.linear().domain([.8*height/2, 0]).range([0, 1]);
  var tightOpacityScale = d3.scale.linear().domain([.6*height/2, 0]).range([0, .6]);
  var hexagonOpacity = d3.scale.linear().domain([.85*height/2, 0]).range([0, .8]);
  var hexagonStroke = d3.scale.sqrt().range([0, 8]);
  var z = d3.scale.linear()
              .range([4, 250]);
  var data;

  var λ = d3.scale.linear()
      .domain([0, outerWidth])
      .range([-210, 210]);

  var φ = d3.scale.linear()
      .domain([0, outerHeight])
      .range([90, -90]);

  var radius = d3.scale.linear()
              .range([4, 25]);

  var center = [165, 0];

  var bins;

  var hexbin = d3.hexbin()
      .radius(1); //spherical coordinates, degrees

  var background = d3.select("#nuclear-testing");

  var svg = background.append("g")
                      .attr("transform", "translate(" + (margin.left + padding.left) + "," + (margin.top + padding.top) + ")")
                      .attr("id", "globe");


  // cache a layer added to the map
  var g_hexagons;

  var powers = {
    "FRA": "France",
    "CHN": "China",
    "PAK": "Pakistan",
    "IND": "India",
    "USA": "United States",
    "RUS": "Russia",
    "GBR": "UK",
    "PRK": "North Korea",
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

  // placeholder layer, not tied to topojson object; used for drawing order
  options.layers.push({
    object: "hexagons"
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

  // d3.chart grafts itself onto and modifies the d3 selection.
  // Sets up all of the layer groups before the data is bound
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
                 return (d.properties.blurb) ? 30 : 5;
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
        .each(function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          d.distance = Math.sqrt(dx * dx + dy * dy);
        })
        .style("fill-opacity", function(d) {return tightOpacityScale(d.distance)})
        .style("font-size", function(d) {return smallFontScale(d.distance)})

    svg.selectAll(".event")
        .each(function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          d.distance = Math.sqrt(dx * dx + dy * dy);
        })
        .style("stroke-opacity", function(d) {return opacityScale(d.distance)})

    svg.selectAll(".blurb")
        .attr("x", 30)
        .attr("y", 60)
        .each(function(d) {
          var c = path.centroid(d);
          var dx = width/2 - c[0];
          var dy = height/2 - c[1];
          d.distance = Math.sqrt(dx * dx + dy * dy);
        })
        .style("opacity", function(d) {return opacityScale(d.distance)})
        .style("font-size", function(d) {return bigFontScale(d.distance)})
  })

  queue()
      .defer(d3.json, "combined.json")
      .await(ready);

  // The default export, called when the required data (topojson file) is ready.
  function ready(error, topology) {
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

    bins = hexbin(locations).sort(function(a, b) { return b.length - a.length;});

    // calculate total yield for each bin
    bins.map(function(bin) {
     var sum = 0;
     var length = bin.length;
     for(var i = 0; i < length; i++) {
       sum += +(bin[i].properties.yield)
     }
     bin.totalyield = sum;
    })

    var yieldExtent = d3.extent(bins, function(bin) {
     return bin.totalyield;
    })

    // set scale domains for nuclear test symbology
    radius.domain(yieldExtent);
    z.domain(yieldExtent);
    hexagonStroke.domain([1, d3.max(bins, function(bin) {return bin.length})]);


    // find dominate country in bin and use that for color coding
    bins.map(function(d) {
      var length = d.length;
      for(var i = 0; i < length; i++) {
        var country = d[i].properties.country;
      }
      d.properties = {};
      d.properties.country = country;
    })

    g_hexagons = d3.select(".layer-base-hexagons-2");
    updateHexagons(projection, path);

    background.on("mousemove", function() {
      var p = d3.mouse(this);
      globe.rotate([(λ(p[0]) + center[0] % 360), (φ(p[1]) + center[1] % 90)]);
      updateHexagons(projection, path);
      updateSpikes(projection, path);
    });

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

  // ENTER, UPDATE, EXIT for hexagons (bins generated from hexbining of nuclear tests)
  function updateHexagons(projection, path) {
    var hexagons = g_hexagons.selectAll(".hexagon")
                      .data(bins.filter(function(d) {return visible(d, path)}))

    hexagons.enter().append("circle")

    hexagons.attr("r", function(d) { return radius(d.totalyield); })
        .each(function(d, i) {
          var test = {
                "type": "Point",
                "coordinates": [d.x, d.y] // spherical coordinates
              }
          var centroid = path.centroid(test);
          var dx = centroid[0] - width/2;
          var dy = height/2 - centroid[1]; //dy is pos when centroid is above equator
          d.angle = Math.atan(dy/dx); // angle of spike
          d.z = z(d.totalyield)
          d.tip = [d.z * Math.cos(d.angle), -1 * d.z * Math.sin(d.angle)]
          d.distance = Math.sqrt(dx * dx + dy * dy);
        })
        .classed("hexagon", true)
        .attr("id", function(d) {return d.properties.country})
        .attr("angle", function(d) {return d.angle * 180/Math.PI})
        .attr("transform", function(d) { return "translate(" + projection([d.x, d.y])[0] + "," + projection([d.x, d.y])[1] + ")"; })
        .style("stroke-width", function(d) {return hexagonStroke(d.length)})
        .style("fill-opacity", function(d) {return hexagonOpacity(d.distance)})
        .style("stroke-opacity", function(d) {return hexagonOpacity(d.distance)})

    hexagons.exit().remove();
  }


  // ENTER, UPDATE, EXIT for hexagons (bins generated from hexbining of nuclear tests)
  function updateSpikes(projection, path) {
    var spikes = g_hexagons.selectAll(".spike")
                      .data(bins.filter(function(d) {return visible(d, path)}))

    spikes.enter().append("path")

    spikes
        .classed("spike", true)
        .attr("id", function(d) {return d.properties.country})
        .attr("transform", function(d) { return "translate(" + projection([d.x, d.y])[0] + "," + projection([d.x, d.y])[1] + ")"; })
        .attr("d", function(d) {return "M0 0" + "l" + d.tip[0] + " " + (d.tip[1])})
        .style("stroke-width", function(d) {return hexagonStroke(d.length)})
        .style("fill-opacity", function(d) {return hexagonOpacity(d.distance)})
        .style("stroke-opacity", function(d) {return hexagonOpacity(d.distance)})

    spikes.exit().remove();
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
