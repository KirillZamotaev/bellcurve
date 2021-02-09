export function getProbabilityData(normalizedData, m, v) {
  const data = [];
  for (var i = 0; i < normalizedData.length; ++i) {
    var q = normalizedData[i],
      p = probabilityDensityCalculation(q, m, v),
      el = {
        q: q,
        p: p,
      };
    data.push(el);
  }
  data.sort((x, y) => x.q - y.q);
  return data;
}

export function probabilityDensityCalculation(x, mean, variance) {
  var m = Math.sqrt(2 * Math.PI * variance);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
}
