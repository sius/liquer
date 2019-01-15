function trimQuotes(str) {
  if (str && typeof(str) === 'string') {
    const res = /^"*(.*)"+$/.exec(str)
    return (res) ? res[1] : str;
  }
  return str
}

function rtrim(s, ...args) {
  if (!s || typeof(s) !== 'string') {
    return s;
  }
  args.forEach( (arg) => {
    if (s.endsWith(arg)) {
      s = s.substring(0, s.length - arg.length);
    }
  })
  return s;
}

module.exports = { trimQuotes, rtrim }
