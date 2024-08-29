const fs = require("fs");
const groups = JSON.parse(fs.readFileSync("groups.json", "utf8"));

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
    const chanceA = teamB.FIBARanking / totalRanking;

    let scoreA = Math.floor(Math.random() * 30) + 70;
    let scoreB = Math.floor(Math.random() * 30) + 70;

    let winningScore, losingScore;
    // 0.3 < 0.7 = Winner je Team A
    if (scoreA === scoreB) {
        return { draw: true, teamA, teamB, score: `${scoreA}:${scoreB}` };
    } else if (Math.random() < chanceA) {
        winningScore = Math.max(scoreA, scoreB);
        losingScore = Math.min(scoreA, scoreB);
        return {
            winner: teamA,
            loser: teamB,
            score: `${winningScore}:${losingScore}`,
        };
    } else {
        winningScore = Math.max(scoreA, scoreB);
        losingScore = Math.min(scoreA, scoreB);
        return {
            winner: teamB,
            loser: teamA,
            score: `${winningScore}:${losingScore}`,
        };
    }
}

function simulateMatchPlayOff(teamA, teamB) {
    const totalRanking = teamA.FIBARanking + teamB.FIBARanking;
    const chanceA = teamB.FIBARanking / totalRanking;

    let scoreA = Math.floor(Math.random() * 30) + 70;
    let scoreB = Math.floor(Math.random() * 30) + 70;

    while (scoreA === scoreB) {
        scoreA = Math.floor(Math.random() * 30) + 70;
        scoreB = Math.floor(Math.random() * 30) + 70;
    }

    const winningScore = Math.max(scoreA, scoreB);
    const losingScore = Math.min(scoreA, scoreB);

    if (Math.random() < chanceA) {
        return {
            winner: teamA,
            loser: teamB,
            score: `${winningScore}:${losingScore}`,
        };
    } else {
        return {
            winner: teamB,
            loser: teamA,
            score: `${winningScore}:${losingScore}`,
        };
    }
}



function groupStage(groups) {
    const standings = {};
    // a,b,c
    for (const group in groups) {
        standings[group] = groups[group].map((team) => ({
            ...team,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            scored: 0,
            conceded: 0,
            differences: 0,
            group,
        }));

        console.log(`\nGrupna Faza: - 1 - 2 - 3 kolo`);

        console.log(`\nGrupa: ${group}:`)
        for (let i = 0; i < groups[group].length; i++) {
            for (let j = i + 1; j < groups[group].length; j++) {
                const result = simulateMatch(groups[group][i], groups[group][j]);

                if (result.draw) {
                    console.log(`${result.teamA.Team} - ${result.teamB.Team} (${result.score})`)
                } else {
                    console.log(`${result.winner.Team} - ${result.loser.Team} (${result.score})`)
                }

                if (result?.draw) {
                    const teamA = standings[group].find(
                        (team) => team.ISOCode === result.teamA.ISOCode
                    );
                    const teamB = standings[group].find(
                        (team) => team.ISOCode === result.teamB.ISOCode
                    );

                    teamA.draws += 1;
                    teamA.points += 1;
                    teamA.scored += parseInt(result.score.split(":")[1]);
                    teamA.conceded += parseInt(result.score.split(":")[0]);

                    teamB.draws += 1;
                    teamB.points += 1;
                    teamB.scored += parseInt(result.score.split(":")[1]);
                    teamB.conceded += parseInt(result.score.split(":")[0]);

                    teamA.differences = teamA.scored - teamA.conceded;
                    teamB.differences = teamB.scored - teamB.conceded;
                } else {
                    const winner = standings[group].find(
                        (team) => team.ISOCode === result.winner.ISOCode
                    );
                    const loser = standings[group].find(
                        (team) => team.ISOCode === result.loser.ISOCode
                    );
                    winner.wins += 1;
                    winner.points += 2;
                    winner.scored += parseInt(result.score.split(":")[0]);
                    winner.conceded += parseInt(result.score.split(":")[1]);

                    loser.losses += 1;
                    loser.scored += parseInt(result.score.split(":")[1]);
                    loser.conceded += parseInt(result.score.split(":")[0]);

                    winner.differences = winner.scored - winner.conceded;
                    loser.differences = loser.scored - loser.conceded;
                }
            }
        }
    }

    return standings;
}

// sortiranje prvo po poenima zatim po razlici u kosevima.
function sortTeams(teams) {
    return teams.sort((a, b) => {
        if (b.points !== a.points) {
            return b.points - a.points;
        } else if (b.differences !== a.differences) {
            return b.differences - a.differences;
        } else {
            return b.scored - a.scored;
        }
    });
}

