const fs = require('fs');
const groups = JSON.parse(fs.readFileSync('groups.json', 'utf8'));

// data 
//   A: [
//     { Team: 'Kanada', ISOCode: 'CAN', FIBARanking: 7 },
//     { Team: 'Australija', ISOCode: 'AUS', FIBARanking: 5 },
//     { Team: 'Grčka', ISOCode: 'GRE', FIBARanking: 14 },
//     { Team: 'Španija', ISOCode: 'ESP', FIBARanking: 2 }
//   ],
//   B: [
//     { Team: 'Nemačka', ISOCode: 'GER', FIBARanking: 3 },
//     { Team: 'Francuska', ISOCode: 'FRA', FIBARanking: 9 },
//     { Team: 'Brazil', ISOCode: 'BRA', FIBARanking: 12 },
//     { Team: 'Japan', ISOCode: 'JPN', FIBARanking: 26 }
//   ],
//   C: [
//     { Team: 'Sjedinjene Države', ISOCode: 'USA', FIBARanking: 1 },
//     { Team: 'Srbija', ISOCode: 'SRB', FIBARanking: 4 },
//     { Team: 'Južni Sudan', ISOCode: 'SSD', FIBARanking: 34 },
//     { Team: 'Puerto Riko', ISOCode: 'PRI', FIBARanking: 16 }
//   ]


function simulateMatch(teamA, teamB) {

    // (3 + 7 = 10 )
    const totalRanking = teamA.FIBARanking + teamB.FIBARanking;
    // (7 / 10 = 0.7 % sanse za pobedu)
    const chanceA = (teamB.FIBARanking / totalRanking);
    // random brojevi do 99 Poena.
    let scoreA = Math.floor(Math.random() * 30) + 70;
    let scoreB = Math.floor(Math.random() * 30) + 70;



    let winnerA = scoreA > scoreB ? teamA : teamB;
    let winnerB = scoreB < scoreA ? teamB : teamA;

    if (scoreA === scoreB) {
        return { draw: true, teamA, teamB, score: `${scoreA}:${scoreB}` };
    }

    // 0.3 < 0.7 = Winner je Team A
    if (Math.random() < chanceA) {
        return { winner: winnerA, loser: winnerB, score: `${scoreA}:${scoreB}` };
    } else {
        return { winner: winnerB, loser: winnerA, score: `${scoreB}:${scoreA}` };
    }
}

// console.log(simulateMatch({ Team: 'Nemačka', ISOCode: 'GER', FIBARanking: 3 },
//     { Team: 'Francuska', ISOCode: 'FRA', FIBARanking: 9 },))


function groupStage(groups) {
    const standings = {};
    // a,b,c 
    for (const group in groups) {
        standings[group] = groups[group].map(team => ({
            ...team,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            scored: 0,
            conceded: 0,
            differences: 0,
        }));

        for (let i = 0; i < groups[group].length; i++) {
            for (let j = i + 1; j < groups[group].length; j++) {
                const result = simulateMatch(groups[group][i], groups[group][j]);
                if (result.draw) {
                    const teamA = standings[group].find(team => team.ISOCode === result.teamA.ISOCode);
                    const teamB = standings[group].find(team => team.ISOCode === result.teamB.ISOCode);

                    teamA.draws += 1;
                    teamA.points += 1;
                    teamA.scored += parseInt(result.score.split(':')[1]);
                    teamA.conceded += parseInt(result.score.split(':')[0]);

                    teamB.draws += 1;
                    teamB.points += 1;
                    teamB.scored += parseInt(result.score.split(':')[1]);
                    teamB.conceded += parseInt(result.score.split(':')[0]);


                    teamA.differences = teamA.scored - teamA.conceded;
                    teamB.differences = teamB.scored - teamB.conceded;

                } else {

                    const winner = standings[group].find(team => team.ISOCode === result.winner.ISOCode);
                    const loser = standings[group].find(team => team.ISOCode === result.loser.ISOCode);
                    winner.wins += 1;
                    winner.points += 2;
                    winner.scored += parseInt(result.score.split(':')[0]);
                    winner.conceded += parseInt(result.score.split(':')[1]);


                    loser.losses += 1;
                    loser.scored += parseInt(result.score.split(':')[1]);
                    loser.conceded += parseInt(result.score.split(':')[0]);

                    winner.differences = winner.scored - winner.conceded;
                    loser.differences = loser.scored - loser.conceded;
                }


            }
        }
    }
    return standings;
}

function main() {
    const groupStandings = groupStage(groups);

}

main();
