import {useState} from 'react';
import {CertificateInfo, splitCertificateParam, certificateFromURL} from '../Certificate';
import {hexToArrayBuffer, base64ToArrayBuffer, stringToArrayBuffer} from '../arraybuffer_utils';

export function ValidationApp() {
  //const loading : ReactNode = <><div>Loading</div></>
  const [certificateUnion, setCertificateUnion] = useState<{certificateInfo: CertificateInfo, publicKeyIndex:number}>();
  const [publicKeys, setPublicKeys] = useState<CryptoKey[]>();

  const publicKeyRSA : string[] = [
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+8Q9jGnzsrjCea69fVFV9G3KHQAV982KhSMTbmrpGtDZ3Pvu53eyam1FQyRY82UOFXVOE+5+bWfXdEbQVF+eyegLhbNtHwaxOSzAqGcccXlBalikylkHJJOm5bGe0JeFWDo9mIdOnVK+KvgUO4Qxn7+tja8fd10XP8HeMUFvV4UMUcHJ04cjVXTtESV43tME7OKCgAUNTTHQVSDw1BqJLiGqQ1pYg76KdPOg/zHydfkUpf+0HJtW2Bd0BYaeaTvrKHOLCFbpo3K0+V/DYpB9x8pOs1Z4NzdN8KQcacLo1x+4nSKK/nIOKkqvoPvRU5TKeILZUAJ2oLFcJ3GXXKKHEwIDAQAB",
  ];

  if (publicKeys === undefined) {
    // window.crypto.subtle.importKey(
    //   "jwk", 
    //   {"crv":"Ed25519","ext":true,"key_ops":["verify"],"kty":"OKP","x":"DaOlsstG-fGHK1-kKkubUrzHpm6ZzjO3StgMZqXJP04"},
    //   {name: "Ed25519"},
    //   true,
    //   ["verify"]
    // ).then( (k) => {
    //   setPublicKey(k);
    // });  
    const _publicKeys : CryptoKey[] = Array<CryptoKey>();

    for (const p of publicKeyRSA) {
      window.crypto.subtle.importKey(
        "spki",
        base64ToArrayBuffer(p), 
        {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"},
        true,
        ["verify"]
      ).then( (k) => {
        _publicKeys.push(k);
        if (_publicKeys.length === publicKeyRSA.length) {
          setPublicKeys(_publicKeys);
        }
      });  
    } 
  }

  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');

  if (b64cert !== null ) {
    //cert = btoa(cert);
    const ab = hexToArrayBuffer(b64cert);
    
    const [certVersion, certData, certSignature] = splitCertificateParam(ab);
    console.log(`${certVersion} ${certSignature}`); // Just to shut up the no unused variable error

    if (publicKeys !== undefined) {
      for(let publicKeyIndex = 0; publicKeyIndex < publicKeys.length; publicKeyIndex++) {
        const p = publicKeys[publicKeyIndex];
        //window.crypto.subtle.verify({name: "Ed25519"}, p, certSignature, certData).then( (valid) => {
        window.crypto.subtle.verify({name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"}, p, certSignature, stringToArrayBuffer(certData)).then( (valid) => {
          if (valid) {
            console.log( `Signature verification ${valid}`);
            if (certificateUnion === undefined) {
              certificateFromURL(window.location.href).then( (_certInfo) => {
                if (_certInfo !== null) {
                  setCertificateUnion({certificateInfo:_certInfo,publicKeyIndex:publicKeyIndex});
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
                  setCertificateUnion({certificateInfo:dummy,publicKeyIndex:-1});
                }
              });  
            }
          }
        });
      }
    }
  }

  return (
    <>
      <div style={{visibility:"hidden"}}> 
        <p>B64: {b64cert}</p>
      </div>
      {
        certificateUnion && 
        <div className={certificateUnion.publicKeyIndex !== 0 ? 'validcertificate':'testcertificate'}> 
          {certificateUnion.certificateInfo.node}
          <div className="testcertificateoverlay">
            Test Certificate Only
          </div>
        </div>

      }
    </>
  )
}

export default {ValidationApp};
