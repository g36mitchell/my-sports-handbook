"use strict";

/******************************************************************************/
/*********************  Make the dropdown of League Teams  ********************/
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

function createLeagueTeamList(leagueID) {
    fetch(`${LEAGUE_INFO_API}?id=${leagueID}`)
    .then(response => response.json())
    .then(responseJson => {
        teamsList = responseJson["teams"];  /* cache the league's teams, which is only NFL in the MVP */
        var leagueTeamString =  generateLeagueTeamString(teamsList);
        displayTeams(leagueTeamString);
    })
    /* do a modal when the error is on the team list */
    .catch(error => alert(`Oops! Something went wrong. Try again later. ${error}`));
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
            <div>
                <a href="#${player.idPlayer}">Show player detail</a>
                <p id="${player.idPlayer}" class="expando roster-description">
                 ${(player.strDescriptionEN) ? player.strDescriptionEN : "<i>Not on file.</i>"}
                </p>
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
                <div><a href="#${player.idPlayer}">Show player detail</a>
                    <p id="${player.idPlayer}" class="expando roster-description">
                        ${(player.strDescriptionEN) ? player.strDescriptionEN : "<i>Not on file.</i>"}
                    </p>
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
    if ($("section.roster").hasClass("hidden")) {
        $("section.roster").toggleClass("hidden");
    }
    $('#js-roster-list').html(teamRoster);
}

function getTeamRoster(teamID) {
    fetch(`${TEAM_ROSTER_API}?id=${teamID}`)
      .then(response => response.json())
      .then(responseJson => {
          var rosterString =  generateRosterString(responseJson["player"]);
          displayRoster(rosterString);
      })
      .catch(error => displayRoster(`Error loading. ${error}`));
  }
/*----------------------------------------------------------------------------*/

