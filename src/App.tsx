import './App.css';
import {CreationApp} from './components/CreationApp';
import {ValidationApp} from './components/ValidationApp';

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
