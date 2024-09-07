import {useState} from 'react';
import {CertificateInfo, splitCertificateParam, certificateFromURL} from './Certificate';
import {base64ToArrayBuffer} from './arraybuffer_utils';

export function ValidationApp() {
  //const loading : ReactNode = <><div>Loading</div></>
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo>();
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

  const keyLength = 64; // in bytes, multiply *2 to get length of hex string

  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');

  if (b64cert !== null ) {
    //cert = btoa(cert);
    const ab = base64ToArrayBuffer(b64cert);
    
    const [certData, certSignature] = splitCertificateParam(ab, keyLength);

    if (publicKey !== undefined) {
      window.crypto.subtle.verify({name: "Ed25519"}, publicKey, certSignature, certData).then( (valid) => {
        if (valid) {
          console.log( `Signature verification ${valid}`);
          if (certificateInfo === undefined) {
            certificateFromURL(window.location.href).then( (_certInfo) => {
              if (_certInfo !== null) {
                setCertificateInfo( _certInfo);
              } else {
                const dummy : CertificateInfo = {
                  'cert': {'competition': 'Invalid Certificate', 'type':'Invalid', 'league': 'Invalid', 'affiliation': 'Invalid', 'age': 'Invalid', 'event': 'Invalid', 'members':'Invalid', 'team': 'Invalid'},
                  'node':  
                    <div className="certificateError">
                    <p>ERROR: Invalid Certificate</p>
                    </div>  
                  ,
                  'url': window.location.href,
                };
                setCertificateInfo(dummy);
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
      {
        certificateInfo && 
        <div> 
          {certificateInfo['node']}
        </div>

      }
    </>
  )
}

export default {ValidationApp};
