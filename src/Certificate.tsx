import {ReactNode} from 'react';
import QRCode from "react-qr-code";
//import FIRA2024 from './assets/fira2024.svg';
import {arrayBufferToBase64, arrayBufferToHex, arrayBufferToString, hexToArrayBuffer, stringToArrayBuffer} from './arraybuffer_utils';
import './Certificate.css';
import FIRA2024Award  from './templates/FIRA2024Award';

export const certVersionLength = 3;

export interface Certificate {
    competition: string;
    league: string;
    event: string;
    age: string;
    type: string;
    team: string;
    affiliation: string;
    members:string;
};

export type CertificateInfo = {
    cert: Certificate;
    node: ReactNode;
    url: string;
};  

export type CertificatesLoader = (a: object[]) => void;

function background_factory( event: string) {
    let bg = null;

    if (event === "FIRA 2024") {
        bg = FIRA2024Award();
    }

    return bg;
}

export async function createCertificateURLData( cert: Certificate, privateKey: CryptoKey) : Promise<ArrayBuffer> {
    const s = certificateToString(cert);
    const sAB = new Uint8Array(stringToArrayBuffer(s));

    const signed = await window.crypto.subtle.sign( 
        //{name: "Ed25519"}, 
        {name: "RSASSA-PKCS1-v1_5", hash: "SHA-256"},
        privateKey, 
        sAB
    );

    const signedUint8 = new Uint8Array(signed);

    const certVersion = 1 % Math.pow(256,3);

    const data = new Uint8Array(certVersionLength + sAB.byteLength + signed.byteLength);
    data[0] = (certVersion >> 16) & 0xff;
    data[1] = (certVersion >> 8) & 0xff;
    data[2] = certVersion & 0xff;

    data.set(sAB,3);
    data.set(signedUint8,certVersionLength + sAB.length);

    return data.buffer;
}

export async function createCertificateURL(cert: Certificate, privateKey: CryptoKey, urlRoot : string) {
    const d = await createCertificateURLData(cert, privateKey);

    return `${urlRoot}?p=${arrayBufferToHex(d)}`;
}

export async function createCertificate( cert : Certificate, certURL: string) : Promise<CertificateInfo> {
    const bg = background_factory(cert.competition);

    const templ = (
        <>
            <div className="certificate">
                <div className="background">
                    {bg !== null && bg}
                </div>
                <div className="competition"> 
                    {cert.competition}
                </div>
                <div className="league"> 
                    {cert.league} ({cert.age})<br/>
                    {cert.event}
                </div>
                <div className="type"> 
                        {cert.type}
                </div>
                <div className="team"> 
                    {cert.team}<br/>
                    {cert.affiliation}
                </div>
                <div className="memberTableDiv">
                    <table> 
                        <tbody> 
                            {cert.members.split(';').map(
                                    (mem,i) => (
                                        <tr className="memberTableRow" key={i}>
                                            <td className="memberTableCell key={i}"> 
                                                {mem}
                                            </td>
                                        </tr> 
                                    ) 
                                )
                            }
                        </tbody>
                    </table>
                </div>
                <div className="qrcode">
                    <div >
                        <QRCode
                            size={160}
                            value={certURL}
                        />
                    </div>
                </div>
            </div>
        </>
    );

    return { 'cert': cert, 'node': templ, 'url': certURL};
}


export function certificateToString( cert: Certificate ) {
    const s = JSON.stringify(cert);
    return s;
}


export async function certificateFromQuery(abCert: ArrayBuffer, certURL: string) {
    let icert : CertificateInfo | null = null;

    try {
        const b64 = arrayBufferToBase64(abCert);
        const cert = JSON.parse(b64);
        icert = await createCertificate(cert, certURL);
    } catch {
        icert = null;
    }
    
    return icert;
}

// async function hashCertificate( s: string ) {
//     const encoder = new TextEncoder();
//     const data = encoder.encode(s);
//     const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
//     const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
//     const hashHex = hashArray
//         .map((b) => b.toString(16).padStart(2, "0"))
//         .join(""); // convert bytes to hex string
//     return hashHex;
// }

export function splitCertificateParam(ab: ArrayBuffer):[number,string,ArrayBuffer] {
    const v = ab as Uint8Array;
    const certVersion = v[0]*65536+v[1]*256+v[2];
    let keyLength = 0;
    if ((certVersion === 0) || (certVersion === 1)) {
        keyLength = 256;
    } else if (certVersion === 2) {
        keyLength = 64;
    }
    const certData = arrayBufferToString(ab.slice(certVersionLength,ab.byteLength-keyLength));
    const certSignature = ab.slice(ab.byteLength-keyLength, ab.byteLength);

    return [certVersion, certData, certSignature];
}

export async function certificateFromURL(url:string) : Promise<CertificateInfo|null> {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    const b64cert:string|null = searchParams.get('p');

    let certInfo : CertificateInfo | null = null;

    if (b64cert !== null ) {
        //cert = btoa(cert);
        const ab = hexToArrayBuffer(b64cert);
      
        const [certVersion, certData, certSignature] = splitCertificateParam(ab);

        console.log(`${certVersion} ${certSignature}`); // Just to shut up the no unused variable error
  
        try {
            const s = arrayBufferToString(stringToArrayBuffer(certData));
            const certJSON = JSON.parse(s);
            certInfo = await createCertificate(certJSON, url);          
        } catch {
            certInfo = null;
        }
    }
    return certInfo;
}