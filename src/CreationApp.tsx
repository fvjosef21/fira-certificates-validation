import './CreationApp.css'
import {CSVUploader} from './CSVUploader';
import {useState, useRef} from 'react';
import {CertificateInfo, Certificate, createCertificate, createCertificateURL} from './Certificate';
import {arrayBufferToBase64, base64ToArrayBuffer} from './arraybuffer_utils';

export function CreationApp() {
  const [certificateInfos, setCertificateInfos] = useState<CertificateInfo[]>();
  const [samples, setSamples] = useState<CertificateInfo[]>();
  const [privateKey, setPrivateKey] = useState<CryptoKey>();
  const privateKeyInputRef  = useRef<HTMLInputElement>(null);

  let urlRoot : string;

  console.log(`window.location.host ${window.location.host}`);

  if (window.location.host.substring(0,"localhost".length) !== "localhost") {
    host = "https://fvjosef21.github.io/fira-certificates-validation/";
  } else {
    urlRoot = window.location.toString();
  }

  const testPrivateKey = "MC4CAQAwBQYDK2VwBCIEIKPF19ZmsAH5SlKKr9nwnmBSvrY2PBAPjGoi7POYkFe5";

  function jsonLoader(certs_in: object[]) {
    console.log(`Loaded json ${JSON.stringify(certs_in)}`);
    const certs = certs_in.map((o) => {
      const c = o as Certificate;
      //c['members'] = c['members'].split(';');
      return c;
    });

    if (privateKey !== undefined) {
      const _certificateInfos : CertificateInfo[] = Array<CertificateInfo>();

      for(const cert of certs) {
        createCertificateURL(cert, privateKey, urlRoot).then( (url) => {
          createCertificate(cert, url).then( (ci) => {
            _certificateInfos.push(ci);
            if (_certificateInfos.length === certs.length) {
              setCertificateInfos(_certificateInfos);
            }
          });
        });

      }  
    }
    // setCertificates(certs);

    // if ((certificates !== undefined) && (privateKey !== undefined) ) {
    //   createCertificatesURLs(certificates, privateKey).then( (urls) => {
    //     setCertURLs(urls);
    //   });
    // }
  }

  if (privateKey === undefined) {
    window.crypto.subtle.importKey("pkcs8", 
      base64ToArrayBuffer(testPrivateKey),
      { name: 'Ed25519' },
      false,
      [ "sign"]
    ).then((key) => {
      console.log(`Private Key: ${key}`);
      setPrivateKey(key);

      if (privateKeyInputRef.current !== null) {
        privateKeyInputRef.current.value = testPrivateKey;
      }
    });
  }

  if ((certificateInfos !== undefined) && (samples === undefined)){
    createCertificateSamples(certificateInfos).then((samples) => {
      setSamples(samples);
    });
  }

  function getRandomElements<T>(arr: T[], n: number): T[] {
    // Shuffle the array
    const shuffled = arr.sort(() => 0.5 - Math.random());
    // Return the first n elements
    return shuffled.slice(0, n);
  }

  async function createCertificateSamples(certificateInfos: CertificateInfo[]) {
    const selected = getRandomElements(certificateInfos, Math.min(certificateInfos.length, 3));
    const samples: CertificateInfo[] = Array<CertificateInfo>();
    for (const c of selected) {
      samples.push(c);
    }
    return samples;
  }

  window.crypto.subtle.generateKey(
    // {
    //   name: "RSASSA-PKCS1-v1_5",
    //   modulusLength:4096,
    //   publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
    //   hash: "SHA-256"
    // },
    {
      name: "Ed25519",
    },
    true,
    ["sign", "verify"],
  ).then((kpIn) => {
    const kp = kpIn as CryptoKeyPair;

    const privK = kp['privateKey'];
    const pubK = kp['publicKey'];
    
    window.crypto.subtle.exportKey("jwk", privK).then((ekey) => {
      console.log(`Private Key: ${JSON.stringify(ekey)}`);
    });
    
    window.crypto.subtle.exportKey("pkcs8", privK).then((ekey) => {
      console.log(`Private Key: ${arrayBufferToBase64(ekey)}`);
    });

    window.crypto.subtle.exportKey("jwk", pubK).then((ekey) => {
      console.log(`Public Key: ${JSON.stringify(ekey)}`);
    });

    window.crypto.subtle.exportKey("spki", pubK).then((ekey) => {
      console.log(`Public Key: ${arrayBufferToBase64(ekey)}`);
    });
  });  

  return (
    <>
      <h1>FIRA Certifcation Creation</h1>

      <div className="privateKeyInputDiv">
        <label htmlFor="privateKeyInput">FIRA Certificate Key (Private)</label>
        <input ref={privateKeyInputRef} id="privateKeyInput"></input>
      </div>

      <div className="uploader">
        <div>
          <p>The format of the CSV file should be as follows:</p>
          <code>
            <pre>
competition,league,event,age,type,team,affiliation,members
            </pre>
          </code>
          <p>Note team members should be seperated by ";"</p>
        </div>
        <CSVUploader loader={jsonLoader} />
      </div>

      {certificateInfos &&
        <div className="urlTable">
          <h2>Certificate URLs</h2>
          <table>
            <tbody>
              {
                certificateInfos.map((mem, i) => (
                  <tr className="urlTableRow" key={i}>
                    <td className="urlCell" key={i}>
                      <a href={mem['url']}>{mem['url']}</a>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      }
      {samples &&
        <div className="certificatesTable">
          <h2>Sample Certificates</h2>
          <table>
            <tbody>
              {
                samples.map((mem, i) => (
                  <tr className="certificatesTableRow" key={i}>
                    <td className="certificatesCell key={i}">
                      {mem['node']};
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      }
    </>
  )
}

export default { CreationApp };
