import './certificate.css';
import React from 'react';
import FIRA2024 from './assets/fira2024.svg';

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
            </div>
        </>
    );

    return templ;
}

