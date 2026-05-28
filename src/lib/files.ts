const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

export async function toDataURL(file: File): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error(`Failas per didelis. Maksimalus dydis — 3 MB (šis failas: ${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Nepavyko nuskaityti failo.'));
    reader.readAsDataURL(file);
  });
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}
