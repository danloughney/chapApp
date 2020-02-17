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

var formatRegistrationCheckin = function(registration) {
    return '<tr><td><a href="%s">%s</a><br>%s&nbsp;&nbsp;&nbsp;%s</td></tr>'.format(
        checkInURL(pageCheckInAM, registration.Contact.Id) + 
            (($.busNumber != undefined) ? '&bus=' + $.busNumber : '') +
            (($.seatID != undefined) ? '&seatID=' + $.seatID : ''),
        registration.DisplayName,
        registration.RegistrationType.Name,
        (registration.IsPaid) ? '' : 'Not Paid'
    );
}


function renderResults(contacts, formatFunction, withIndex) {
    if (contacts == undefined) {
        return;
    }   
    contacts.sort($.search.sorter || { } );

    var html = '<table width="100%"><tr><td width="80%"><table>';
    var lastLabel = '';
    var labelList = [];
    var resultCount = 0;
 
    for (var i = 0; i < contacts.length; i++) {
        if (contacts[i] == null) {
            continue;
        }
        if ($.search.includeFn(contacts[i]) == true) {
            resultCount ++;
            switch(withIndex) {
                case withIndexNone:
                    break;

                case withIndexAlpha:
                    var name = contacts[i].LastName || contacts[i].DisplayName;
                    if (lastLabel != name.substring(0, 1).toUpperCase()) {
                        lastLabel = name.substring(0, 1).toUpperCase();
                        labelList.push(lastLabel);
                        html += '<tr><td align="center"><b>%s</b><a id=%s></a><td></tr>'.format(lastLabel, lastLabel);
                    }
                    break;

                case withIndexLesson:
                    var name = fieldValue(contacts[i], TripConfirmedLesson);
                    if (lastLabel != name.toUpperCase()) {
                        lastLabel = name.toUpperCase();
                        labelList.push(lastLabel);
                        html += '<tr><td align="center"><b><br>%s</b><a id=%s></a><td></tr>'.format(lastLabel, lastLabel);
                    }
                    break;
            }
            html += formatFunction(contacts[i]);
        }
   }

   if (withIndex != withIndexNone) {
        var indexHtml = ''; 
        for (var i = 0;i<labelList.length; i++) {
            indexHtml += '<a href="#%s">%s</a><br>'.format(labelList[i], labelList[i]);
        }
        html += '</table><td valign="top" align="center">%s</td></tr></table>'.format(indexHtml);
    }

    html = document.getElementById('listResults').innerHTML + html;
    document.getElementById('listResults').innerHTML = html;
    
    html = $.search.summaryFn(contacts);
    if (html != '') {
        document.getElementById('listCount').innerHTML = html;
    } else {
        document.getElementById('listCount').innerHTML = resultCount + ' Result' + (resultCount == 1 ? '' : 's');
    }
}

