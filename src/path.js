function path(_) {
  if (arguments.length === 0) {
    return this._path;
  }
  if (_) this._path = _;
  this.trigger("change:projection");
  return this;
}

export {path}
