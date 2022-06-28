import { Buffer } from 'buffer'

export const toHex = (bytes: Uint8Array) => Buffer.from(bytes).toString('hex')
// export const utf8BytesToHex = (bytes: Uint8Array) => Buffer.from(bytes as any, 'utf8').toString('hex')
export const toHex_ = (str: string) => Buffer.from(str).toString('hex') // new TextEncoder().encode(toHex(utxoIdToRawBytes(utxos[0])))
export const fromHex = (hex: string) => Buffer.from(hex, 'hex')
export const fromHex_ = (bytes: Uint8Array) => Buffer.from(bytes as any, 'hex')
export const toUtf8 = (bytes: Uint8Array) => Buffer.from(bytes).toString()
export const hexToUtf8 = (hex: string) => Buffer.from(hex, 'hex').toString()
// new TextEncoder().encode(toHex(utxoIdToRawBytes(utxos[0])))

// Throws if UTF8 encoding fails
// export function hexToUtf8(s: string) {
//    const str = s.replace(/\s+/g, '') // remove spaces
//       .replace(/[0-9a-f]{2}/g, '%$&') // add '%' before each 2 characters
//       .toUpperCase()
//    console.log(str)
//    return decodeURI(
//       str
//    )
// }
// Doesn't throw if UTF8 encoding fails
// export function bufferToUtf8(bytes: Uint8Array) {
//    const str = new TextDecoder().decode(bytes)
//    console.log(str)
//    return str
// }

export function convertBase64ToBuffer(base64Image: string) {
   // Split into two parts
   const parts = base64Image.split(';base64,');

   // Decode Base64 string
   const decodedData = window.atob(parts[1]);

   // Create UNIT8ARRAY of size same as row data length
   const uInt8Array = new Uint8Array(decodedData.length);

   // Insert all character code into uInt8Array
   for (let i = 0; i < decodedData.length; ++i) {
     uInt8Array[i] = decodedData.charCodeAt(i);
   }

   return uInt8Array
}

export function convertBase64ToBuffer_(base64Image: string) {
   return fetch(base64Image).then(c => c.arrayBuffer()).then(b => new Uint8Array(b))
}

export function convertBase64ToBlob(base64Image: string) {
   // Split into two parts
   const parts = base64Image.split(';base64,');

   // Hold the content type
   const imageType = parts[0].split(':')[1];

   // Decode Base64 string
   const decodedData = window.atob(parts[1]);

   // Create UNIT8ARRAY of size same as row data length
   const uInt8Array = new Uint8Array(decodedData.length);

   // Insert all character code into uInt8Array
   for (let i = 0; i < decodedData.length; ++i) {
     uInt8Array[i] = decodedData.charCodeAt(i);
   }

   // Return BLOB image after conversion
   return new Blob([uInt8Array], { type: imageType });
}