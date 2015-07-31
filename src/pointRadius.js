function pointRadius(_) {
  if (arguments.length === 0) {
    return this._pointRadius;
  }
  if (_) this._pointRadius = _;
  this.trigger("change:projection");
  return this;
}

export {pointRadius}
