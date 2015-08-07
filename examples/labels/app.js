(function() {
  var margin = {top: 20, right: 20, bottom: 20, left: 20},
      padding = {top: 60, right: 60, bottom: 60, left: 60},
      outerWidth = 1200,
      outerHeight = 800,
      innerWidth = outerWidth - margin.left - margin.right,
      innerHeight = outerHeight - margin.top - margin.bottom,
      width = innerWidth - padding.left - padding.right,
      height = innerHeight - padding.top - padding.bottom;

  var smallFontScale = d3.scale.linear().domain([height/2, 0]).range([8, 18]);
  var bigFontScale = d3.scale.linear().domain([height/2, 0]).range([8, 22]);
  var opacityScale = d3.scale.linear().domain([.8*height/2, 0]).range([0, 1]);
  var tightOpacityScale = d3.scale.linear().domain([.6*height/2, 0]).range([0, .6]);

  var center = [165, 0];

  var λ = d3.scale.linear()
      .domain([0, outerWidth])
      .range([-210, 210]);

  var φ = d3.scale.linear()
      .domain([0, outerHeight])
      .range([90, -90]);

  var data;

  var background = d3.select("#map")
                    .append("svg")
                    .attr("width", outerWidth)
                    .attr("height", outerHeight);

  var svg = background.append("g").attr("transform", "translate(" + (margin.left + padding.left)+ "," + (margin.top + padding.top) + ")");

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

  // nuclear tests
  options.layers.push({
    class: "test",
    id: function(d) {return d.properties.country},
    object: "nuclear"
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
                 return (d.properties.blurb) ? 20 : 7;
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
    data = topology;
    globe.draw(data)
     .rotateToLayer("land");

    background.on("mousemove", function() {
      var p = d3.mouse(this);
      globe.rotate([(λ(p[0]) + center[0] % 360), (φ(p[1]) + center[1] % 90)]);
    });

    var globe_highlight = svg.append("defs").append("radialGradient")
          .attr("id", "globe_highlight")
          .attr("cx", "75%")
          .attr("cy", "25%");
        globe_highlight.append("stop")
          .attr("offset", "5%").attr("stop-color", "#ffd")
          .attr("stop-opacity","0.6");
        globe_highlight.append("stop")
          .attr("offset", "100%").attr("stop-color", "#ba9")
          .attr("stop-opacity","0.2");

    var globe_shading = svg.append("defs").append("radialGradient")
          .attr("id", "globe_shading")
          .attr("cx", "55%")
          .attr("cy", "45%");
        globe_shading.append("stop")
          .attr("offset","30%").attr("stop-color", "#fff")
          .attr("stop-opacity","0")
        globe_shading.append("stop")
          .attr("offset","100%").attr("stop-color", "#4a4a4a")
          .attr("stop-opacity","0.4")

    var drop_shadow = svg.append("defs").append("radialGradient")
          .attr("id", "drop_shadow")
          .attr("cx", "50%")
          .attr("cy", "50%");
        drop_shadow.append("stop")
          .attr("offset","20%").attr("stop-color", "#000")
          .attr("stop-opacity",".25")
        drop_shadow.append("stop")
          .attr("offset","100%").attr("stop-color", "#000")
          .attr("stop-opacity","0")

    ellipse
          .attr("cx", width * .45).attr("cy", outerHeight*.95)
          .attr("rx", globe.scale()*.7)
          .attr("ry", globe.scale()*.20)
          .attr("class", "noclicks")
          .style("fill", "url(#drop_shadow)");

    svg.append("circle")
          .attr("cx", width / 2).attr("cy", height / 2)
          .attr("r", globe.scale())
          .attr("class","noclicks")
          .style("fill", "url(#globe_highlight)");

    svg.append("circle")
          .attr("cx", width / 2).attr("cy", height / 2)
          .attr("r", globe.scale())
          .attr("class","noclicks")
          .style("fill", "url(#globe_shading)");
  }

})();
