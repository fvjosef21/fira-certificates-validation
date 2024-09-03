import './App.css';
import {CreationApp} from './CreationApp';
import {ValidationApp} from './ValidationApp';

export function App() {
  const searchParams = new URLSearchParams(document.location.search);
  const b64cert:string|null = searchParams.get('p');

  if (b64cert === null ) {
    return ( <CreationApp /> );
  } else {
    return ( <ValidationApp /> );
  }
}

export default {App};
