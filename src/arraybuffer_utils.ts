
export function arrayBufferToBase64(buffer : ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

export function stringToArrayBuffer(str: string): ArrayBuffer {
    const encoder = new TextEncoder();
    return encoder.encode(str).buffer;
}

export function arrayBufferToString(buffer: ArrayBuffer) {
    const decoder = new TextDecoder('utf-8');
    const str = decoder.decode(buffer);

    return str;
}

export function concatenateArrayBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    // Create a new Uint8Array with the combined length of both buffers
    const combined = new Uint8Array(buffer1.byteLength + buffer2.byteLength);

    // Set the values from the first buffer
    combined.set(new Uint8Array(buffer1), 0);

    // Set the values from the second buffer
    combined.set(new Uint8Array(buffer2), buffer1.byteLength);

    // Return the combined ArrayBuffer
    return combined.buffer;
}

const byteToHex : string[] = [];

for (let n = 0; n <= 0xff; ++n)
{
    const hexOctet = n.toString(16).padStart(2, "0");
    byteToHex.push(hexOctet);
}

export function arrayBufferToHex(arrayBuffer:ArrayBuffer) : string
{
    const buff = new Uint8Array(arrayBuffer);
    const hexOctets = []; // new Array(buff.length) is even faster (preallocates necessary array size), then use hexOctets[i] instead of .push()

    for (let i = 0; i < buff.length; ++i)
        hexOctets.push(byteToHex[buff[i]]);

    return hexOctets.join("");
}

export function hexToArrayBuffer( hexString: string) {
    return Uint8Array.from(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));
}

// // Encoding UTF-8 ⇢ base64

// export function base64EncodeUnicode(str:string) : string {
//     return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
//         return String.fromCharCode(parseInt(p1, 16))
//     }))
// }

// // Decoding base64 ⇢ UTF-8

// export function base64DecodeUnicode(str:string) {
//     return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
//         return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
//     }).join(''))
// }

// export function base64ToBytes(base64:string) {
//     const binString = atob(base64);
//     return Uint8Array.from(binString, (m) => m.codePointAt(0));
//   }
  
// export function bytesToBase64(bytes:ArrayBuffer) {
//     const binString = Array.from(bytes, (byte) =>
//       String.fromCodePoint(byte),
//     ).join("");
//     return btoa(binString);
//   }