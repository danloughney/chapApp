/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/

function listGroup(name, listName) {
    var html = '<fieldset><legend>%s</legend>'.format(name);
    for (var i = 0; i < listName.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="%s">%s</a>'.format(listName[i].href, listName[i].name);
    }
    html += '</fieldset>';
    return html;
}

document.addEventListener("DOMContentLoaded", function() {
    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        activityLog('home');
    });

    var html = '<table width="100%">';
    if (window.innerWidth > 500) {
        // 2 column
        html += '<tr valign="top"><td id="section1" width="50%" ></td><td id="section4" width="50%"></td></tr>' +
                '<tr valign="top"><td ><div id="section2"></div><div id="section3"></div></td><td id="section5"></td></tr>' +
                '<tr valign="top"><td></td><td id="section6"></td></tr>';
    } else {
        html += '<tr><td id="section1" width="100%" ></td></tr>' +
                '<tr><td id="section2" width="100%" ></td></tr>' +
                '<tr><td id="section3" width="100%" ></td></tr>' +
                '<tr><td id="section4" width="100%" ></td></tr>' +
                '<tr><td id="section5" width="100%" ></td></tr>';
    }
    html += '</table>';
    document.getElementById("newHome").innerHTML = html;

    document.getElementById('section1').innerHTML = listGroup('Today\'s Trip', [
        searchTripReport,
        searchBusSeatingChart,
        searchMorningCheckIn,
    ]);

    document.getElementById('section2').innerHTML = listGroup('Lessons', [
        searchLessonCheckIn, 
        searchCheckedInForLesson,
        searchLessonChanges
    ]);
    
    document.getElementById('section3').innerHTML = listGroup('Lunch', [
            searchLunchCheckIn
    ]);

    document.getElementById('section4').innerHTML = listGroup('Testing', [
        searchTestingRegistration,
        searchTestingEvaluation, 
        searchTestingResults, 
    ]);

    document.getElementById('section5').innerHTML = listGroup('Member Lists', [
        searchTodayTrip,
        searchInjuries,
        searchViolations,
        searchAllStudents, 
        searchAllSiblings, 
        searchAllChaperones, 
    ]);  
});
