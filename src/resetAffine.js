function resetAffine() {
 chart.base
    .transition()
      .duration(750)
      .attr("transform", "");
}

export {resetAffine}
