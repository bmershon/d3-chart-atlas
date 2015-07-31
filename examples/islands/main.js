(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function center(_) {
  if (arguments.length === 0) {
    return this._scale;
  }
  if (_) this._center = _;
  this.trigger("change:projection");
  return this;
}

function graticule(_) {
  if (arguments.length === 0) {
    return this._graticule;
  }
  this._graticule = _;
  this.trigger("change:projection");
  return this;
}

function height(_) {
  if (arguments.length === 0) {
    return this._h;
  }
  this._h = _;
  this.trigger("change:projection");
  return this;
}

function layer_merge() {
  var chart = this.chart();

  if (chart._projection) {
    chart._projection
         .scale(chart._scale)
         .rotate(chart._rotation)
         .precision(chart._precision)
         .translate(chart._translate);
  }

  chart._path.projection(chart._projection)
       .pointRadius(chart._pointRadius);

  return this.attr("d", chart._path);
}

function layer_exit() {
  var chart = this.chart();

  return this.remove();
}

function zoomToFeature(d) {
 var b = this._path.bounds(d),
   s = .9 / Math.max((b[1][0] - b[0][0]) / this._w, (b[1][1] - b[0][1]) / this._h),
   t = [(this._w - s * (b[1][0] + b[0][0])) / 2, (this._h - s * (b[1][1] + b[0][1])) / 2];

 chart.base
    .transition()
      .duration(750)
      .attr("transform", "translate(" + t + ")scale(" + s + ")");
}

function resetAffine() {
 chart.base
    .transition()
      .duration(750)
      .attr("transform", "");
}

function initialize(options) {
  var chart = this;

  chart.base = chart.base.append("g").attr("class", "base");
  chart.options = options || {};
  chart._w = chart.base.attr("width") || 960;
  chart._h = chart.base.attr("height") || 500;
  chart._projection = d3.geo.orthographic().clipAngle(90);
  chart._path = d3.geo.path();
  chart._graticule = d3.geo.graticule();
  chart._precision = Math.sqrt(2);
  chart._scale = 1;
  chart._translate = [0, 0];
  chart._rotation = [0,0,0];

  var layerGraticule = chart.base
                            .append("g")
                            .attr("class", "layer-graticule")
                            .append("path");

  if(options.dispatch) {
    chart.dispatch = options.dispatch;

    chart.dispatch.on("zoomToFeature", function(d, i) {
      chart.zoomToFeature(d);
    });

    chart.dispatch.on("resetAffine", function(d, i) {
      chart.resetAffine();
    });
  }

  chart.options.layers.forEach(function(layer) {

    var layerBase = chart.base
                         .append("g")
                         .attr("class", "layer-base-"+layer.object);

    var layerConfig = {
        dataBind: layer.databind || function(data) {
          var chart = this.chart();

          var toBind = (Array.isArray(data[layer.object]) ? data[layer.object] : [data[layer.object]]);
          toBind = (layer.filter) ? toBind.filter(layer.filter) : toBind;

          return this.selectAll("."+layer.object)
                      .data(toBind);
        },
        insert: layer.insert || function() {
          var chart = this.chart();
          var selection = this.append("path")
                              .attr("class", layer.class || layer.object)
                              .classed(layer.object, true)
                              .attr("id", layer.id || function(d, i) {return i});

          if(layer.interactions) {
            for(e in layer.interactions) {
              if(layer.interactions.hasOwnProperty(e)){
                selection.on(e, layer.interactions[e]);
              }
            }
          }

          return selection;
        },
        events: layer.events || {
          "merge": layer_merge,
          "exit": layer_exit
        }
    }

    chart.layer(("layer-"+layer.object), layerBase, layerConfig);

  });

  // translate and scale SVG, don't change projection
  chart.zoomToFeature = zoomToFeature;

  // zero the base transform and scale
  chart.resetAffine = resetAffine;

  chart.on("change:projection", function() {

    if (this.data) {

      if(chart._projection) {
        chart._projection
              .scale(chart._scale)
              .rotate(chart._rotation)
              .precision(chart._precision)
              .translate(chart._translate);

        layerGraticule
              .datum(chart._graticule)
              .attr("d", chart._path)
              .attr("class", "graticule");
      }

      chart._path.projection(chart._projection)
           .pointRadius(chart._pointRadius);

      this.draw(this.data);
    }
  });
}

function path(_) {
  if (arguments.length === 0) {
    return this._path;
  }
  if (_) this._path = _;
  this.trigger("change:projection");
  return this;
}

function pointRadius(_) {
  if (arguments.length === 0) {
    return this._pointRadius;
  }
  if (_) this._pointRadius = _;
  this.trigger("change:projection");
  return this;
}

function precision(_) {
  if (arguments.length === 0) {
    return this._precision;
  }
  if (_) this._precision = _;
  this.trigger("change:projection");
  return this;
}

function projection(_) {
  if (arguments.length === 0) {
    return this._projection;
  }
  this._projection = _;
  this.trigger("change:projection");
  return this;
}

function rotate(_) {
  if (arguments.length === 0) {
    return this._rotation;
  }
  if (_) this._rotation = _;
  this.trigger("change:projection");
  return this;
}

function scale(_) {
  if (arguments.length === 0) {
    return this._scale;
  }
  if (_) this._center = _;
  this.trigger("change:projection");
  return this;
}

function transform(data) {

  var chart = this;

  // data is not new; data has already been transformed
  if(!(data.type == "Topology")) return data;

  var t = {};

  this.options.layers.forEach(function(layer) {
    if(data.objects[layer.object].type == "GeometryCollection") {
      t[layer.object] = topojson.feature(data, data.objects[layer.object]).features;
    }

    if(data.objects[layer.object].type == "MultiPolygon") {
      t[layer.object] = topojson.feature(data, data.objects[layer.object]);
    }
  })

  this.topology = data;
  this.data = t;

  // currentlying being used to update graticule
  chart.trigger("change:projection");
  return t;
}

function translate(_) {
  if (arguments.length === 0) {
    return this._translate;
  }
  if (_) this._translate = _;
  this.trigger("change:projection");
  return this;
}

function width(_) {
  if (arguments.length === 0) {
    return this._w;
  }
  this._w = _;
  this.trigger("change:projection");
  return this;
}

function zoomToLayer(_) {
  if (arguments.length === 0) {
    return this._projection;
  }

  var chart = this;

  if(this.data) {
    var layerObject = _;

    var mesh = topojson.mesh(this.topology, this.topology.objects[layerObject]);
    var b = this._path.bounds(mesh),
      s = .9 / Math.max((b[1][0] - b[0][0]) / this._w, (b[1][1] - b[0][1]) / this._h),
      t = [(this._w - s * (b[1][0] + b[0][0])) / 2, (this._h - s * (b[1][1] + b[0][1])) / 2];

    this._scale = s;
    this._translate = t;
  }

  this.trigger("change:projection");
  return this;
}

var configuration = {};

// required by d3.chart specification
configuration.initialize = initialize;

// optional data transform "hook" method to transform incoming data
configuration.transform = transform;

// accessors and mutators
configuration.width = width;
configuration.height = height;
configuration.projection = projection;
configuration.rotate = rotate;
configuration.graticule = graticule;
configuration.scale = scale;
configuration.translate = translate;
configuration.center = center;
configuration.precision = precision;
configuration.pointRadius = pointRadius;
configuration.zoomToLayer = zoomToLayer;

var atlas = function() {
  d3.chart("atlas", configuration);
}

exports.atlas = atlas;

},{}],2:[function(require,module,exports){
'use strict';

var atlas = require('../../atlas.js');

atlas();

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

},{"../../atlas.js":1}]},{},[2]);
