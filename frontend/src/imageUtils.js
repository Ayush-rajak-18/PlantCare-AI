/* ---------------------------------------------------------
   compressImage: phone ki badi photo ko upload se pehle chhota karta hai
   (max 1200px, JPEG). Isse upload tez hota hai.
   Kuch bhi galat ho to original file wapas de deta hai.
--------------------------------------------------------- */
export async function compressImage(file, maxSize = 1200, quality = 0.85) {
  try {
    if (!file.type.startsWith("image/")) return file;

    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(bitmap, 0, 0, width, height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
    if (!blob) return file;

    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

// Photo choose karte waqt common checks. Galat ho to message wapas karta hai.
export function checkImageFile(file) {
  if (!file) return "No file selected.";
  if (!file.type.startsWith("image/")) return "Please choose an image file.";
  if (file.size > 12 * 1024 * 1024) return "Image is too large (max 12 MB).";
  return "";
}
