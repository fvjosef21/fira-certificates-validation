import './CreationApp.css'
import { CSVUploader } from './CSVUploader';
import { useState, useRef, ReactNode } from 'react';
import { Certificate, createCertificate, createCertificateURL} from './Certificate';
import {arrayBufferToBase64, base64ToArrayBuffer} from './arraybuffer_utils';

export function CreationApp() {
  const [certificates, setCertificates] = useState<Certificate[]>();
  const [samples, setSamples] = useState<ReactNode[]>();
  const [privateKey, setPrivateKey] = useState<CryptoKey>();
  const privateKeyInputRef  = useRef<HTMLInputElement>(null);
  const [certURLs, setCertURLs] = useState<string[]>();

  const urlRoot = "https://fvjosef21.github.io/fira-certificates-validation";
  const testPrivateKey = "MC4CAQAwBQYDK2VwBCIEIKPF19ZmsAH5SlKKr9nwnmBSvrY2PBAPjGoi7POYkFe5";

  function jsonLoader(certs_in: object[]) {
    console.log(`Loaded json ${JSON.stringify(certs_in)}`);
    const certs = certs_in.map((o) => {
      const c = o as Certificate;
      //c['members'] = c['members'].split(';');
      return c;
    });

    setCertificates(certs);

    if ((certificates !== undefined) && (privateKey !== undefined) ) {
      createCertificatesURLs(certificates, privateKey).then( (urls) => {
        setCertURLs(urls);
      });
    }

    createCertificateSamples(certs).then((samples) => {
      setSamples(samples);
    });
  }

  async function createCertificatesURLs(certificates: Certificate[], privateKey: CryptoKey) {
    const certURLs : string[] = [];

    for(const c of certificates) {
      //const urlRoot = window.location.href.toString();
      console.log(`urlRoot ${urlRoot}`);

      const s = await createCertificateURL(c, privateKey, urlRoot);
      certURLs.push(s)
    }
    return certURLs;
  }

  function getRandomElements<T>(arr: T[], n: number): T[] {
    // Shuffle the array
    const shuffled = arr.sort(() => 0.5 - Math.random());
    // Return the first n elements
    return shuffled.slice(0, n);
  }

  async function createCertificateSamples(certificates: Certificate[]) {
    const selected = getRandomElements(certificates, Math.min(certificates.length, 3));
    const sampleCertificates: ReactNode[] = Array<ReactNode>();
    for (const c of selected) {
      const t = await createCertificate(c);
      sampleCertificates.push(t);
    }
    return sampleCertificates;
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
FIRA 2024,Autonomous Car,Race, Pro,1st Place,NTNU-ERC,National Taiwan Normal University,Wei-Jen Tsai;Jacky Baltes
            </pre>
          </code>
          <p>Note team members should be seperated by ";"</p>
        </div>
        <CSVUploader loader={jsonLoader} />
      </div>

      {certURLs &&
        <div className="urlTable">
          <h2>Certificate URLs</h2>
          <table>
            <tbody>
              {
                certURLs.map((mem, i) => (
                  <tr className="urlTableRow" key={i}>
                    <td className="urlCell" key={i}>
                      <a href={mem}>{mem}</a>
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
                      {mem};
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
