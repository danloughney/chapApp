/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/

function formatMember(contact) {
    return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s</td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
        fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat)
    );
        // contact.Id);
}

document.addEventListener("DOMContentLoaded", function() {
    $.listName = $.urlParam('name');
    document.getElementById('listName').innerHTML = $.listName;

    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        var html = '<table>';
        search = searches[$.listName];
        $.api.apiRequest({
            apiUrl: $.api.apiUrls.contacts({ '$filter' : search.filter }),
                                             // '$sort'   : search.sorter }), 
                                             // '$select' : search.selector }),
            success: function (data, textStatus, jqXhr) {
                var resultCount = 0;
                var contacts = data.Contacts;
                
                contacts.sort(search.sorter || { } );

                for (var i = 0; i < contacts.length; i++) {
                    resultCount ++;
                    html += formatMember(contacts[i]);
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
