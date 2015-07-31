function width(_) {
  if (arguments.length === 0) {
    return this._w;
  }
  this._w = _;
  this.trigger("change:projection");
  return this;
}

export {width}
