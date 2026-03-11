function flagsToBits(flags) {
  const pows = [];

  while (flags > 0) {
    const pow = getLastBitIndexBefore(flags);
    pows.push(pow);
    flags -= Math.pow(2, pow);
  }

  return pows.sort((a, b) => a - b);
}

module.exports = flagsToBits;

function getLastBitIndexBefore(n) {
  let v = 1, p = -1;

  while (v <= n) {
    v = v * 2;
    p++;
  }

  return p;
}
