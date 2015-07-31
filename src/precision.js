function precision(_) {
  if (arguments.length === 0) {
    return this._precision;
  }
  if (_) this._precision = _;
  this.trigger("change:projection");
  return this;
}

export {precision}
