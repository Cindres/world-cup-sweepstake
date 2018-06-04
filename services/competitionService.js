const fetch = require('node-fetch');
const fs = require('fs');

//WC = 467
//CL 2017/18 = 464
const baseUrl = 'https://api.football-data.org/v1/competitions/464/';

async function fetchWithHeader(url) {
    const API_KEY = process.env.API_KEY || fs.readFileSync('./api-key.txt');

    const response = await fetch(url, { headers: { 'X-Auth-Token': API_KEY } });
    const responseData = await response.json();

    return responseData;
}

async function populateGoalData(teamData) {
    const responseData = await fetchWithHeader(baseUrl + 'fixtures');

    //TODO: Tidy this up, teamData doesn't actually need returning since we're just manipulating the passed in object.
    //Try to rewrite this in such a way that we create a new object and leave the original untouched (puuuuuuuuure)
    responseData.fixtures
        .filter(fixture => fixture.status === 'FINISHED')
        .forEach(fixture => {
            const homeGoals = fixture.result.goalsHomeTeam;
            const awayGoals = fixture.result.goalsAwayTeam;
            teamData[fixture.homeTeamName].goals += homeGoals;
            teamData[fixture.awayTeamName].goals += awayGoals;

            if (homeGoals > awayGoals) {
                teamData[fixture.homeTeamName].wins++;
            } else if (awayGoals > homeGoals) {
                teamData[fixture.awayTeamName].wins++;
            } else {
                teamData[fixture.homeTeamName].draws++;
                teamData[fixture.awayTeamName].draws++;
            }
        });
    return teamData;
};

async function getCompetitionData() {

    const responseData = await fetchWithHeader(baseUrl + 'teams');

    const teamData = {};

    responseData.teams
        .sort((a, b) => {
            return (a.name < b.name) ? -1 : 1;
        })
        .forEach(team => {
            teamData[team.name] = {
                goals: 0,
                wins: 0,
                draws: 0
            };
        });

    const teamsPopulatedWithGoalData = await populateGoalData(teamData);
    return teamsPopulatedWithGoalData;
};

async function getTeamNames() {

  const responseData = await fetchWithHeader(baseUrl + 'teams');

    const teamNames = responseData.teams
      .map(team => team.name);

    return teamNames;
};

module.exports = {
    getCompetitionData,
    getTeamNames
};