import qrcode from 'qrcode-generator';

/**
 * A QR code for a printed activity card (DESIGN.md › Individual activity:
 * "include short URL/QR as optional extras"). Built at build time as one SVG
 * path, so the page ships no QR script and the code prints crisply.
 */
export function qrSvg(url: string, label: string): string {
  const qr = qrcode(0, 'M');
  qr.addData(url);
  qr.make();
  const size = qr.getModuleCount();
  const quiet = 4;
  let path = '';
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (qr.isDark(row, col)) path += `M${col + quiet} ${row + quiet}h1v1h-1z`;
    }
  }
  const box = size + quiet * 2;
  const title = label.replace(/[<>&"]/g, '');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${box} ${box}" role="img" aria-label="${title}" shape-rendering="crispEdges"><rect width="${box}" height="${box}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