/******************************************************************************/
/*****************  Make the Recent Events of the selected Team  **************/
function generateRecentEventsElement(event, teamID) {

 /* Determine win or loss, maybe a tie?*/   
    let rowClass = "row-tie";
    let results  = "T";

  if  (event.idHomeTeam === teamID) { 
    (parseInt(event.intHomeScore) > parseInt(event.intAwayScore)) ? rowClass = "row-win": rowClass = "row-loss";
  } 
  else {
    (parseInt(event.intHomeScore) > parseInt(event.intAwayScore)) ? rowClass = "row-loss": rowClass = "row-win";
  }

  switch (rowClass) {
      case "row-tie":  results = "T"; break;
      case "row-win":  results = "W"; break;
      case "row-loss": results = "L";
   } 
/* Score could be null for current game */
  let highlightReel = (event.intAwayScore) ? `<a href="${event.strVideo}" target="_blank"><img src="images/play_youtube_video.png" alt="play highlight video" /></a>` : "In Progress";

    return `
    <tr class="${rowClass}">
      <td class="column-middle">${event.intRound}</td>
      <td class="column-middle">${(event.intAwayScore) ? results : ' '}</td>
      <td class="column-left">${event.strEventAlternate}</td>
      <td class="column-middle">${(event.intAwayScore) ? event.intAwayScore : ' '}</td>
      <td class="column-middle">${(event.intHomeScore) ? event.intHomeScore : ' '}</td>
      <td class="column-left highlight-reel">${highlightReel}</td>
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
    if ($("section.recent").hasClass("hidden")) {
        $("section.recent").toggleClass("hidden");
    }
    $('#js-recent-list').html(recentEvents);
}

function getRecentEvents(teamID) {
    fetch(`${RECENT_EVENTS_API}?id=${teamID}`)
      .then(response => response.json())
      .then(responseJson => {
          var recentEventsString =  generateRecentEventsString(responseJson["results"], teamID);
          displayRecentEvents(recentEventsString);
      })
      .catch(error => displayRecentEvents(`Error loading. ${error}`));
  }

/*-----------------------------------------------------------------------------*/


/******************************************************************************/
/*****************  Make the Upcoming Events of the selected Team  **************/
function generateUpcomingEventsElement(event, teamID) {

    /* Determine home or away*/   
     let location = "";
   
     (event.idHomeTeam === teamID) ? location = "Home" : location = "Away";

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
       items.unshift(`<tr>
       <th class="column-middle column-header">Round</th>
       <th class="column-middle column-header">Location</th>
       <th class="column-left column-header">Game</th>
       <th class="column-middle column-header">Date</th>
     </tr>`);
       return items.join("");
   }
   
   function displayUpcomingEvents(upcomingEvents) {
        if ($("section.upcoming").hasClass("hidden")) {
            $("section.upcoming").toggleClass("hidden");
        }
        $('#js-upcoming-list').html(upcomingEvents);
   }

   function getUpcomingEvents(teamID) {
       fetch(`${UPCOMING_EVENTS_API}?id=${teamID}`)
         .then(response => response.json())
         .then(responseJson => {
             var upcomingEventsString =  generateUpcomingEventsString(responseJson["events"], teamID);
             displayUpcomingEvents(upcomingEventsString);
         })
         .catch(error => displayUpcomingEvents(`Error loading. ${error}`));
     }
   
   /*-----------------------------------------------------------------------------*/

/**********************************************************************************/
/*  Social media                                                                  */

function generateSocialMedia(t) {

/*  See which social media each team is using */
    let socialMedia = [];
    /* if the Team has a website */
    if ((t.strWebsite) && t.strWebsite != "") {
        socialMedia.push(`<a href="http://${t.strWebsite}" target="_blank"><img src="${t.strTeamBadge}" alt="team website" /></a>`); 
    }
    /* if the Team has a Facebook page */
    if ((t.strFacebook) && t.strFacebook != "") {
        socialMedia.push(`<a href="http://${t.strFacebook}" target="_blank"><img src="images/facebook.png" alt="team facebook" /></a>`);
    }
    /* if the Team has a Twitter account */
    if ((t.strTwitter) && t.strTwitter != "") {
        socialMedia.push(`<a href="http://${t.strTwitter}" target="_blank"><img src="images/twitter.png" alt="team twitter" /></a>`);
    }
    /* if the Team has an Instagram account */
    if ((t.strInstagram) && t.strInstagram != "") {
        socialMedia.push(`<a href="http://${t.strInstagram}" target="_blank"><img src="images/instagram.png" alt="team instagram" /></a>`);
    }
    
    return socialMedia.join('');
}

function displaySocialMedia(t) {

    $('#js-team-socialmedia').html(t);

}

/**********************************************************************************/
/**************   Get Team Details -- banner, stadium information, about          */

function generateAboutString(teamDetails) {
 
    return `<div class="teamLogo"><img src="${teamDetails.strTeamLogo}" alt="Team Logo" /></div>
    <section>
        <h2>History</h2>
        <div class="floatPictureRight">
               <img src="${teamDetails.strTeamBadge}" alt="Team Badge" />
        </div>
        <p class="longText">${(teamDetails.strDescriptionEN) ? teamDetails.strDescriptionEN : ' '}</p>
    </section>
    <section>
        <h2>Stadium</h2>
        <div class="floatPictureLeft"><img src="${teamDetails.strStadiumThumb}" alt="Team Stadium" /></div>
        <p class="longText">${(teamDetails.strStadiumDescription) ? teamDetails.strStadiumDescription : ' '}</p>
    </section>`;
}

function displayAbout(about) {
    if ($("section.about").hasClass("hidden")) {
        $("section.about").toggleClass("hidden")
    };
    $('#js-about').html(about);
}

function getTeamDetails(teamID, teamsList) {

/* used the cached team information */
    for (let i = 0; i < teamsList.length; i++) {
        if (teamsList[i].idTeam === teamID) {
             /* Display Banner */
            $('#js-team-banner').html(`<img src="${teamsList[i].strTeamBanner}" alt="team banner"/>`);

            /* Display Vitals */
            $('#js-team-vitals').html(`<p id="js-team-founded">Founded: ${teamsList[i].intFormedYear}</p>
                                       <p id="js-team-manager">Manager: ${teamsList[i].strManager}</p>`);

            /* Display Social Media */                           
            let socialMediaString = generateSocialMedia(teamsList[i]);
            displaySocialMedia(socialMediaString);

             /*  Generate About Section */
            let aboutString = generateAboutString(teamsList[i]);
            displayAbout(aboutString);

            /* If this is FTE then the section needs to be unhidden */
            if ($("#js-team-detail").hasClass("hidden")) {
                $("#js-team-detail").toggleClass("hidden"); 
            }

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
            getTeamDetails(teamID, teamsList);
            getRecentEvents(teamID); 
            getTeamRoster(teamID);
            getUpcomingEvents(teamID);
        }    
    });    
}
/********************************************************************************/


$(function () {

        /* import the league's teams list with each team's details one time */
        createLeagueTeamList(NFL_LEAGUE_ID);

        selectTeam();
        manageAbout();
        manageRecent();
        manageRoster();
        manageUpcoming();

});