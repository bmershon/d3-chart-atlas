function zoomToFeature(d) {
 var b = this._path.bounds(d),
   s = .9 / Math.max((b[1][0] - b[0][0]) / this._w, (b[1][1] - b[0][1]) / this._h),
   t = [(this._w - s * (b[1][0] + b[0][0])) / 2, (this._h - s * (b[1][1] + b[0][1])) / 2];

 chart.base
    .transition()
      .duration(750)
      .attr("transform", "translate(" + t + ")scale(" + s + ")");
}

export {zoomToFeature}
