export const fmtM = v => {
  const abs = Math.abs(v)
  const s = abs >= 1e6 ? (abs/1e6).toFixed(1)+'M' : abs >= 1e3 ? (abs/1e3).toFixed(0)+'K' : abs.toFixed(0)
  return (v < 0 ? '-$' : '$') + s
}
export const fmtPct = v => v.toFixed(1) + '%'
export const sum = arr => arr.reduce((a,b) => a+b, 0)
