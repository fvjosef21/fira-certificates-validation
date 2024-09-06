import { ReactNode, useState } from 'react';
import {certificateFromQuery} from './Certificate';
import { base64ToArrayBuffer } from './arraybuffer_utils';

export function ValidationApp() {
  const loading : ReactNode = <><div>Loading</div></>
  const [icert, setICert] = useState<ReactNode>();
  const [publicKey, setPublicKey] = useState<CryptoKey>();

  if (publicKey === undefined) {
    window.crypto.subtle.importKey(
      "jwk", 
      {"crv":"Ed25519","ext":true,"key_ops":["verify"],"kty":"OKP","x":"DaOlsstG-fGHK1-kKkubUrzHpm6ZzjO3StgMZqXJP04"},
      {name: "Ed25519"},
      true,
      ["verify"]
    ).then( (k) => {
      setPublicKey(k);
    });  
  }

  const keyLength = 64;

  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');

  if (b64cert !== null ) {
    //cert = btoa(cert);
    const ab = base64ToArrayBuffer(b64cert);
    const certData = ab.slice(0,ab.byteLength-keyLength);
    const certSignature = ab.slice(ab.byteLength-keyLength, ab.byteLength);

    if (publicKey !== undefined) {
      window.crypto.subtle.verify({name: "Ed25519"}, publicKey, certSignature, certData).then( (valid) => {
        if (valid) {
          console.log( `Signature verification ${valid}`);
          if (icert === undefined) {
            certificateFromQuery(certData).then( (_icert) => {
              if (_icert !== null) {
                setICert(_icert);
              } else {
                setICert(
                  <div className="certificateError">
                  <p>ERROR: Invalid Certificate</p>
                  </div>
                );
              }
            });  
          }
        }
      });
    }
  }

  return (
    <>
      <div style={{visibility:"hidden"}}> 
        <p>B64: {b64cert}</p>
      </div>
      <div> 
        {icert}
      </div>
    </>
  )
}

export default {ValidationApp};
