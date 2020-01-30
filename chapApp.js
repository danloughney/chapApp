/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/


document.addEventListener("DOMContentLoaded", function() {

    var html = '';
    for (var i = 0; i < morningLists.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[morningLists[i]].name + '">' + searches[morningLists[i]].name + '</a>';
    }
    document.getElementById("todaysLists").innerHTML = html;

    html = '';
    for (i = 0; i < lessonLists.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[lessonLists[i]].name + '">' + searches[lessonLists[i]].name + '</a>';
    }
    document.getElementById("lessonLists").innerHTML = html;

    html = '';
    for (i = 0; i < memberLists.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[memberLists[i]].name + '">' + searches[memberLists[i]].name + '</a>';
    }
    document.getElementById("membersLists").innerHTML = html;

    html = '';
    for (i = 0; i < testingList.length; i++) {
        if (i != 0) html += '<br>';
        html += '<a href="/caList?name=' + searches[testingList[i]].name + '">' + searches[testingList[i]].name + '</a>';
    }
    document.getElementById("testingLists").innerHTML = html;

    

});
