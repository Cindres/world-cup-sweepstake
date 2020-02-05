const playerRepository = require('../repositories/playerRepository');
const competitionService = require('../services/competitionService');

const getPointsForPlayer = (player, teams) => {
  let points = 0;
  player.teams.goals.forEach(team => {
      points += teams[team].goals;
  });
  player.teams.outcomes.forEach(team => {
      points += (teams[team].draws + (teams[team].wins * 3));
  });

  return points;
};

const getTotalGoals = teams => {
  return Object.keys(teams)
    .map(key => teams[key].goals)
    .reduce((tally, next) => tally + next);
};

const getPlayersWithPoints = async (isLiveRequest) => {
  const players = await playerRepository.getPlayers();
  const teams = await competitionService.getTeamsWithOutcomeData(isLiveRequest);

  const totalGoals = getTotalGoals(teams);

  const playersWithPoints = players
    .map(player =>  {
      const points = getPointsForPlayer(player, teams);
      return {
          ...player,
          points
      };
    }).sort((a, b) => {
      if (a.points < b.points) return 1;
      if (a.points > b.points) return -1;

      const aDistanceToTotalGoals = Math.abs(totalGoals - a.goalsPredicted);
      const bDistanceToTotalGoals = Math.abs(totalGoals - b.goalsPredicted);

      if (aDistanceToTotalGoals > bDistanceToTotalGoals) return 1;
      if (aDistanceToTotalGoals < bDistanceToTotalGoals) return -1;

      return 0;
    });

  return playersWithPoints;
};

const addPlayer = async (player) => {
  return await playerRepository.addPlayer(player);
};

module.exports = {
  getPlayersWithPoints,
  addPlayer
};