import './CreationApp.css'
import {CSVUploader} from './CSVUploader';
import {useState, ReactNode} from 'react';
import {Certificate, CertificatesLoader, createCertificate} from './Certificate';

export function CreationApp() {
  const [certificates, setCertificates] = useState<Certificate[]>();
  const [samples, setSamples] = useState<ReactNode[]>();
  
  function jsonLoader(certs_in: Object[]) {
    console.log(`Loaded json ${JSON.stringify(certs_in)}`);
    const certs = certs_in.map( (o) => {
      const c = o as Certificate;
      c['members'] = c['members'].split(';');
      return c;
    });
    setCertificates(certs);

    createCertificateSamples(certs).then((samples) => {
      setSamples(samples);
    });
  }

  function getRandomElements<T>(arr: T[], n: number): T[] {
    // Shuffle the array
    const shuffled = arr.sort(() => 0.5 - Math.random());
    // Return the first n elements
    return shuffled.slice(0, n);
  }

  async function createCertificateSamples( certificates : Certificate[] ) {
    const selected = getRandomElements(certificates,Math.min(certificates.length,3));
    const sampleCertificates : ReactNode[] = Array<ReactNode>();
    for (let c of selected) {
      const t = await createCertificate(c);
      sampleCertificates.push(t);
    }
    return sampleCertificates;
  }

  return (
    <>
      <h1>FIRA Certifcation Creation</h1>
      <div className="privateKeyInputDiv">
        <label htmlFor="privateKeyInput">FIRA Certificate Key (Private)</label> 
        <input id="privateKeyInput" type="password"></input>
      </div>
      <div className="uploader">
        <CSVUploader loader={jsonLoader}/>
      </div>
      { samples && 
        <div className="certificatesTable">
          <h2>Certificates</h2>
          <table> 
            <tbody> 
              {
                samples.map( (mem,i) => (
                        <tr className="certificatesTableRow" key={i}>
                            <td className="certificatesCell key={i}"> 
                                {mem};
                            </td>
                        </tr> 
                    ) 
                )
              }
            </tbody>
          </table>
        </div>
      }
    </>
  )
}

export default {CreationApp};
