// Reads custom-property declarations out of a stylesheet with their selector, enclosing at-rules and exact text range,
// so the same pass can both collect token values and cut those declarations out of the copy the bundle ships.

const blankComments = css => css.replace(/\/\*[\s\S]*?\*\//g, m => ' '.repeat(m.length));

function skipString(css, i) {
  const quote = css[i];
  for (let j = i + 1; j < css.length; j++) {
    if (css[j] === '\\') j++;
    else if (css[j] === quote) return j + 1;
  }
  return css.length;
}

export function customProperties(source) {
  const css = blankComments(source);
  const found = [];
  const stack = [];
  let start = 0, parens = 0;
  const take = (valueEnd, end) => {
    const text = css.slice(start, valueEnd);
    const match = /^(\s*)--([\w-]+)\s*:([\s\S]*)$/.exec(text);
    const rule = stack.at(-1);
    if (match && rule && !rule.selector.startsWith('@')) {
      found.push({
        name: match[2],
        value: match[3].trim(),
        selector: rule.selector,
        atRules: stack.slice(0, -1).map(s => s.selector).filter(s => s.startsWith('@')),
        start: start + match[1].length,
        end,
      });
    }
  };
  for (let i = 0; i < css.length; i++) {
    const c = css[i];
    if (c === '"' || c === "'") { i = skipString(css, i) - 1; continue; }
    if (c === '(') parens++;
    else if (c === ')') parens--;
    else if (parens > 0) continue;
    else if (c === '{') { stack.push({selector: css.slice(start, i).trim().replace(/\s+/g, ' ')}); start = i + 1; }
    else if (c === ';') { take(i, i + 1); start = i + 1; }
    else if (c === '}') { take(i, i); stack.pop(); start = i + 1; }
  }
  return found;
}

export function removeRanges(source, ranges) {
  const sorted = [...ranges].sort((a, b) => b.start - a.start);
  return sorted.reduce((css, {start, end}) => css.slice(0, start) + css.slice(end), source);
}
