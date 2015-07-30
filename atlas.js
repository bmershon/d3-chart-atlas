/*! d3.chart.atlas - v0.0.1
 *  License: MIT
 *  Date: 2015-07-15
 *  Brooks Mershon
 */

!function(){
  var configuration = {};

  // required by d3.chart specification
  configuration.initialize = _initialize;

  // optional data transform "hook" method to transform incoming data
  configuration.transform = _transform;

  // accessors and mutators
  configuration.width = _width;
  configuration.height = _height;
  configuration.projection = _projection;
  configuration.rotate = _rotate;
  configuration.graticule = _graticule;
  configuration.scale = _scale;
  configuration.translate = _translate;
  configuration.center = _center;
  configuration.precision = _precision;
  configuration.pointRadius = _pointRadius;
  configuration.zoomToLayer = _zoomToLayer;

  function _initialize(options) {
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

    function merge() {
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

    function exit() {
      var chart = this.chart();

      return this.remove();
    }


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
            "merge": merge,
            "exit": exit
          }
      }

      chart.layer(("layer-"+layer.object), layerBase, layerConfig);

    });

    // translate and scale SVG, don't change projection
    chart.zoomToFeature = function(d) {
     var b = this._path.bounds(d),
       s = .9 / Math.max((b[1][0] - b[0][0]) / this._w, (b[1][1] - b[0][1]) / this._h),
       t = [(this._w - s * (b[1][0] + b[0][0])) / 2, (this._h - s * (b[1][1] + b[0][1])) / 2];

     chart.base
        .transition()
          .duration(750)
          .attr("transform", "translate(" + t + ")scale(" + s + ")");
    }

    // zero the base transform and scale
    chart.resetAffine = function() {
     chart.base
        .transition()
          .duration(750)
          .attr("transform", "");
    }

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

  function _width(_) {
    if (arguments.length === 0) {
      return this._w;
    }
    this._w = _;
    this.trigger("change:projection");
    return this;
  }

  function _height(_) {
    if (arguments.length === 0) {
      return this._h;
    }
    this._h = _;
    this.trigger("change:projection");
    return this;
  }

  function _projection(_) {
    if (arguments.length === 0) {
      return this._projection;
    }
    this._projection = _;
    this.trigger("change:projection");
    return this;
  }

  function _path(_) {
    if (arguments.length === 0) {
      return this._path;
    }
    if (_) this._path = _;
    this.trigger("change:projection");
    return this;
  }

  function _graticule(_) {
    if (arguments.length === 0) {
      return this._graticule;
    }
    this._graticule = _;
    this.trigger("change:projection");
    return this;
  }

  function _transform(data) {

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

  function _scale(_) {
    if (arguments.length === 0) {
      return this._scale;
    }
    if (_) this._center = _;
    this.trigger("change:projection");
    return this;
  }

  function _center(_) {
    if (arguments.length === 0) {
      return this._scale;
    }
    if (_) this._center = _;
    this.trigger("change:projection");
    return this;
  }

  function _precision(_) {
    if (arguments.length === 0) {
      return this._precision;
    }
    if (_) this._precision = _;
    this.trigger("change:projection");
    return this;
  }

  function _rotate(_) {
    if (arguments.length === 0) {
      return this._rotation;
    }
    if (_) this._rotation = _;
    this.trigger("change:projection");
    return this;
  }

  function _translate(_) {
    if (arguments.length === 0) {
      return this._translate;
    }
    if (_) this._translate = _;
    this.trigger("change:projection");
    return this;
  }

  function _pointRadius(_) {
    if (arguments.length === 0) {
      return this._pointRadius;
    }
    if (_) this._pointRadius = _;
    this.trigger("change:projection");
    return this;
  }

  function _zoomToLayer(_) {
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

  // create d3.chart generator from configuration object, which includes
  // initialize, transform, accessors/mutators ...
  d3.chart("atlas", configuration);
}();
