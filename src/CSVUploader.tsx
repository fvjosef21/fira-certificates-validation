import {useState } from 'react';
import {csv2json} from 'json-2-csv';
import {CertificatesLoader} from './Certificate';

export interface CSVUploaderProps {
    loader: CertificatesLoader;
}

export function CSVUploader( {loader}: CSVUploaderProps) {
  const [file, setFile] = useState(null);
  const handleFileChange = (e:Event) => {
    setFile(e.target.files[0]);
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvOutput : string | null = event.target!.result as string;
        if (csvOutput !== null) {
            const json = csv2json(csvOutput)
            console.log(`handleFileUpload: ${json}`); // You can process the CSV data here    
            if (loader !== undefined) {
                loader(json);
            }
        }
        
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="csvUploader">
      <h1>Upload CSV File</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload</button>
    </div>
  );
}

export default { CSVUploader };
