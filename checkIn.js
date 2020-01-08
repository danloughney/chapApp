/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* code used for general check-in
*/


function appendMemberName(text) {
    var ele = document.getElementById("memberName").innerHTML;
    ele += '<br><strong>%s</strong>'.format(text);
    document.getElementById("memberName").innerHTML = ele;
}


function openCallback(memberData) {

    // get Event Info
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.events(),
        success: function (data, textStatus, jqXhr) {

            var membershipLevel = memberData.MembershipLevel.Name;

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
                alert('This is no %s event for today'.format(membershipLevel));
                return;
            }

            // Is this member registered for this event?
            $.eventID = todaysEvents[0].Id;            
            var params = {
                contactId: $.memberID,
                eventId: $.eventID,
            };

            $.api.apiRequest({
                apiUrl: $.api.apiUrls.registrations(params),
                success: function (data, textStatus, jqXhr) {
                    if (data.length == 0) {
                        appendMemberName('UNREGISTERED');
                        alert('%s isn\'t registered for this trip!'.format(membershipLevel));
                    } else {

                        // display lesson info
                        var registration = data[0];
                        for (i=0; i < registration.RegistrationFields.length; i++) {
                            if (registration.RegistrationFields[i].FieldName == "Lesson Options") {
                                $.lessonOption = registration.RegistrationFields[i].Value.Label;
                                appendMemberName($.lessonOption);
                            } else {
                                if ($.checkInType == pageLesson) {
                                    alert('WARNING: Member is NOT registered for a lesson');
                                }
                            }
                        }
                    }
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

document.addEventListener('DOMContentLoaded', function(){
    $.checkInType = $.urlParam('type');
    document.getElementById('checkInLabel').innerHTML = $.checkInType + ' Check In';

    $.pageOpen(openCallback);
});

function executeCheckIn() {
        checkIn($.checkInType, document.getElementById("notes").value, undefined);
}

function checkIn(checkInType, notes) {
    FLSChasCheckedIn($.api, $.memberID, checkInType, function(rc) {
        switch(rc) {
            case 1:
                if (confirm("WARNING: %s %s is ALREADY checked in for %s. Do you want to check in AGAIN?".format($.data.FirstName, $.data.LastName, $.checkInType))) {
                    FLSCcheckIn($.api, $.memberID, checkInType, notes);
                }
                break;
            case 0:
                if (confirm("Do you want to check in " + $.data.FirstName + " " + $.data.LastName + "?")) {
                    FLSCcheckIn($.api, $.memberID, checkInType, notes);
                }
                break;
            case -1:
                alert("Invalid MemberID " + FLSCformatMemberName($.data));
                break;
        }
    });
}


