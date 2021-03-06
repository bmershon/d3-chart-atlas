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

export {zoomToLayer}
