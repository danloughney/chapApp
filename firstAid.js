/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/

function formatMemberFirstAid(contact) {
    return "<tr><td><a href='%s'>%s, %s</a><br>%s</td></tr>".format(memberFirstAid(contact.Id), contact.LastName, contact.FirstName, contact.Id);
}

document.addEventListener("DOMContentLoaded", function() {
    $.listName = listFirstAid;
    document.getElementById('listName').innerHTML = $.listName;

    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        var html = '<table>';
        search = searches[$.listName];
        $.api.apiRequest({
            apiUrl: $.api.apiUrls.contacts({ '$filter' : search.filter, 
                                             '$sort'   : search.sorter, 
                                             '$select' : search.selector }),
            success: function (data, textStatus, jqXhr) {
                var resultCount = 0;
                var contacts = data.Contacts;
                
                for (var i = 0; i < contacts.length; i++) {
                    resultCount ++;
                    if ($.listName == 'First Aid') {
                        html += formatMemberFirstAid(contacts[i]);
                    } else {
                        html += formatMember(contacts[i]);
                    }
                }

                html += '</table>'
                document.getElementById('listResults').innerHTML = html;
                document.getElementById('listCount').innerHTML = resultCount + ' Result' + (resultCount == 1 ? '' : 's');

            },
            error: function (data, textStatus, jqXhr) {
                document.getElementById('listResults').innerHTML = html = 'failed getting search result: ' + textStatus;
            }
        });
       
        return false;
    });
});
