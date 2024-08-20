import './certificate.css';

export interface Certificate {
    competition: string;
    league: string;
    event: string;
    age: string;
    team: string;
    affiliation: string;
    members:string[];
};

export function createCertificate( cert : Certificate) {
    let templ = (
        <>
            <div className="competition"> 
                Competition: {cert.competition}
           </div>
            <div className="league"> 
                Team: {cert.league} ({cert.age})
           </div>
            <div className="event"> 
                Team: {cert.event}
           </div>
            <div className="team"> 
                Team: {cert.team}
           </div>
            <div className="affiliation"> 
                Team: {cert.affiliation}
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
        </>
    );
    
    if (cert.competition === 'fira-2024') {
        
    }

    return templ;
}

