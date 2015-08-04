(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
}(this, function () { 'use strict';

    var configuration = {};

    function resetAffine() {
     chart.base
        .transition()
          .duration(750)
          .attr("transform", "");
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

    function layer_exit() {
      var chart = this.chart();

      return this.remove();
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

    function chart_initialize(options) {
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
                for(var e in layer.interactions) {
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


    // required by d3.chart specification
    configuration.initialize = chart_initialize;

    function chart_transform(data) {

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


    // optional data transform "hook" method to transform incoming data
    configuration.transform = chart_transform;

    function center(_) {
      if (arguments.length === 0) {
        return this._scale;
      }
      if (_) this._center = _;
      this.trigger("change:projection");
      return this;
    }


    // accessors and mutators
    configuration.center = center;

    function graticule(_) {
      if (arguments.length === 0) {
        return this._graticule;
      }
      this._graticule = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.graticule = graticule;

    function height(_) {
      if (arguments.length === 0) {
        return this._h;
      }
      this._h = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.height = height;

    function path(_) {
      if (arguments.length === 0) {
        return this._path;
      }
      if (_) this._path = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.path = path;

    function projection(_) {
      if (arguments.length === 0) {
        return this._projection;
      }
      this._projection = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.projection = projection;

    function rotate(_) {
      if (arguments.length === 0) {
        return this._rotation;
      }
      if (_) this._rotation = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.rotate = rotate;

    function scale(_) {
      if (arguments.length === 0) {
        return this._scale;
      }
      if (_) this._center = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.scale = scale;

    function translate(_) {
      if (arguments.length === 0) {
        return this._translate;
      }
      if (_) this._translate = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.translate = translate;

    function precision(_) {
      if (arguments.length === 0) {
        return this._precision;
      }
      if (_) this._precision = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.precision = precision;

    function pointRadius(_) {
      if (arguments.length === 0) {
        return this._pointRadius;
      }
      if (_) this._pointRadius = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.pointRadius = pointRadius;

    function width(_) {
      if (arguments.length === 0) {
        return this._w;
      }
      this._w = _;
      this.trigger("change:projection");
      return this;
    }

    configuration.width = width;

    function zoomToLayer(_, _filter) {
      if (arguments.length === 0) {
        return this._projection;
      }

      var f = (typeof _filter === 'undefined') ? function(d) {return true} : _filter;

      var chart = this;

      if(this.data) {
        var layerObject = _;
        var collection = {type: "FeatureCollection", features: this.data[layerObject].filter(f)};

        var b = (collection.features.length == 0) ? [[-1,-1], [1,1]] : chart._path.bounds(collection),
            s = .9 / Math.max((b[1][0] - b[0][0]) / chart._w, (b[1][1] - b[0][1]) / chart._h),
            t = [(chart._w - s * (b[1][0] + b[0][0])) / 2, (chart._h - s * (b[1][1] + b[0][1])) / 2];
        chart._scale = s;
        chart._translate = t;
      }

      chart.trigger("change:projection");
      return this;
    }

    configuration.zoomToLayer = zoomToLayer;


    // Use for orthographic projections, where a translate is not appropriate
    function rotateToLayer(_, _filter) {
      if (arguments.length === 0) {
        return this._projection;
      }

      var f = (typeof _filter === 'undefined') ? function(d) {return true} : _filter;

      var chart = this;

      if(this.data) {
        var layerObject = _;
        var collection = {type: "FeatureCollection", features: this.data[layerObject]};
        var filteredCollection = {type: "FeatureCollection", features: this.data[layerObject].filter(f)};

        var b = [[-1,-1], [1,1]],
            c = d3.geo.centroid(filteredCollection),
            s = .9 / Math.max((b[1][0] - b[0][0]) / chart._w, (b[1][1] - b[0][1]) / chart._h),
            t = [(chart._w - s * (b[1][0] + b[0][0])) / 2, (chart._h - s * (b[1][1] + b[0][1])) / 2];
        chart._scale = s;
        chart._translate = t;

        c = [-c[0], -c[1]];
        chart._rotation = c;
      }

      chart.trigger("change:projection");
      return this;
    }

    configuration.rotateToLayer = rotateToLayer;



    // THIS FILE IS USED FOR ITS "SIDE EFFECT", rather than any of its bindings or
    // its exposed functions

    // Assumes d3.chart has already been included
    d3.chart("atlas", configuration);

}));