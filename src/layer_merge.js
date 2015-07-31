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

export {layer_merge}
