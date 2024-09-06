import {ReactNode} from 'react';
import QRCode from "react-qr-code";
import FIRA2024 from './assets/fira2024.svg';
import {stringToBase64URL, stringFromBase64URL} from "./base64url";
import {stringToArrayBuffer, arrayBufferToBase64, arrayBufferToHex} from './arraybuffer_utils';
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

export async function createCertificate( cert : Certificate) {
    const urlRoot = "https://fvjosef21.github.io/fira-certificates-validation/";
    const bg = background_factory(cert.competition);
    const s = certificateToString(cert);
    const b = stringToBase64URL(s);
    const hash = await hashCertificate(b);

    console.log(`b=${b} h=${hash}`);

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
                            value={urlRoot + "?p=" + stringToBase64URL(s) + hash}
                        />
                    </div>
                </div>
            </div>
        </>
    );

    return templ;
}


export function certificateToString( cert: Certificate ) {
    const s = JSON.stringify(cert);
    return s;
}

export async function certificateFromQuery( b64cert: ArrayBuffer ) {
    let icert : ReactNode | null = null;

    try {
        const b64 = arrayBufferToBase64(b64cert);
        const s = stringFromBase64URL(b64);
        const cert = JSON.parse(s);
        icert = await createCertificate(cert);
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