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

export {chart_transform}