// uzimanje timova koji su prvi drugi i treci u svoje grupe.
function rankTeams(standings) {
    const rankedTeams = {
        firstPlace: [],
        secondPlace: [],
        thirdPlace: [],
    };

    for (const group in standings) {
        const sortedGroup = sortTeams(standings[group]);
        rankedTeams.firstPlace.push(sortedGroup[0]);
        rankedTeams.secondPlace.push(sortedGroup[1]);
        rankedTeams.thirdPlace.push(sortedGroup[2]);
    }

    return rankedTeams;
}

// sortiranje unutar 1,2,3 grupa i dodavanje sve u jednu + dodavanje ranka.
function finalRanking(rankedTeams) {
    const allRankings = [];

    const firstRanked = sortTeams(rankedTeams.firstPlace);
    const secondRanked = sortTeams(rankedTeams.secondPlace);
    const thirdRanked = sortTeams(rankedTeams.thirdPlace);

    allRankings.push(...firstRanked, ...secondRanked, ...thirdRanked);

    allRankings.forEach((team, index) => {
        team.rank = index + 1;
    });

    return allRankings;
}

// Eliminaciona faza
function eliminationPhase(finalRankings, groupStandings) {
    const pots = {
        D: finalRankings.slice(0, 2),
        E: finalRankings.slice(2, 4),
        F: finalRankings.slice(4, 6),
        G: finalRankings.slice(6, 8),
    };

    const findOpponent = (fristPots, secondPots) => {
        const matchups = [];
        if (fristPots[0].group !== secondPots[0].group && fristPots[1].group !== secondPots[1].group) {
            matchups.push({ teamA: fristPots[0], teamB: secondPots[0] });
            matchups.push({ teamA: fristPots[1], teamB: secondPots[1] });
        } else if (fristPots[0].group !== secondPots[1].group && fristPots[1].group !== secondPots[0].group) {
            matchups.push({ teamA: fristPots[0], teamB: secondPots[1] });
            matchups.push({ teamA: fristPots[1], teamB: secondPots[0] });
        }
        return matchups
    };

    const quarterfinals = [
        ...findOpponent(pots.D, pots.G),
        ...findOpponent(pots.E, pots.F),
    ];

    const quarterfinalResults = quarterfinals.map((match) =>
        simulateMatchPlayOff(match.teamA, match.teamB)
    );

    const semifinals = [
        {
            teamA: quarterfinalResults[0].winner,
            teamB: quarterfinalResults[2].winner,
        },
        {
            teamA: quarterfinalResults[1].winner,
            teamB: quarterfinalResults[3].winner,
        },
    ];

    const semifinalResults = semifinals.map((match) =>
        simulateMatchPlayOff(match.teamA, match.teamB)
    );

    const finalMatch = simulateMatchPlayOff(
        semifinalResults[0].winner,
        semifinalResults[1].winner
    );

    const thirdPlaceMatch = simulateMatchPlayOff(
        semifinalResults[0].loser,
        semifinalResults[1].loser
    );

    return {
        quarterMatchs: quarterfinals,
        pots,
        quarterfinals: quarterfinalResults,
        semifinals: semifinalResults,
        final: finalMatch,
        thirdPlace: thirdPlaceMatch,
    };
}


function main() {
    const groupStandings = groupStage(groups);
    const rankedTeams = rankTeams(groupStandings);
    const finalRankings = finalRanking(rankedTeams);

    console.log('\nPlay off ---------------')
    finalRankings.slice(0, 8).forEach((item) => {
        console.log(`${item.rank}. ${item.Team} ${item.group}`)
    }
    )

    const { pots, quarterMatchs, semifinals, final, thirdPlace, quarterfinals } = eliminationPhase(
        finalRankings,
        groupStandings
    );
    console.log('\nŠeširi:')
    for (const pot in pots) {
        console.log(`\nŠešir: ${pot}`)
        pots[pot].forEach((item) => {
            console.log(item.Team)
        })
    }

    console.log('\nElimiciona faza:');

    quarterMatchs.forEach((item) => {
        console.log(`${item.teamA.Team} - ${item.teamB.Team}`)
    })


    console.log('\nČetvrtfinale:')
    quarterfinals.forEach((item) => {
        console.log(`${item.winner.Team} - ${item.loser.Team} ${item.score}`)
    })

    console.log('\nPolufinale:')
    semifinals.forEach((item) => {
        console.log(`${item.winner.Team} - ${item.loser.Team} ${item.score}`)

    })

    console.log('\nUtakmica za treće mesto:')
    console.log(`${thirdPlace?.winner.Team} - ${thirdPlace?.loser.Team} ${thirdPlace.score}`)

    console.log('\nFinale:')
    console.log(`${final.winner.Team} - ${final.loser.Team} ${final.score}`)

    console.log('\nMedalje:')
    console.log(`1.${final.winner.Team}`)
    console.log(`2.${final.loser.Team}`)
    console.log(`3.${thirdPlace.winner.Team}`)

}

main();
