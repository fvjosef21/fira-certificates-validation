import { ReactNode } from 'react';
import './App.css'
import {certificateFromQuery} from './Certificate';


function App() {
  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');
  let icert : ReactNode = <div className="certificateError">
    <p>ERROR: Invalid Certificate</p>
  </div>;
  let cert : String | null = null;

  if (b64cert !== null ) {
    //cert = btoa(cert);
    const _icert = certificateFromQuery(b64cert);
    if (_icert !== null) {
      icert = _icert;
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

export default App
