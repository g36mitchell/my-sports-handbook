"use strict";

const END_POINT = `https://www.thesportsdb.com/api/v1/json`;
const API_KEY = 1;  /* 1 is the free developers key gives limited data back including subset of roster */

const LEAGUE_INFO_API = `${END_POINT}/${API_KEY}/lookup_all_teams.php`;
const RECENT_EVENTS_API =  `${END_POINT}/${API_KEY}/eventslast.php`;
const UPCOMING_EVENTS_API = `${END_POINT}/${API_KEY}/eventsnext.php`;
const TEAM_ROSTER_API = `${END_POINT}/${API_KEY}/lookup_all_players.php`;

const NFL_LEAGUE_ID = 4391;