import { ReactNode, useState } from 'react';
import {certificateFromQuery} from './Certificate';

export function ValidationApp() {
  const loading : ReactNode = <><div>Loading</div></>
  const [icert, setICert] = useState<ReactNode>(loading);
  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');

  if (b64cert !== null ) {
    //cert = btoa(cert);
    certificateFromQuery(b64cert).then((_icert) => {
      if (_icert !== null) {
        setICert(_icert);
      } else {
        setICert( <div className="certificateError">
          <p>ERROR: Invalid Certificate</p>
        </div>);
      }
    });
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

export default {ValidationApp};
