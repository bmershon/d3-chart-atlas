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

export {initialize}
