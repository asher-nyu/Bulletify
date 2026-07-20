export function convertText(value: string): string {
  let text = value;

  text = text.replace(/\r?\n/g, ' ').trim();
  text = text.replace(/^\s*(?:-|\u2022|\*)\s*/, '');
  text = text.replace(/\s*\u2022\s*/g, '\n\n- ');
  text = text.replace(/\s*\*\s*/g, '\n\n- ');
  text = text.replace(/\s+-\s*/g, '\n\n- ');
  text = text.replace(/[^\S\r\n]+/g, ' ').trim();

  if (text && !text.startsWith('- ')) {
    text = '- ' + text;
  }

  return text.trim();
}
