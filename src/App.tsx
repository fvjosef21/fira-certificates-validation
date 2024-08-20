import { useState, ReactNode } from 'react';
import reactLogo from '/assets/react.svg';
import viteLogo from '/assets/vite.svg';
import './App.css'
import { stringFromBase64URL } from "./base64url";
import {Certificate, createCertificate} from './Certificate';


function App() {
  const [count, setCount] = useState(0)
  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');
  let cert : Certificate|null = null;
  let icert : ReactNode = (<p>ERROR: Invalid Certificate</p>);

  if (b64cert !== null ) {
    //cert = btoa(cert);
    const _cert = stringFromBase64URL(b64cert).replace(/\r\n/g, "\n").split('\n\n');


    const members = _cert[6].split("\n");

    cert = {
        competition: _cert[0],
        league: _cert[1],
        event: _cert[2],
        age: _cert[3],
        team: _cert[4],
        affiliation: _cert[5],
        members: members,
    };

    icert = createCertificate(cert);
  }

  return (
    <>
      <div style={{visibility:"hidden"}}> 
        <p>B64: {b64cert}</p>
        {cert !== null && 
            <p>Certificate: {cert.team}</p>
        }
      </div>
      <div> 
        {icert}
      </div>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
