import {ReactNode} from 'react';
import QRCode from "react-qr-code";
import FIRA2024 from './assets/fira2024.svg';
import {stringToBase64URL, stringFromBase64URL} from "./base64url";
import './certificate.css';

export interface Certificate {
    competition: string;
    league: string;
    event: string;
    age: string;
    type: string;
    team: string;
    affiliation: string;
    members:string[];
};

function background_factory( event: string) {
    let bg = null;

    if (event === "FIRA 2024") {
        bg = FIRA2024;
    }

    return bg;
}

export async function createCertificate( cert : Certificate) : React.ReactNode {
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
                            {cert.members.map(
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
    const s = `${cert.competition}

${cert.league}

${cert.event}

${cert.age}

${cert.type}

${cert.team}

${cert.affiliation}

${cert.members.join("\n" )}`;

    return s;
}

export async function certificateFromQuery( b64certAndHash: string ) {
    const HASH_LENGTH= 32*2; // 32 hex chars
    const b64cert = b64certAndHash.substring(0,b64certAndHash.length-HASH_LENGTH);
    const hashCert = b64certAndHash.substring(b64certAndHash.length-HASH_LENGTH, b64certAndHash.length);
    const h = await hashCertificate(b64cert);
    let icert : ReactNode | null = null;

    if (hashCert === h) {
        const _cert = stringFromBase64URL(b64cert).replace(/\r\n/g, "\n").split('\n\n');

        if (_cert.length === 8) {
            const members = _cert[7].split("\n");

            const cert = {
            competition: _cert[0],
            league: _cert[1],
            event: _cert[2],
            age: _cert[3],
            type: _cert[4],
            team: _cert[5],
            affiliation: _cert[6],
            members: members,
            };

            icert = createCertificate(cert);
        }
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