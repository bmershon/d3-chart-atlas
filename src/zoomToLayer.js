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

export {zoomToLayer};
