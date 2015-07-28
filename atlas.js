/*! d3.chart.atlas - v0.0.1
 *  License: MIT
 *  Date: 2015-07-15
 *  Brooks Mershon
 */
d3.chart("atlas", {

  initialize: function(options) {

    var chart = this;

    chart.base = chart.base.append("g").attr("class", "base")

    chart.options = options || {};

    chart._w = chart.base.attr("width") || 960;
    chart.h = chart.base.attr("height") || 500;

    chart._projection = d3.geo.orthographic().clipAngle(90);
    chart._path = d3.geo.path();
    chart._graticule = d3.geo.graticule();
    chart._precision = Math.sqrt(2);
    chart._scale = 1;
    chart._translate = [0, 0];
    chart._rotation = [0,0,0];
    chart._path.projection(chart._projection)

    var layerGraticule = chart.base
                              .append("g")
                              .attr("class", "layer-graticule")
                              .append("path");

    function merge() {
      var chart = this.chart();
      chart._path.projection(chart._projection
                                  .scale(chart._scale)
                                  .rotate(chart._rotation)
                                  .precision(chart._precision)
                                  .translate(chart._translate));

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
      })
    }

    chart.options.layers.forEach(function(layer) {

      var layerBase = chart.base
                           .append("g")
                           .attr("class", "layer-base-"+layer.object);

      chart.layer(("layer-"+layer.object), layerBase, {
        dataBind: layer.databind || function(data) {
          var chart = this.chart();

          return this.selectAll("."+layer.class)
                     .data(data[layer.object]);
        },
        insert: layer.insert || function() {
            var chart = this.chart();
            var selection = this.append("path")
                .attr("class", layer.class)
                .classed(layer.classed || "", true)
                .attr("id", layer.id);


            // register all named user interaction types and callbacks
            if(layer.interactions) {
              for(e in layer.interactions) {
                if(layer.interactions.hasOwnProperty(e)){
                  selection.on(e, layer.interactions[e]);
                }
              }
            }

            return selection;
        },

        // register lifecyle events
        events: layer.events || {
          "merge": merge,
          "exit": exit
        }
      });
    })


    // translate and scale SVG, don't change projection
    chart.zoomToFeature = function(feature) {
      // TODO
      return this;
    }

    chart.on("change:projection", function() {

      if (this.data) {

        chart._path.projection(chart._projection
                                    .scale(chart._scale)
                                    .rotate(chart._rotation)
                                    .precision(chart._precision)
                                    .translate(chart._translate));

        layerGraticule
          .datum(chart._graticule)
          .attr("d", chart._path)
          .attr("class", "graticule");

        this.draw(this.data);
      }
    });

  },

  width: function(_) {
    if (arguments.length === 0) {
      return this._w;
    }
    this._w = _;
    return this;
  },

  height: function(_) {
    if (arguments.length === 0) {
      return this.h;
    }
    this.h = _;
    return this;
  },

  projection: function(_) {
    if (arguments.length === 0) {
      return this._projection;
    }
    if (_) this._projection = _;
    return this;
  },

  path: function(_) {
    if (arguments.length === 0) {
      return this._path;
    }
    if (_) this._path = _;
    return this;
  },

  graticule: function(_) {
    if (arguments.length === 0) {
      return this._graticule;
    }
    this._graticule = _;
    return this;
  },

  transform: function(data) {
    var chart = this;

    if(!(data.type == "Topology")) return data;

    this.topology = data;


    var t = {};

    this.options.layers.forEach(function(layer) {
      t[layer.object] = topojson.feature(data, data.objects[layer.object]).features;
    })

    this.data = t;

    chart.trigger("change:projection");
    return t;
  },

  scale: function(_) {
    if (arguments.length === 0) {
      return this._scale;
    }
    if (_) this._center = _;
    return this;
  },

  center: function(_) {
    if (arguments.length === 0) {
      return this._scale;
    }
    if (_) this._center = _;
    return this;
  },

  precision: function(_) {
    if (arguments.length === 0) {
      return this._precision;
    }
    if (_) this._precision = _;
    return this;
  },

  rotate: function(_) {
    if (arguments.length === 0) {
      return this._rotation;
    }
    if (_) this._rotation = _;
    return this;
  },

  translate: function(_) {
    if (arguments.length === 0) {
      return this._translate;
    }
    if (_) this._translate = _;
    return this;
  },

  /*
    change the map projection
    intended for initial setup, where the appropriate bounding box for an
    entire array of paths belonging to a layer is unknown

    _ is layer object name
  */
  zoomToLayer: function(_) {
    if (arguments.length === 0) {
      return this._projection;
    }

    var chart = this;
    if(this.data) {

      var layerObject = _;

      var mesh = topojson.mesh(this.topology, this.topology.objects[layerObject]);
      var b = this._path.bounds(mesh),
        s = .95 / Math.max((b[1][0] - b[0][0]) / this._w, (b[1][1] - b[0][1]) / this.h),
        t = [(this._w - s * (b[1][0] + b[0][0])) / 2, (this.h - s * (b[1][1] + b[0][1])) / 2];

      this._scale = s;
      this._translate = t;

      this.trigger("change:projection");
    }

    return this;
  }

});
