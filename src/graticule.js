function graticule(_) {
  if (arguments.length === 0) {
    return this._graticule;
  }
  this._graticule = _;
  this.trigger("change:projection");
  return this;
}

export {graticule}
