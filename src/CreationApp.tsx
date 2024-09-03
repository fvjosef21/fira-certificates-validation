import './CreationApp.css'
import {CSVUploader} from './CSVUploader';
import {useState} from 'react';
import {Certificate, CertificatesLoader} from './Certificate';

export function CreationApp() {
  const [certificates, setCertificates] = useState<Certificate[]>();

  const jsonLoader : CertificatesLoader = (certs) => {
    console.log(`Loaded json ${certs}`);
    setCertificates( certs.map( (o) => {
      
    }));
  };

  return (
    <>
      <h1>FIRA Certifcation Creation</h1>
      <div className="privateKeyInput">
        <p>FIRA Certificate Key (Private)</p> 
        <input type="password"></input>
      </div>
      <div className="uploader">
        <CSVUploader loader={jsonLoader}/>
      </div>
      <div className="certificates">
      </div>
    </>
  )
}

export default {CreationApp};

