/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/


document.addEventListener("DOMContentLoaded", function() {

    var html = '';
    for (var i = 0; i < lists.length; i++) {
        console.log('item: ', lists[i]);
        var link = '\<a href="/caList?name=' + lists[i] + '">' + lists[i] + '</a><br>';
        html += link;
        console.log(link);
    }
    document.getElementById("tblID").innerHTML = html;
});
