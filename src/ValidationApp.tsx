import {useState} from 'react';
import {CertificateInfo, splitCertificateParam, certificateFromURL} from './Certificate';
import {base64ToArrayBuffer} from './arraybuffer_utils';

export function ValidationApp() {
  //const loading : ReactNode = <><div>Loading</div></>
  const [certificateInfo, setCertificateInfo] = useState<CertificateInfo>();
  const [publicKey, setPublicKey] = useState<CryptoKey>();

  const publicKeyRSA = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+8Q9jGnzsrjCea69fVFV9G3KHQAV982KhSMTbmrpGtDZ3Pvu53eyam1FQyRY82UOFXVOE+5+bWfXdEbQVF+eyegLhbNtHwaxOSzAqGcccXlBalikylkHJJOm5bGe0JeFWDo9mIdOnVK+KvgUO4Qxn7+tja8fd10XP8HeMUFvV4UMUcHJ04cjVXTtESV43tME7OKCgAUNTTHQVSDw1BqJLiGqQ1pYg76KdPOg/zHydfkUpf+0HJtW2Bd0BYaeaTvrKHOLCFbpo3K0+V/DYpB9x8pOs1Z4NzdN8KQcacLo1x+4nSKK/nIOKkqvoPvRU5TKeILZUAJ2oLFcJ3GXXKKHEwIDAQAB";

  if (publicKey === undefined) {
    // window.crypto.subtle.importKey(
    //   "jwk", 
    //   {"crv":"Ed25519","ext":true,"key_ops":["verify"],"kty":"OKP","x":"DaOlsstG-fGHK1-kKkubUrzHpm6ZzjO3StgMZqXJP04"},
    //   {name: "Ed25519"},
    //   true,
    //   ["verify"]
    // ).then( (k) => {
    //   setPublicKey(k);
    // });  
    window.crypto.subtle.importKey(
      "spki",
      base64ToArrayBuffer(publicKeyRSA), 
      {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"},
      true,
      ["verify"]
    ).then( (k) => {
      setPublicKey(k);
    });  
    
  }

  //const keyLength = 64; // in bytes, multiply *2 to get length of hex string
  const keyLength = 256;

  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');

  if (b64cert !== null ) {
    //cert = btoa(cert);
    const ab = base64ToArrayBuffer(b64cert);
    
    const [certData, certSignature] = splitCertificateParam(ab, keyLength);

    if (publicKey !== undefined) {
      //window.crypto.subtle.verify({name: "Ed25519"}, publicKey, certSignature, certData).then( (valid) => {
      window.crypto.subtle.verify({name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"}, publicKey, certSignature, certData).then( (valid) => {
        if (valid) {
          console.log( `Signature verification ${valid}`);
          if (certificateInfo === undefined) {
            certificateFromURL(window.location.href, keyLength).then( (_certInfo) => {
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
