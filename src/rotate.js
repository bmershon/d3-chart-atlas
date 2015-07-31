function rotate(_) {
  if (arguments.length === 0) {
    return this._rotation;
  }
  if (_) this._rotation = _;
  this.trigger("change:projection");
  return this;
}

export {rotate}
