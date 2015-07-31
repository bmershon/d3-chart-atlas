function scale(_) {
  if (arguments.length === 0) {
    return this._scale;
  }
  if (_) this._center = _;
  this.trigger("change:projection");
  return this;
}

export {scale}
