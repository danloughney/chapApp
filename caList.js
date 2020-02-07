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
        checkInURL(pageCheckInAM, registration.Contact.Id),
        registration.DisplayName, 
        registration.RegistrationType.Name,
        (registration.IsPaid) ? '' : 'Not Paid'
    );
}

const withIndexNo = 0;
const withIndexAlpha = 1;
const withIndexLesson = 2;

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
                case withIndexNo:
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

   if (withIndex != withIndexNo) {
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

function todaysRegistrations(membershipLevel, completion) {
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
                    break;
                }
            }

            if (todaysEvents.length==0) {
                console.log('This is no %s event for today'.format(membershipLevel));
                completion([]);
                return;
            }

            var params = {
                eventId: todaysEvents[0].Id,
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
        },
        error: function (data, textStatus, jqXhr) {
            completion([]);
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    $.listName = $.urlParam('name');
    $.search = searches[$.listName];

    document.getElementById('listName').innerHTML = "<b>%s</b><br><small>%s</small>".format($.listName, $.search.helpText);

    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        
        switch($.search.entity) {
            case 'contacts':
                $.api.apiRequest({
                    apiUrl: $.api.apiUrls.contacts({ '$filter' : $.search.filter }),
                                                     // '$sort'   : search.sorter }), 
                                                     // '$select' : search.selector }),
                    success: function (data, textStatus, jqXhr) {
                        document.getElementById('listResults').innerHTML = '';
                        var withIndex;
                        switch($.search.name) {
                            case listInTesting:
                                withIndex = withIndexNo;
                                break;

                            case listInLessons:
                                withIndex = withIndexLesson;
                                break;

                            default:
                                withIndex = withIndexAlpha;
                                break;
                        }
                        renderResults(data.Contacts, $.search.formatter, withIndex);
                    },
                    error: function (data, textStatus, jqXhr) {
                        document.getElementById('listResults').innerHTML = html = 'failed getting search result: ' + textStatus;
                    }
                });
                break;
            
            case 'registrations':
                document.getElementById('listResults').innerHTML = '';
                var contacts = [];//should be registrations
                todaysRegistrations('Student', function(data) {
                    contacts = contacts.concat(data);
                    todaysRegistrations('Sibling', function(data) {
                        contacts = contacts.concat(data);
                        todaysRegistrations('Chaperone', function(data) {
                            contacts = contacts.concat(data);
                            renderResults(contacts, formatRegistration, withIndexAlpha);
                        });
                    });
                });
                break;

            case 'registrationsNotCheckedIn':
                document.getElementById('listResults').innerHTML = '';
                var contacts = [];
                todaysRegistrations('Student', function(data) {
                contacts = contacts.concat(data);
                    var alreadyCheckedIn = { };
                    $.api.apiRequest({
                        apiUrl: $.api.apiUrls.contacts({ '$filter' : filterCheckedIn }),
                        success: function (data, textStatus, jqXhr) {
                            var checkedInContacts = data.Contacts;
                            for (var i = 0;i<checkedInContacts.length;i++) {
                                alreadyCheckedIn[checkedInContacts[i].Id] = checkedInContacts[i];
                            }

                            // remove any already checked in kids
                            for (i = 0; i < contacts.length; i++) {
                                if (alreadyCheckedIn[contacts[i].Contact.Id] != undefined) {
                                    contacts[i] = null;
                                }
                            }
                            renderResults(contacts, formatRegistrationCheckin, withIndexAlpha);
                        },
                        error: function (data, textStatus, jqXhr) {
                            console.log(textStatus);
                        }
                    });
                });
                break;

            case 'registrationsNotCheckedInChapsandSibs':
                document.getElementById('listResults').innerHTML = '';
                var contacts = [];
                todaysRegistrations('Sibling', function(data) {
                    contacts = contacts.concat(data);
                    todaysRegistrations('Chaperone', function(data) {
                        contacts = contacts.concat(data);
                        var alreadyCheckedIn = { };
                        $.api.apiRequest({
                            apiUrl: $.api.apiUrls.contacts({ '$filter' : filterCheckedIn }),
                            success: function (data, textStatus, jqXhr) {
                                var checkedInContacts = data.Contacts;
                                for (var i = 0;i<checkedInContacts.length;i++) {
                                    alreadyCheckedIn[checkedInContacts[i].Id] = checkedInContacts[i];
                                }

                                // remove any already checked in kids
                                for (i = 0; i < contacts.length; i++) {
                                    if (alreadyCheckedIn[contacts[i].Contact.Id] != undefined) {
                                        contacts[i] = null;
                                    }
                                }
                                renderResults(contacts, formatRegistrationCheckin, withIndexAlpha);
                            },
                            error: function (data, textStatus, jqXhr) {
                                console.log(textStatus);
                            }
                        });
                    });
                });
                break;

            case 'registrationsNotCheckedInALL':
                document.getElementById('listResults').innerHTML = '';
                var contacts = [];
                todaysRegistrations('Student', function(data) {
                    contacts = contacts.concat(data);
                    todaysRegistrations('Sibling', function(data) {
                        contacts = contacts.concat(data);
                        todaysRegistrations('Chaperone', function(data) {
                            contacts = contacts.concat(data);
                            var alreadyCheckedIn = { };
                            $.api.apiRequest({
                                apiUrl: $.api.apiUrls.contacts({ '$filter' : filterCheckedIn }),
                                success: function (data, textStatus, jqXhr) {
                                    var checkedInContacts = data.Contacts;
                                    for (var i = 0;i<checkedInContacts.length;i++) {
                                        alreadyCheckedIn[checkedInContacts[i].Id] = checkedInContacts[i];
                                    }

                                    // remove any already checked in kids
                                    for (i = 0; i < contacts.length; i++) {
                                        if (alreadyCheckedIn[contacts[i].Contact.Id] != undefined) {
                                            contacts[i] = null;
                                        }
                                    }
                                    renderResults(contacts, formatRegistrationCheckin, withIndexAlpha);
                                },
                                error: function (data, textStatus, jqXhr) {
                                    console.log(textStatus);
                                }
                            });
                        });
                    });
                });
                break;

            case 'changedLessons':
                document.getElementById('listResults').innerHTML = '';
                var registrations = [];
                var registeredLessons = { };

                todaysRegistrations('Student', function(data) {
                    registrations = registrations.concat(data);
                    todaysRegistrations('Sibling', function(data) {
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
