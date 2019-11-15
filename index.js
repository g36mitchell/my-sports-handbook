"use strict";

/*******************************************************************/
/***************  Make the dropdown of League Teams  ***************/
function generateTeamListElement(team) {
    return `<option value="${team.idTeam}">${team.strTeam}</option>`;
}

function generateLeagueTeamString(leagueTeams) {
    const items = leagueTeams.map((team) => generateTeamListElement(team));
    items.unshift('<option value="0">Select your team...</option>');
    return items.join("");
}

function displayTeams(leagueTeams) {
    $('#js-team-dropdown').html(leagueTeams);
}

function createLeagueTeamList(leagueID = 4391) {
    fetch(`https://www.thesportsdb.com/api/v1/json/1/lookup_all_teams.php?id=${leagueID}`)
    .then(response => response.json())
    .then(responseJson => {
        var leagueTeamString =  generateLeagueTeamString(responseJson["teams"]);
        displayTeams(leagueTeamString);
    })
    .catch(error => alert('Oops! Something went wrong. Try again later.'));
}
/*---------------------------------------------------------------------------*/

/*****************************************************************************/
/*********************  Make the Roster of the selected Team  ****************/
function generateRosterElement(player) {

    if (player.strHeight) {
    return `
    <li>
        <div class="roster-line-1">
            <h3 class="roster-name">${(player.strPlayer) ? player.strPlayer.toLowerCase() : " "}</h3>
            <h4 class="roster-position">${(player.strPosition) ? player.strPosition.toLowerCase() : " "}</h4>
            <p class="roster-vitals">${player.strHeight}, ${player.strWeight}</p>
            <p class="roster-hometown">${(player.strBirthLocation) ? player.strBirthLocation.toLowerCase() : " "}</p>  
        </div>
        <div class="roster-line-2">
            <div class="roster-picture">
                <img src="${player.strThumb}" alt="${player.strPlayer}" />
            </div>
            <div class="roster-description hidden">
                <p>${player.strDescriptionEN}</p>
            </div>
        </div>
    </li>`;
    } else {
        return `
        <li>
            <div class="roster-line-1">
                <h3 class="roster-name">${(player.strPlayer) ? player.strPlayer.toLowerCase() : " "}</h3>
                <h4 class="roster-position">${(player.strPosition) ? player.strPosition.toLowerCase() : " "}</h4>
                <p class="roster-hometown">${(player.strBirthLocation) ? player.strBirthLocation.toLowerCase() : " "}</p>  
            </div>
            <div class="roster-line-2">
                <div class="roster-picture">
                    <img src="${player.strThumb}" alt="${player.strPlayer}" />
                </div>
                <div class="roster-description hidden">
                    <p>${player.strDescriptionEN}</p>
                </div>
            </div>
        </li>`;

    }
}

function generateRosterString(teamPlayers) {
    const items = teamPlayers.map((player) => generateRosterElement(player)); 
    return items.join("");
}

function displayRoster(teamRoster) {
    $('#js-roster-list').html(teamRoster);
}

function getTeamRoster(teamID) {
    fetch(`https://www.thesportsdb.com/api/v1/json/1/lookup_all_players.php?id=${teamID}`)
      .then(response => response.json())
      .then(responseJson => {
          var rosterString =  generateRosterString(responseJson["player"]);
          displayRoster(rosterString);
      })
      .catch(error => alert('Oops! Something went wrong loading the Roster. Try again later.'));
  }
/*----------------------------------------------------------------------------*/

/******************************************************************************/
/*****************  Make the Recent Events of the selected Team  **************/
function generateRecentEventsElement(event, teamID) {

 /* Determine win or loss, maybe a tie?*/   
    let rowClass = "row-tie";
    let results = "T";

  if  (event.idHomeTeam == teamID) { 
     (event.intHomeScore > event.intAwayScore) ? rowClass = "row-win": rowClass = "row-loss";
  } 
  else {
    (event.intHomeScore > event.intAwayScore) ? rowClass = "row-loss": rowClass = "row-win";
  }

  switch (rowClass) {
      case "row-tie": results = "T"; break;
      case "row-win": results = "W"; break;
      case "row-loss": results = "L";
  } 

    return `
    <tr class="${rowClass}">
      <td class="column-middle">${event.intRound}</td>
      <td class="column-middle">${results}</td>
      <td class="column-left">${event.strEventAlternate}</td>
      <td class="column-middle">${event.intAwayScore}</td>
      <td class="column-middle">${event.intHomeScore}</td>
      <td class="column-left highlight-reel"><a href="${event.strVideo}" target="_blank">Highlights</a></td>
    </tr>`;
}

function generateRecentEventsString(teamEvents, teamID) {
    const items = teamEvents.map((event) => generateRecentEventsElement(event, teamID)); 
    items.unshift(`    <tr>
    <th class="column-middle column-header">Round</th>
    <th class="column-middle column-header"></th>
    <th class="column-left column-header">Game</th>
    <th class="column-middle column-header">V</th>
    <th class="column-middle column-header">H</th>
    <th class="column-middle column-header">Video</th>
  </tr>`);
    return items.join("");
}

