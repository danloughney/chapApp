/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/

var formatRegistration = function(registration) {
        return '<tr><td><a href="%s">%s</a><br>%s&nbsp;&nbsp;&nbsp;%s</td></tr>'.format(
        memberHome(registration.Contact.Id),
        registration.DisplayName, 
        registration.RegistrationType.Name,
        (registration.IsPaid) ? '' : 'Not Paid'
    );
}

function renderResults(contacts, formatFunction) {
    if (contacts == undefined) {
        return;
    }

    var resultCount = 0;
    
    contacts.sort(search.sorter || { } );

    var html = '<table width="100%"><tr><td width="80%"><table>';
    var lastLabel = '';
    var labelList = [];
    for (var i = 0; i < contacts.length; i++) {
        if (search.includeFn(contacts[i]) == true) {
            resultCount ++;
            var name = contacts[i].LastName || contacts[i].DisplayName;
            if (lastLabel != name.substring(0, 1)) {
                lastLabel = name.substring(0, 1).toUpperCase();
                labelList.push(lastLabel);
                html += '<tr><td align="center"><b>%s</b><a id=%s></a><td></tr>'.format(lastLabel, lastLabel);
            }
            html += formatFunction(contacts[i]);
        }
   }

   var indexHtml = ''; 
   for (var i = 0;i<labelList.length; i++) {
       indexHtml += '<a href="#%s">%s</a><br>'.format(labelList[i], labelList[i]);
    }
    html += '</table><td valign="top" align="center">%s</td></tr></table>'.format(indexHtml);

    html = document.getElementById('listResults').innerHTML + html;
    document.getElementById('listResults').innerHTML = html;
    
    
    html = search.summaryFn(contacts);
    if (html != '') {
        document.getElementById('listCount').innerHTML = html;
    } else {
        document.getElementById('listCount').innerHTML = resultCount + ' Result' + (resultCount == 1 ? '' : 's');
    }
}

function todaysRegistrations(membershipLevel) {
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.events(),
        success: function (data, textStatus, jqXhr) {
            console.log('list', data);

            var todaysEvents = [];
            var today = $.todayOverride || new Date().toJSON().slice(0,10);
            var events = data.Events;
            for (i=0; i < events.length; i++) {
                var event = events[i];
                if (event.EndDate.slice(0,10) == today && event.Name.includes(membershipLevel)) {
                    console.log('found today event', event);
                    todaysEvents.push(event);
                }
            }
            if (todaysEvents.length==0) {
                console.log('This is no %s event for today'.format(membershipLevel));
                return;
            }

            var params = {
                eventId: todaysEvents[0].Id,
            };

            $.api.apiRequest({
                apiUrl:$.api.apiUrls.registrations(params),
                success: function (data, textStatus, jqXhr) {
                    renderResults(data, formatRegistration);
                },
                error: function (data, textStatus, jqXhr) {
                    //document.getElementById('listResults2').innerHTML = html = 'failed getting search result: ' + textStatus;
                }
            });

        },
        error: function (data, textStatus, jqXhr) {
            //document.getElementById('listResults2').innerHTML = html = 'failed getting search result: ' + textStatus;
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {

    // if (document.getElementById('rendered').value == 'yes') {
    //     return;
    // }

    $.listName = $.urlParam('name');
    document.getElementById('listName').innerHTML = $.listName;

    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        
        search = searches[$.listName];

        switch(search.entity) {
            case 'contacts':
                $.api.apiRequest({
                    apiUrl: $.api.apiUrls.contacts({ '$filter' : search.filter }),
                                                     // '$sort'   : search.sorter }), 
                                                     // '$select' : search.selector }),
                    success: function (data, textStatus, jqXhr) {
                        document.getElementById('listResults').innerHTML = '';
                        renderResults(data.Contacts, search.formatter);
                        document.getElementById('rendered').value = 'yes';
                    },
                    error: function (data, textStatus, jqXhr) {
                        document.getElementById('listResults').innerHTML = html = 'failed getting search result: ' + textStatus;
                    }
                });
                break;
            
            case 'registrations':
                document.getElementById('listResults').innerHTML = '';
                todaysRegistrations('Student');
                todaysRegistrations('Sibling');
                todaysRegistrations('Chaperone');
                document.getElementById('rendered').value = 'yes';
                break;
        }
       
        return false;
    });
});
