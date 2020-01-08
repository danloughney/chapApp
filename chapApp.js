/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/


document.addEventListener("DOMContentLoaded", function() {

    var html = '';
    for (var i = 0; i < lists.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + lists[i] + '">' + lists[i] + '</a>';
    }
    document.getElementById("todaysLists").innerHTML = html;

    html = '';
    for (i = 0; i < lists2.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + lists2[i] + '">' + lists2[i] + '</a>';
    }
    document.getElementById("membersLists").innerHTML = html;
});
