import {ReactNode} from 'react';
import QRCode from "react-qr-code";
import FIRA2024 from './assets/fira2024.svg';
import {stringToBase64URL, stringFromBase64URL} from "./base64url";
import {stringToArrayBuffer, base64ToArrayBuffer, arrayBufferToBase64, arrayBufferToString, hexToArrayBuffer, arrayBufferToHex} from './arraybuffer_utils';
import './certificate.css';

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
        bg = FIRA2024;
    }

    return bg;
}

export async function createCertificateURLData( cert: Certificate, privateKey: CryptoKey ) {
    const s = certificateToString(cert);
    
    const signed = await window.crypto.subtle.sign( {name: "Ed25519"}, privateKey, stringToArrayBuffer(s));
    const signedHex = arrayBufferToHex(signed);

    const data = stringToArrayBuffer(s + signedHex);
    return data;
}

export async function createCertificateURL( cert: Certificate, privateKey: CryptoKey, urlRoot : string) {
    const d = await createCertificateURLData(cert, privateKey);

    return `${urlRoot}?p=${arrayBufferToBase64(d)}`;
}

export async function createCertificate( cert : Certificate, certURL: string) : Promise<CertificateInfo> {
    const bg = background_factory(cert.competition);

    const templ = (
        <>
            <div className="certificate">
                <div className="background">
                    {bg !== null && <img src={bg} className="svg" alt="FIRA 2024 Certificate Background" />}
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
                            size={280}
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


export async function certificateFromQuery(abCert: ArrayBuffer) {
    let icert : ReactNode | null = null;

    try {
        const b64 = arrayBufferToBase64(abCert);
        const s = stringFromBase64URL(b64);
        const cert = JSON.parse(s);
        icert = await createCertificate(cert, certURL);
    } catch {
        icert = null;
    }
    
    return icert;
}

async function hashCertificate( s: string ) {
    const encoder = new TextEncoder();
    const data = encoder.encode(s);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
    const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join(""); // convert bytes to hex string
    return hashHex;
}

export function splitCertificateParam( ab: ArrayBuffer, keyLength = 64) {
    const certData = ab.slice(0,ab.byteLength-keyLength*2);
    const certSignature = hexToArrayBuffer(arrayBufferToString(ab.slice(ab.byteLength-keyLength*2, ab.byteLength)));

    return [certData, certSignature];
}

export async function certificateFromURL(url:string, keyLength = 64) : Promise<CertificateInfo|null> {
    const searchParams = new URLSearchParams(url.split('?')[1]);
    const b64cert:string|null = searchParams.get('p');

    let certInfo : CertificateInfo | null = null;

    if (b64cert !== null ) {
        //cert = btoa(cert);
        const ab = base64ToArrayBuffer(b64cert);
      
        const [certData, _] = splitCertificateParam(ab, keyLength);
  

        try {
            const certJSON = JSON.parse(arrayBufferToString(certData));
            certInfo = await createCertificate(certJSON, url);
            
        } catch {
            certInfo = null;
        }
    }
    return certInfo;
}