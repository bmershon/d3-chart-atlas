function projection(_) {
  if (arguments.length === 0) {
    return this._projection;
  }
  this._projection = _;
  this.trigger("change:projection");
  return this;
}

export {projection}
