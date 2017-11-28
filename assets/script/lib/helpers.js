'use strict';

Array.prototype.removeElement = function (from, to) {
  const rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  this.push(...rest);
  return this;
};