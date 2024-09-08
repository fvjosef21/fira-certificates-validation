import './CreationApp.css'
import {CSVUploader, downloadCSV} from './CSVUploader';
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
    urlRoot = "https://fvjosef21.github.io/fira-certificates-validation/";
  } else {
    urlRoot = window.location.toString();
  }

  //const testPrivateKey = "MC4CAQAwBQYDK2VwBCIEIKPF19ZmsAH5SlKKr9nwnmBSvrY2PBAPjGoi7POYkFe5"; // Ed25519
  const testPrivateKey = "MIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQD7xD2MafOyuMJ5rr19UVX0bcodABX3zYqFIxNuauka0Nnc++7nd7JqbUVDJFjzZQ4VdU4T7n5tZ9d0RtBUX57J6AuFs20fBrE5LMCoZxxxeUFqWKTKWQckk6blsZ7Ql4VYOj2Yh06dUr4q+BQ7hDGfv62Nrx93XRc/wd4xQW9XhQxRwcnThyNVdO0RJXje0wTs4oKABQ1NMdBVIPDUGokuIapDWliDvop086D/MfJ1+RSl/7Qcm1bYF3QFhp5pO+soc4sIVumjcrT5X8NikH3Hyk6zVng3N03wpBxpwujXH7idIor+cg4qSq+g+9FTlMp4gtlQAnagsVwncZdcoocTAgMBAAECggEAb76KEuhz4b9fkeKc+CJBpFuWeYiwN2xjLvSCi1+oVt6b1Bl9z/6wkcwuEb7wPBd+SMfn/7C7LJQKbPGBRfGq6LK1aoJYzIyL3HSgjh414aeQAUOW4LjjErj2Ory7YJnf9WjkLe7gVbOD9E5nrILgA6dvwJMZxEDtML87f2ErqgviLqJ2YBqjdLOWRQ8e9CTkZ9P5qI5lD2YEjzXVqmZsjRLLbVjzxSdWJCjprL/QU24Zxf6jLsRisD6sstTD+Ycks+bs59AKvvK+awI+8ZOldxUpeI4oBR4/nY7MG01jT6csHZIoL0Ser+CHkR1CypRfSypaR1qMhiBrIXZ7imJnAQKBgQD+sWnGhd8/uFP6OkVqg2T355vdpL954r4vM7ZP7pxtlP/s4AKLXsMBmsOskBIcL7pAjQMuGCZ6Y/gB09CZnBYoEkG83bq1NV2bxBo+6eILgC5kelo9ggaHzeiK9PkIyR37pn7wiRbz9b1K+VAW/cTWR5vWarPOIXijzXWfz4jY1wKBgQD9DvuYQxX5ch5RP+AFUPnN0u57NMI3n90Qd+z6u9iXD7P4h1pTf22iqTE9v5YlhjBZaZlPQ3l+xYBaYiNfFAUb19o2PTl4u9V5Q1jcums3UzP9QKm1C+B34USi1AlA9fnjyU/ovQ7woCQjuacL8DjqDnV3nZcksGSAkpPKe6hQJQKBgQC442OM6Ovant3ffWOc4ctvJyP/7zPMsGwtadXECsxlxE9QzoEqWV0okgfQAjoTWhZT+8m+MWvlVyLXeMMqb6Op7S7pgvCh0R6mD+KZn0En5iJHcIaHthc1iKVyEkmiNhVc9E2cIXiXGuISRg/80LWOdCdNrOHgFm40QtdLbuXBuwKBgQDocGuutugnQKgST06Q84kQgk/lQVenyiI+7zjwMbzHPHg9ru3Lxj9I6om9Qw5CF1ivuCxGvx6I0BaObpg4y+XJZmIb8e6pNDbn9HFaBa1Xmwgk9dEr5+Xdlz/5JDP/xDAtB4trpsRjR2UKn4uNjrBoZLGHFmxvGcqmwnwXv6+hNQKBgQDWCPsSzIgS4M3WXrd+Qc+Zesn5rsLiVqaGFpy6uazmPeiuF6bS27OYevhbctIVKTbzUejMA1PEM01DkGcNY+Pe4/a+MYHo0/hriczehOPnuUFQuFIn/AN2Tt13Apv3Og/9dCae/lMFAkUyTElGkQwll0Q7hDeQ3+UdJOCX/pPP9A==";

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

              const data = _certificateInfos.map( (mem) => {
                const rec = { 
                  competition: mem.cert.competition,
                  league: mem.cert.league,
                  event: mem.cert.event,
                  age: mem.cert.age,
                  type: mem.cert.type,
                  team: mem.cert.team,
                  affiliation: mem.cert.affiliation,
                  members: mem.cert.members,
                  url: mem.url 
                };
                return rec;
              });

              downloadCSV("new_certificates.csv", data);
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
      //{ name: 'Ed25519' }, //Ed25519
      { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256'}, // RSASSA-PKCS1-v1_5
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
    {
      name: "RSASSA-PKCS1-v1_5",
      modulusLength:2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: "SHA-256"
    },
    // {
    //   name: "Ed25519",
    // },
    true,
    ["sign", "verify"],
  ).then((kpIn) => {
    const kp = kpIn as CryptoKeyPair;

    const privK = kp['privateKey'];
    const pubK = kp['publicKey'];
    
    window.crypto.subtle.exportKey("jwk", privK).then((ekey) => {
      console.log(`Private Key (jwk) ekey ${ekey}`);
      console.log(`Private Key: ${JSON.stringify(ekey)}`);
    });
    
    window.crypto.subtle.exportKey("pkcs8", privK).then((ekey) => {
      console.log(`Private Key (pkcs8) ekey ${ekey}`);
      console.log(`Private Key: ${arrayBufferToBase64(ekey)}`);
    });

    window.crypto.subtle.exportKey("jwk", pubK).then((ekey) => {
      console.log(`Public Key (jwk) ekey ${ekey}`);
      console.log(`Public Key: ${JSON.stringify(ekey)}`);
    });

    window.crypto.subtle.exportKey("spki", pubK).then((ekey) => {
      console.log(`Public Key (spki) ${ekey}`);
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
