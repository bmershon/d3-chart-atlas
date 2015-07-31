function height(_) {
  if (arguments.length === 0) {
    return this._h;
  }
  this._h = _;
  this.trigger("change:projection");
  return this;
}

export {height}
