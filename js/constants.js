var VIEW_HEIGHT = 20;
var VIEW_WIDTH = 20;
var ROUND_INTERMISSION_MS = 2000;
var ICE_SPEED = 700;
var ICE_WAVE_TIME = 200;
var PLAYER_MOVE_TIME = 10;
var PLAYERS_COUNT = 200;
var NEAT_SETTINGS = {
    popsize: PLAYERS_COUNT,
    elitism: Math.round(PLAYERS_COUNT * 0.2),
    mutationRate: 0.2,
    mutationAmount: 3
};
