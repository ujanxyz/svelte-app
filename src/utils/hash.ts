export async function sha256Hex(input: Blob | ArrayBuffer): Promise<string> {
  const data = input instanceof Blob ? await input.arrayBuffer() : input;
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < bytes.length; i += 1) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}
