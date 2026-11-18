/**
 * GAME-058: a photo the person picks on this device, cropped to a centered square
 * in the browser. Nothing is uploaded, stored or sent. The chosen file is read
 * through an object URL that is released as soon as the crop is drawn, and the
 * cropped result is also an object URL that the game releases when it is replaced.
 */

/** Largest file offered; matches the Photo pairs limit. */
export const OWN_PHOTO_MAX_BYTES = 40 * 1024 * 1024;

/** Side of the cropped square in pixels. Enough for a large piece on screen and for paper. */
export const OWN_PHOTO_SIDE = 720;

/** The centered square inside a width by height picture: its side and where it starts. */
export function centeredSquare(width: number, height: number): { side: number; x: number; y: number } {
  const side = Math.min(width, height);
  return { side, x: (width - side) / 2, y: (height - side) / 2 };
}

/** Whether a chosen file is an image small enough to use. */
export function isUsablePhoto(file: File): boolean {
  return file.type.startsWith('image/') && file.size <= OWN_PHOTO_MAX_BYTES;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => (img.naturalWidth > 0 && img.naturalHeight > 0 ? resolve(img) : reject(new Error('empty photo')));
    img.onerror = () => reject(new Error('unreadable photo'));
    img.src = src;
  });
}

function toJpeg(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no image'))), 'image/jpeg', 0.9);
  });
}

/**
 * Crops the chosen photo to a centered square and returns an object URL for the
 * result. Re-encoding through a canvas also drops the camera's metadata, such as
 * location and time. Rejects when the browser cannot read the file. The caller
 * owns the returned URL and must revoke it.
 */
export async function squarePhotoUrl(file: File, outSide = OWN_PHOTO_SIDE): Promise<string> {
  const source = URL.createObjectURL(file);
  try {
    const img = await loadImage(source);
    const { side, x, y } = centeredSquare(img.naturalWidth, img.naturalHeight);
    const out = Math.min(side, outSide);
    const canvas = document.createElement('canvas');
    canvas.width = out;
    canvas.height = out;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no canvas');
    ctx.drawImage(img, x, y, side, side, 0, 0, out, out);
    return URL.createObjectURL(await toJpeg(canvas));
  } finally {
    URL.revokeObjectURL(source);
  }
}
