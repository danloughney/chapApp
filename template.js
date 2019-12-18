/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* not used. this code is embedded in the bottom of the template
*/

var id = $.urlParam('ID');
var el = document.getElementById('qrcode');
if (id != undefined) {
    el.innerHTML = '<center><img src="%s height="200" width="200"></center>'.format(memberURL(id));
}