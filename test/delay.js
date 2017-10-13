//helper delay chaining functions

const timedelay = t => new Promise(resolve => setTimeout(resolve, t));

export const delay = (cb, t) => timedelay(t).then(cb);

Promise.prototype.delay = function (cb, t) {
  return this.then(() => delay(cb, t));
};
