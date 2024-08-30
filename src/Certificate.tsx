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

export function createCertificate( cert : Certificate) : React.ReactNode {
    const urlRoot = "https://fvjosef21.github.io/fira-certificates-validation/";
    const bg = background_factory(cert.competition);
    const s = certificateToString(cert);
    const b = stringToBase64URL(s);

    console.log(`b=${b}`);

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
                                    (mem) => (
                                        <tr className="memberTableRow">
                                            <td className="memberTableCell"> 
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
                            size={256}
                            value={urlRoot + "?p=" + stringToBase64URL(s)}
                            viewBox={`0 0 256 256`}
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

${cert.league}

${cert.event}

${cert.age}

${cert.type}

${cert.team}

${cert.affiliation}

${cert.members.join("\n" )}`;

    return s;
}

export function certificateFromQuery( b64cert: string ) {
    const _cert = stringFromBase64URL(b64cert).replace(/\r\n/g, "\n").split('\n\n');
    let icert : ReactNode | null = null;

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

    return icert;
}