function todaysRegistrations(completion) {
    var today = $.todayOverride || new Date().toJSON().slice(0,10);
    var tmpDate = new Date();
    // all to handle the todayOverride string
    tmpDate.setDate(1);
    tmpDate.setHours(0);
    tmpDate.setMinutes(0);
    tmpDate.setSeconds(0);
    tmpDate.setFullYear(parseInt(today.substring(0, 4)));
    tmpDate.setMonth(parseInt(today.substring(5, 7))-1);
    tmpDate.setDate(parseInt(today.substring(8)));
    var tomorrow = new Date();
    tomorrow.setTime(tmpDate.getTime() + 24*60*60*1000);

    $.api.apiRequest({        
        apiUrl: $.api.apiUrls.events({ '$filter' : "'StartDate' ge '%s' AND 'StartDate' le '%s'".format(today, tomorrow.toJSON().slice(0,10)),
                                       '$select' : "'StartDate','Id'" }),
        success: function (data, textStatus, jqXhr) {
            console.log('list', data);

            var events = data.Events;
            if (events.length==0) {
                console.log('This is no %s event for today'.format(membershipLevel));
                completion([]);
                return;
            }

            for (var i = 0; i < events.length; i++) {
                var params = {
                    eventId: events[i].Id,
                };
    
                $.api.apiRequest({
                    apiUrl:$.api.apiUrls.registrations(params),
                    success: function (data, textStatus, jqXhr) {
                        completion(data);
                    },
                    error: function (data, textStatus, jqXhr) {
                        completion([]);
                    }
                });
            }
        },
        error: function (data, textStatus, jqXhr) {
            completion([]);
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    $.listName = $.urlParam('name');
    $.seatID = $.urlParam('seatID');
    $.busNumber = $.urlParam('bus');

    $.search = searchByName($.listName);

    if ($.seatID != undefined) {
        var helpText = 'Select member to check in on Bus %s&nbsp;&nbsp;Seat %s'.format($.busNumber, $.seatID)
    } else {
        var helpText = $.search.help;
    }

    document.getElementById('listName').innerHTML = "<b>%s</b><br><small>%s</small>".format($.listName, helpText);

    var startTs = new Date();
    var pendingRequests = 0;

    document.getElementById('listResults').innerHTML = 'Please wait...';

    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {

        console.log('starting query', $.search.name, startTs);
        switch($.search.entity) {
            case 'contacts':
                $.search.executeAndRender('listResults', 'listCount');
                break;
            
            case 'registrations':
                pendingRequests = 3;
                const completeRegistrations = function(data) {
                    --pendingRequests;
                    contacts = contacts.concat(data);

                    if (pendingRequests == 0) {
                        document.getElementById('listResults').innerHTML = '';
                        renderResults(contacts, formatRegistration, withIndexAlpha);
                        console.log('finished query', new Date() - startTs);
                    }
                }
                var contacts = [];//should be registrations
                
                todaysRegistrations(function(data) {
                    completeRegistrations(data);
                });
                break;

            case 'registrationsNotCheckedIn':
                pendingRequests = 4;
                var registrations = [];
                var checkedInContacts = [];
                var alreadyCheckedIn = { };
                
                const completeRegistrationsNotCheckedIn = function(data) {
                    --pendingRequests;

                    if (data != undefined) {
                        registrations = registrations.concat(data);
                    }

                    if (pendingRequests == 0) {
                        document.getElementById('listResults').innerHTML = '';

                        // remove any already checked in kids
                        for (var j = 0; j < registrations.length; j++) {
                            if (alreadyCheckedIn[registrations[j].Contact.Id] != undefined) {
                                registrations[j] = null;
                            }
                        }
                        renderResults(registrations, formatRegistrationCheckin, withIndexAlpha);
                        console.log('finished query', new Date() - startTs);
                    }
                }

                todaysRegistrations(function(data) {
                    console.log('got registrations', new Date() - startTs);
                    completeRegistrationsNotCheckedIn(data);
                });
                
                $.api.apiRequest({
                    apiUrl: $.api.apiUrls.contacts({ '$filter' : "'TripCheckInMorning' ne NULL" }),
                    success: function (data, textStatus, jqXhr) {
                        console.log('got checked in contacts', new Date() - startTs);
                        checkedInContacts = data.Contacts;
                        for (var i = 0; i< checkedInContacts.length;i++) {
                            alreadyCheckedIn[checkedInContacts[i].Id] = checkedInContacts[i];
                        }
                        completeRegistrationsNotCheckedIn();
                    },
                    error: function (data, textStatus, jqXhr) {
                        console.log(textStatus);
                    }
                });
                break;

            case 'changedLessons':
                var registrations = [];
                var registeredLessons = { };

                todaysRegistrations(function(data) {
                    registrations = registrations.concat(data);
                    todaysRegistrations(function(data) {
                        registrations = registrations.concat(data);

                        // create dictionary of members with registered lessons
                        for (var i = 0; i < registrations.length; i++) {
                            for (var j=registrations[i].RegistrationFields.length -1; j >= 0 ; j--) {
                                if (registrations[i].RegistrationFields[j].FieldName == "Lesson Options") {
                                    var value = registrations[i].RegistrationFields[j].Value;
                                    if (value != null) {
                                        registeredLessons[registrations[i].Contact.Id.toString()] = value.Label;
                                    }
                                    break;
                                }
                            }
                        }
                        
                        $.api.apiRequest({
                            apiUrl: $.api.apiUrls.contacts({ '$filter' : "'TripConfirmedLesson' ne NULL AND 'TripConfirmedLesson' ne ''"}),
                            success: function (data, textStatus, jqXhr) {
                                var html = '<table width="100%" border="1" cellpadding="1" cellspacing="1" width="200px" style="border-collapse:collapse;">';

                                var lessonContacts = data.Contacts;
                                for (var i = 0;i<lessonContacts.length;i++) {
                                    var key = lessonContacts[i].Id.toString();
                                    if (registeredLessons[key] === undefined) {
                                        html += '<tr><td width="20%">&nbsp;%s, %s</td><td>&nbsp;Added "%s"</td></tr>'.format(
                                            lessonContacts[i].LastName, 
                                            lessonContacts[i].FirstName, 
                                            fieldValue(lessonContacts[i], TripConfirmedLesson));
                                        continue;
                                    }
                                    if (registeredLessons[key] != fieldValue(lessonContacts[i], TripConfirmedLesson)) {
                                        html += '<tr><td width="20%">&nbsp;%s, %s</td><td>&nbsp;Changed to "%s" from "%s"</td></tr>'.format(
                                            lessonContacts[i].LastName, 
                                            lessonContacts[i].FirstName, 
                                            registeredLessons[key],
                                            fieldValue(lessonContacts[i], TripConfirmedLesson));
                                        continue;
                                    }
                                }

                                html += '</table>';
                                document.getElementById('listResults').innerHTML = html;

                                console.log('finished query', new Date() - startTs);
                            },
                            error: function (data, textStatus, jqXhr) {
                                console.log(textStatus);
                            }
                        });
                    });
                });
                break;    
        }
       
        return false;
    });
});
