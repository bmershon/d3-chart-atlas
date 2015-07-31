function translate(_) {
  if (arguments.length === 0) {
    return this._translate;
  }
  if (_) this._translate = _;
  this.trigger("change:projection");
  return this;
}

export {translate}