function displayRecentEvents(recentEvents) {
    $('#js-recent-list').html(recentEvents);
}

function getRecentEvents(teamID) {
    fetch(`https://www.thesportsdb.com/api/v1/json/1/eventslast.php?id=${teamID}`)
      .then(response => response.json())
      .then(responseJson => {
          var recentEventsString =  generateRecentEventsString(responseJson["results"], teamID);
          displayRecentEvents(recentEventsString);
      })
      .catch(error => alert('Oops! Something went wrong loading Recent Events. Try again later.'));
  }

/*-----------------------------------------------------------------------------*/


/******************************************************************************/
/*****************  Make the Upcoming Events of the selected Team  **************/
function generateUpcomingEventsElement(event, teamID) {

    /* Determine home or away*/   
     let location = "";
   
     (event.idHomeTeam == teamID) ? location = "Home" : location = "Away";

       return `
       <tr>
         <td class="column-middle">${event.intRound}</td>
         <td class="column-middle">${location}</td>
         <td class="column-left">${event.strEventAlternate}</td>
         <td class="column-middle">${event.dateEvent} ${event.strTime}</td>
       </tr>`;
   }
   
   function generateUpcomingEventsString(teamEvents, teamID) {
       const items = teamEvents.map((event) => generateUpcomingEventsElement(event, teamID)); 
       items.unshift(`    <tr>
       <th class="column-middle column-header">Round</th>
       <th class="column-middle column-header">Location</th>
       <th class="column-left column-header">Game</th>
       <th class="column-middle column-header">Date</th>
     </tr>`);
       return items.join("");
   }
   
   function displayUpcomingEvents(upcomingEvents) {
       $('#js-upcoming-list').html(upcomingEvents);
   }
   
   function getUpcomingEvents(teamID) {
       fetch(`https://www.thesportsdb.com/api/v1/json/1/eventsnext.php?id=${teamID}`)
         .then(response => response.json())
         .then(responseJson => {
             var upcomingEventsString =  generateUpcomingEventsString(responseJson["events"], teamID);
             displayUpcomingEvents(upcomingEventsString);
         })
         .catch(error => alert('Oops! Something went wrong loading Upcoming Events. Try again later.'));
     }
   
   /*-----------------------------------------------------------------------------*/



/**********************************************************************************/
/**************   Get Team Details -- banner, stadium information, about          */

function generateAboutString(teamDetails) {
 
    return `<img src="${teamDetails.strTeamLogo}" alt="Team Logo" />
    <h3>History</h3>
    <p>
          <img class="floatPictureRight" src="${teamDetails.strTeamBadge}" alt="Team Badge" />
          ${teamDetails.strDescriptionEN}
    </p>
    <h3>Stadium</h3>
    <p>
        <img class="floatPictureLeft"src="${teamDetails.strStadiumThumb}" alt="Team Stadium" />
        ${teamDetails.strStadiumDescription}
    </p>`;
}

function displayAbout(about) {
    $('#js-about').html(about);
}

function getTeamDetails(teamID) {

/* used the cached team information */
    for (let i = 0; i < teamsList.length; i++) {

        if (teamsList[i].idTeam == teamID) {

             /*  Provide Banner URL */
             $('#js-team-banner img').attr('src', teamsList[i].strTeamBanner);
             $("js-team-detail").toggleClass("hidden"); 

             /*  About section  */
              let aboutString = generateAboutString(teamsList[i]);
              displayAbout(aboutString);

              break;  /* no need to keep looping */
        }
    }
}

/*--------------------------------------------------------------------------------*/

/********************************************************************************/
/***************   Manage the showing and unshowing of the stuff  ***************/
function manageRecent() {

    $("#js-team-recent").on('click', function() {
        $("div.recent").toggleClass("hidden");
    }); 
}

function manageRoster() {

    $("#js-team-roster").on('click', function() {
        $("div.roster").toggleClass("hidden");
    }); 
}

function manageUpcoming() {

    $("#js-team-upcoming").on('click', function() {
        $("div.upcoming").toggleClass("hidden");
    }); 
}

function manageAbout() {

    $("#js-team-about").on('click', function() {
        $("div.about").toggleClass("hidden");
    }); 
}

/*-----------------------------------------------------------------------------*/

/*******************************************************************************/
/*          Once a team is selected... load all of its stuff                   */

function clearLastTeam() {
    $('#js-about').html(" ");
    $('#js-upcoming-list').html(" ");
    $('#js-recent-list').html(" ");
    $('#js-roster-list').html(" ");
}

function selectTeam() {
    $("#js-team-dropdown").on("change", function() {

        let teamID = $("#js-team-dropdown").val();        
        if (teamID != 0) {

            clearLastTeam();

            /* Fill in the team's data */
            getTeamDetails(teamID);
            getRecentEvents(teamID); 
            getTeamRoster(teamID);
            getUpcomingEvents(teamID);
        }    
    });    
}
/********************************************************************************/


$(function () {
        createLeagueTeamList();
        selectTeam();
        manageAbout();
        manageRecent();
        manageRoster();
        manageUpcoming();
});