import {layer_merge} from "./layer_merge";
import {layer_exit} from "./layer_exit";
import {zoomToFeature} from "./zoomToFeature";
import {resetAffine} from "./resetAffine";

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
                            .attr("class", "graticule")
                            .append("path");

  var layerSphere =    chart.base
                            .append("g")
                            .attr("class", "sphere")
                            .append("path");

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

    if(layer.label) {
      var labelBase = chart.base
                           .append("g")
                           .attr("class", "layer-labels-"+layer.object);
      var labelConfig = {
          dataBind: function(data) {
            var chart = this.chart();

            var toBind = (Array.isArray(data[layer.object]) ? data[layer.object] : [data[layer.object]]);

            // prune labels according to given label filter
            toBind = (layer.labelFilter) ? toBind.filter(layer.labelFilter) : toBind;

            // prune labels that are clipped by the projection
            toBind = toBind.filter(function(d) {
              var c = chart._path.centroid(d);
              return !(isNaN(c[0]) || isNaN(c[1]));
            })

            return this.selectAll("."+ "label-" + layer.object)
                        .data(toBind);
          },
          insert: function() {
            var chart = this.chart();
            var selection = this.append("text")
                                .classed("label-" + layer.object, true);

            return selection;
          },
          events: layer.events || {
            "update": function() {
              this.attr("transform", function(d) {return "translate(" + chart._path.centroid(d) + ")";})
                .text(layer.label);
              return this;
            },
            "exit": function() {
              this.remove();
              return this;
            }
          }
      }

      chart.layer(("layer-labels"+layer.object), labelBase, labelConfig);
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

        layerSphere
              .datum({type: "Sphere"})
              .attr("d", chart._path)
              .attr("class", "sphere");
      }

      chart._path.projection(chart._projection)
           .pointRadius(chart._pointRadius);

      this.draw(this.data);
    }
  });
}

export {chart_initialize}
