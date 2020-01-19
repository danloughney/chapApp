/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/


document.addEventListener("DOMContentLoaded", function() {

    var html = '';
    for (var i = 0; i < lists.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[lists[i]].name + '">' + searches[lists[i]].name + '</a>';
    }
    document.getElementById("todaysLists").innerHTML = html;

    html = '';
    for (i = 0; i < lists2.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[lists2[i]].name + '">' + searches[lists2[i]].name + '</a>';
    }
    document.getElementById("membersLists").innerHTML = html;

    html = '';
    for (i = 0; i < testingList.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[testingList[i]].name + '">' + searches[testingList[i]].name + '</a>';
    }
    document.getElementById("testingLists").innerHTML = html;

    

});
