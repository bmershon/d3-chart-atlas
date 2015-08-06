function sphere(_) {
  if (arguments.length === 0) {
    return this._sphere;
  }
  this._sphere = _;
  this.trigger("change:projection");
  return this;
}

export {sphere}
