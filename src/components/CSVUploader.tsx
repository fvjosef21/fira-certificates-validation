import { useState } from 'react';
import { csv2json } from 'json-2-csv';
import { CertificatesLoader } from './Certificate';
import { ChangeEventHandler, ChangeEvent } from 'react';
export interface CSVUploaderProps {
    loader: CertificatesLoader;
}

export function CSVUploader({ loader }: CSVUploaderProps) {
    const [file, setFile] = useState<File>();
    const handleFileChange: ChangeEventHandler<HTMLInputElement>
        = (e: ChangeEvent<HTMLInputElement>) => {
            const inpElement = e.target as HTMLInputElement;

            if ((inpElement !== null) && (inpElement!.files) && (inpElement!.files![0] !== null)) {
                setFile(inpElement!.files![0]!);
            }
        };

    const handleFileUpload = () => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const csvOutput: string | null = event.target!.result as string;
                if (csvOutput !== null) {
                    const json = csv2json(csvOutput.replace('\r\n', '\n'), { 'delimiter': { 'eol': '\n' }, 'trimFieldValues': true });
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

            <label htmlFor="fileSelectorId">Select File</label>
            <input id="fileSelectorId" type="file" accept=".csv" onChange={handleFileChange} />
            <button onClick={handleFileUpload}>Upload</button>
        </div>
    );
}

export default { CSVUploader };
