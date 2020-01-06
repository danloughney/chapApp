/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/

var formatMember = function(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s</td></tr>".format(
            memberHome(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat)
        );    
    }

    return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
    );
}

var formatRegistration = function(registration) {
    return "<tr><td><b>%s</b><br>%s&nbsp;&nbsp;&nbsp;Paid %s</td></tr>".format(
        registration.DisplayName, 
        registration.RegistrationType.Name,
        (registration.IsPaid) ? 'Yes' : 'No'
    );
}

function renderResults(contacts, formatFunction) {
    if (contacts == undefined) {
        return;
    }

    var resultCount = 0;
    
    contacts.sort(search.sorter || { } );

    var html = '<table>';

    for (var i = 0; i < contacts.length; i++) {
        if (search.includeFn(contacts[i]) == true) {
            resultCount ++;
            html += formatFunction(contacts[i]);
        }
   }

    html += '</table>'
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
            var today = new Date().toJSON().slice(0,10);
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

    if (document.getElementById('rendered').value == 'yes') {
        return;
    }

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
                        renderResults(data.Contacts, formatMember);
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
