//helper delay chaining functions

const timedelay = t => new Promise(resolve => setTimeout(resolve, t));

export const delay = (cb, fl, t) => timedelay(t).then(cb).catch(fl);

Promise.prototype.delay = function (cb, fl, t) {
  return this.then(() => delay(cb, fl, t));
};
