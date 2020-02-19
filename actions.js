/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/
    
// all FLSC custom field names
const TripCheckInMorning = "TripCheckInMorning";
const TripBusNumber = "TripBusNumber";
const TripBusSeat = "TripBusSeat";
const TripConfirmedLesson = 'TripConfirmedLesson';
const TripCheckInLunch = "TripCheckInLunch";
const TripCheckInDepart = "TripCheckInDepart";
const TripCheckInLesson = "TripCheckInLesson";
const TripCheckInTesting = "TripCheckInTesting";
const TripChapNotes = "TripChapNotes";
const TripViolationDate = "TripViolationDate";
const TripViolationNotes = "TripViolationNotes";
const TripInjuryNotes = "First Aid Notes";
const TripLastUpdateDate  = "TripLastUpdateDate";
const TripDetentionFlag = 'Detention?';
const TripDetentionNotes = 'Detention Explanation';
const ProficiencyField = 'Proficiency Test Pass?'; 
const TripTestDate = 'TripTestDate';
const TripBusCaptain = 'TripBusCaptain';

const fieldCellPhone = "Cell Phone";
const detentionRequired = 12555903;

// page/actions
const pageCheckInAM = 'AM';         // morning check-in
const pageLesson = 'Lesson';        // check-in at lesson
const pageLunch = 'Lunch';          // mandatory lunch check-in
const pageChangeLesson = 'Change Lesson';
const pageDepart = 'Departure';     // going home
const pageTesting = 'Testing';      // testing check-in
const pageCertification = 'Certification';      // chap will certify member
const pageNotes = 'Notes';          // general notes
const pageFirstAid = 'First Aid Notes';   // first aid page, report an injury
const pageViolation = 'Violation';  // report rule violation

// maps the page to the corresponding DB field
const pageTripMap = { 'AM' : TripCheckInMorning,
                      'Lesson': TripCheckInLesson, 
                      'Lunch': TripCheckInLunch, 
                      'Departure': TripCheckInDepart,
                      'Testing': TripCheckInTesting, 
                      'Notes' : TripChapNotes,
                      'First Aid Notes' : TripInjuryNotes,
                      'Violation' : TripViolationNotes,
                    };

function checkInURL(pageType, Id) {
    var nextPage = '';

    switch(pageType) {
        case pageCheckInAM:
            return '%s/morningCheckIn?ID=%s&type=%s'.format(clubBaseURL, Id, pageType);

        case pageChangeLesson:
            return '%s/caLesson?ID=%s'.format(clubBaseURL, Id);
            
        // check in for lunch, lesson, testing, etc.
        case pageLunch:
        case pageLesson:
        case pageDepart:
        case pageTesting:
            return '%s/checkIn?ID=%s&type=%s'.format(clubBaseURL, Id, pageType);

        case pageCertification://doesn't exist yet
            return '%s/testingEval?ID=%s&type=%s'.format(clubBaseURL, Id, pageType);
         
        case pageFirstAid:
        case pageViolation:
        case pageNotes:
            return '%s/reportEvent?ID=%s&type=%s'.format(clubBaseURL, Id, pageTripMap[pageType]);

        default:
            return '';
    }    
}

$.nextPage = function(pageType) {
    var nextPage = checkInURL(pageType, $.data.Id);

    if (nextPage != '') {
        window.location.href=nextPage;
    }

}

function sgGetChapInfo() {
    console.log('getting chap info');
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.me(),
        success: function (chapData, textStatus, jqXhr) {
            $.chapName = FLSCformatChapName(chapData);
            $.chapID = chapData.Id;
            $.busCaptain = fieldValue(chapData, TripBusNumber);
            console.log('got chap info');
        }
    });
}

function sgGetBusCaptain(busNumber, completion) {
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts({ '$filter' : "'TripBusCaptain' eq '%s'".format(busNumber) }),

        success: function (data, textStatus, jqXhr) {
            completion(data);
        },
        error: function (data, textStatus, jqXhr) {
            console.log('find bus captain failed');
        }
    });
}

function appendMemberName(text) {
    var ele = document.getElementById("memberName").innerHTML;
    ele += '<br><strong>%s</strong>'.format(text);
    document.getElementById("memberName").innerHTML = ele;
}

$.pageOpen = function(callback) {
    // render the initial page with all selected member data
    $.spinner = new Spinner(spinOpts).spin(document.body);
    
    $.api = new WApublicApi(FLSCclientID);
    $.memberID = $.urlParam("ID");
    
    $.when($.api.init()).done(function(){
        sgGetChapInfo();

        console.log('getting member info');
        // get the member info and populate the page
        var memberURL=$.api.apiUrls.contact($.memberID) + "?getExtendedMembershipInfo=true";
        $.api.apiRequest({
            apiUrl: memberURL,
            success: function (data, textStatus, jqXhr) {
                $.data = data;
                
                var memberStatus = fieldValue($.data, 'Member Status');
                var checkedIn = fieldValue($.data, TripCheckInMorning);

                document.getElementById("memberName").innerHTML = "%s<br>%s/%s%s".format(
                    FLSCformatName($.data),
                    $.data.MembershipLevel.Name,
                    (memberStatus ? memberStatus.Label : ''),
                    (checkedIn ? '<br>Bus %s  Seat %s'.format(fieldValue($.data, TripBusNumber), fieldValue($.data, TripBusSeat)) : '')
                );
                
                var detention = fieldValue($.data, 'Detention?');
                if (detention && detention.Id == detentionRequired) {
                    var cell = document.getElementById('detentionCell');
                    if (cell) {
                        cell.innerHTML = '<label class="labelBad" href="%s">Detention Required</label>'.format(memberDetention());
                    }
                }

                /*       <tr align="left" valign="top">
                    <td>
                    <fieldset id="currentNoteFieldset">
                        <legend id="currentNoteLabel">Note History<br></legend> <label id="currentNote">&nbsp;</label>
                    </fieldset>
                    </td>
                </tr>
                */
                var currentNote = document.getElementById('currentNote');
                if (currentNote != undefined) {
                    currentNote.innerHTML = fieldValue($.data, TripChapNotes);
                }
                
                var profilePhotoBackground = document.getElementById('photoBackground')
                if (profilePhotoBackground) {
                    profilePhotoBackground.style = memberStatusBackgroundStyle(memberStatus);
                }

                var profilePhotoCell = document.getElementById("profilePhoto");
                var photoOK = true;
                if (profilePhotoCell) {
                    var photoValue = fieldValue(data, FLSCphoto);
                    if (photoValue) {
                        $.api.apiRequest({
                            apiUrl: $.api.apiUrls.picture(photoValue.Id) + '?asBase64=true&fullSize=true',
                            method: "GET",
                            dataType: "text",
                            success: function(photoData, textStatus, jqXhr) {
                                document.getElementById('profilePhoto').src = 'data:image;base64,' + photoData;
                            },
                            error: function(data, textStatus, jqXhr) {
                                photoOK = false;    
                            } 
                        });       
                    } else {
                        photoOK = false;
                    }
                } else {
                    photoOK = false;
                }
                if (!photoOK) {
                    document.getElementById('profilePhoto').src = '/Resources/Images/noPhoto.svg';
                }

                var membershipLevel = data.MembershipLevel.Name;
                getCurrentEventRegistration($.api, $.memberID, membershipLevel, function(registrations) {
                    if (registrations.length == 0) {
                        appendMemberName('UNREGISTERED');
                        timedAlert('%s isn\'t registered for today\'s trip!'.format(membershipLevel));
                    } else {            
                        // display lesson info
                        $.registration = registrations[0];
                        $.lessonOption == '';
                        var tripConfirmedLesson = fieldValue(data, TripConfirmedLesson);
                        if (tripConfirmedLesson != undefined && tripConfirmedLesson != '') {
                            $.lessonOption = tripConfirmedLesson;
                            appendMemberName($.lessonOption + ' Lesson');
                        } else {
                            for (i=0; i < $.registration.RegistrationFields.length; i++) {
                                if ($.registration.RegistrationFields[i].FieldName == "Lesson Options") {
                                    var value = $.registration.RegistrationFields[i].Value;
                                    if (value == null) {
                                        $.lessonOption = "No";
                                    } else {
                                        $.lessonOption = $.registration.RegistrationFields[i].Value.Label || "No";
                                    }
                                    appendMemberName($.lessonOption + ' Lesson');
                                    break;
                                }
                            }
                        }
                    }
                    // callback AFTER we get Event info (or not)
                    if (callback) {
                        callback(data);
                    }
                    $.spinner.stop();
                });
            },
            error: function (jqXHR, textStatus, errorThrown) {
                document.getElementById("memberName").innerHTML = "Unknown memberID [" + $.memberID + "]";
                $.spinner.stop();
            }
        });
        return false;
    });
}

function goMemberHomeByName(firstName, lastName) {
    // not used
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts({ '$filter' : "'Status' eq 'Active' AND 'First name' eq %s AND 'Last name' eq %s".format(firstName, lastName)}),
        success: function (data, textStatus, jqXhr) {
            if (data.Contacts.length == 0) {
                alert('could not find member %s %s'.format(firstName, lastName));
                return;
            }
            goMemberHome(data.Contacts[0].Id);

        },
        error: function (data, textStatus, jqXhr) {
            console.log('failed finding user by name');
        }
    });

}

function FLSCputMemberData(api, memberID, fieldValues, fSuccess, fError) {
    //todo: handle concurrency
    //todo: add audit data log
    api.apiRequest({
        apiUrl: api.apiUrls.contact(memberID),
        success: function (data, textStatus, jqXhr) {
            
            api.apiRequest({
                apiUrl: api.apiUrls.contact(memberID),
                    method: "PUT",
                    data: { 
                        id: memberID, 
                        fieldValues: fieldValues
                    },
                    success: function(data, textStatus, jqXhr){
                        console.log('SUCCESS PUT member: ' + memberID);
                        fSuccess(fieldValues, textStatus) || { };
                    },
                    error: function(data, textStatus, jqXhr) {
                        console.log('**FAILURE PUT member: ' + memberID);
                        fError(fieldValues, textStatus) || { };
                    }
            });
            
         },
         error: function(data, textStatus, jqXhr) {
            console.log('**MEMBER NOT FOUND: ' + memberID, fieldValues);
            fError(fieldValues)
        }
    });
}


function FLSCcheckInAM(api, memberID, busNumber, busSeat, lessonOption, notes, skipBack) {
    var fieldValues = [ 
        { fieldName:TripCheckInMorning, value: FLSCformatDate(new Date()) },
        { fieldName:TripBusNumber, value: busNumber },
        { fieldName:TripBusSeat, value: busSeat }
    ];

    if (lessonOption != 'No' && lessonOption != '') {
        fieldValues.push({ fieldName:TripConfirmedLesson, value: lessonOption });
    }

    if (notes != undefined && notes != '') {
        notes = FLSCformatComment(fieldValue($.data, TripChapNotes), notes, $.chapName);
        fieldValues.push({ fieldName: TripChapNotes, value: notes });
    }

    FLSCputMemberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            if (skipBack != undefined) {
                FLSCwindowAlert('Check in successful. Bus ' + busNumber + ' Seat ' + busSeat, FLSCwindowBack2);
            } else {
                FLSCwindowAlert('Check in successful. Bus ' + busNumber + ' Seat ' + busSeat, FLSCwindowBack);
            }
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Failed to update contact. Try again. You may not have permission. " + textStatus);
        });
}

function FLSCcheckIn(api, memberID, checkInType, notes) {
    var fieldValues = [
        { fieldName : pageTripMap[checkInType], value: FLSCformatDate(new Date()) }
    ];

    if (notes != undefined && notes != '') {
        notes = FLSCformatComment(fieldValue($.data, TripChapNotes), notes, $.chapName);
        fieldValues.push({ fieldName: TripChapNotes, value: notes });
    }

    FLSCputMemberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Check in ' + checkInType + ' successful', FLSCwindowBack);
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Check in for ' + checkInType + ' FAILED. Try again. You may not have permission. ' + textStatus);
        });
}

function FLSCactionReportNote(api, memberID, text, reportType, reportName) {
    if (text == undefined || text == '') {
        console.log('nothing to report');
        return;
    }

    text = FLSCformatComment(fieldValue($.data, reportType), text, $.chapName);
    var fieldValues = [ { fieldName: reportType, value: text } ];
    
    // syntax error here...
    switch (reportType) {
        case TripViolationNotes:
            fieldValues.push( { fieldName: TripViolationDate, value: FLSCformatDate(new Date()) });
            break;
        
            default:
            break;
    }
    
    FLSCputMemberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('%s reported'.format(reportName), FLSCwindowBack);
        },
        function(fieldValues, textStatus) {
            FLSCwindowAlert('%s report failed (%s). Try again. You may not have permission. '.format(reportType, textStatus));
        }
    );
}

/*
function FLSCactionReportInjury(api, memberID, injury) {
    if (injury == undefined || injury == '') {
        console.log('no injury to report');
        return;
    }

    injury = FLSCformatComment(fieldValue($.data, TripInjuryNotes), injury, $.chapName);
    var fieldValues = [
        { fieldName: TripInjuryNotes, value: injury },
        { fieldName: TripInjuryDate, value: FLSCformatDate(new Date()) }
    ];

    FLSCputMemberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Injury reported');
            FLSCwindowBack();
        },
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Injury report failed ' + textStatus) + '. Try again';
        }
    );
}
*/

// check to see if the given check-in type has already happened.
function FLSChasCheckedIn(api, memberID, checkInType, f) {
    // f is the callback that accepts the result 
    api.apiRequest({
        apiUrl: api.apiUrls.contact(memberID),
        success: function (data, textStatus, jqXhr) {
                value = fieldValue(data, pageTripMap[checkInType]);
            if (value == undefined || value == '') {
                f(0); // not checked in
            } else {
                f(1); // checked in
            }
         },
         error: function(data, textStatus, jqXhr){
            console.log("member not found");
            f(-1); // error
        }
    });
}

function FLSCisSeatAlreadyTaken(api, busNumber, seatNumber, completion) {
    var params = { 
        //'$filter' : "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL)" // 
        '$filter' : "'TripBusNumber' eq '%s' AND 'TripBusSeat' eq '%s'".format(busNumber, seatNumber),
    };

    api.apiRequest({
        apiUrl: api.apiUrls.contacts(params),
        success: function (data, textStatus, jqXhr) {
            console.log('result', data);
            completion(data);
         },
         error: function(data, textStatus, jqXhr){
            console.log("member not found");
            completion(); // error
        }
    });
}

function WAcheckInTrip(api, memberID, eventID) {
    // doesn't exist from WA yet.
    return;
}

function CAmemberQuery(api, query, fields, completion) {
    var params = {
        $filter : query,
        $select : fields
    };
    var restQuery = api.apiUrls.contacts(params);
    console.log('query: ' + restQuery);

    api.apiRequest({
        apiUrl: restQuery,
        success: function (data, textStatus, jqXhr) {
            completion(data);
            // if (fieldValue(data, checkInType) == undefined) {
            //     f(0); // not checked in
            // } else {
            //     f(1); // checked in
            // }
         },
         error: function(data, textStatus, jqXhr){
            console.log("member not found");
            completion(data); // error
        }
    });
}

function FLSCresetTripFields(api, memberID, completion, resultCount, outputField) {
    var fieldValues = [
        { fieldName: TripCheckInMorning, value: null },
        { fieldName: TripCheckInLunch, value: null },
        { fieldName: TripCheckInDepart, value: null },
        { fieldName: TripCheckInLesson, value: null },
        { fieldName: TripCheckInTesting, value: null },
        { fieldName: TripBusNumber, value: null },
        { fieldName: TripBusSeat, value: null },
        { fieldName: TripViolationDate, value: null },
        { fieldName: TripViolationNotes, value: null },
        { fieldName: TripChapNotes, value: null },
        { fieldName: TripInjuryNotes, value: null },
        { fieldName: TripLastUpdateDate, value: null },
        { fieldName: TripTestDate, value: null },
        { fieldName: TripConfirmedLesson, value: null },
        { fieldName: TripBusCaptain, value: null },
        { fieldName: TripConfirmedLesson, value: null },
    ];

    console.log('resetting memberID', memberID);

    FLSCputMemberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            console.log('%s data reset successfully'.format(memberID));
            completion(api, resultCount, outputField);
        },
        function(fieldValues, textStatus) {
            console.log('data reset FAILED ' + textStatus);
            document.getElementById(outputField).innerHTML = 'ERROR: %s. Try again'.format(textStatus);
        }
    );
}

const anyUpdateFilter = "'Status' eq 'Active' and (" + 
    "('TripCheckInMorning' ne '' and 'TripCheckInMorning' ne NULL) or " + 
    "('TripBusNumber' ne ''      and 'TripBusNumber' ne NULL) or " + 
    "('TripBusSeat' ne ''        and 'TripBusSeat' ne NULL) or " + 
    "('TripCheckInLunch' ne ''   and 'TripCheckInLunch' ne NULL) or " + 
    "('TripConfirmedLesson' ne '' and 'TripConfirmedLesson' ne NULL) or " + 
    "('TripCheckInLesson' ne ''  and 'TripCheckInLesson' ne NULL) or " + 
    "('TripCheckInTesting' ne '' and 'TripCheckInTesting' ne NULL) or " + 
    "('TripViolationDate' ne ''  and 'TripViolationDate' ne NULL) or " + 
    "('TripViolationNotes' ne '' and 'TripViolationNotes' ne NULL) or " + 
    "('TripLastUpdateDate' ne '' and 'TripLastUpdateDate' ne NULL) or " + 
    "('TripTestDate' ne ''       and 'TripTestDate' ne NULL) )";
    

function FLSCTripStatus(api, outputField) {
    $.api.apiRequest({
        apiUrl: api.apiUrls.contacts({ '$filter' : anyUpdateFilter }),
        success: function (data, textStatus, jqXhr) {
            var morningCheckIn = 0, lunchCheckIn = 0, lessonCheckIn = 0, testingCheckIn = 0, tested = 0, injuries = 0, violations = 0;
            var contacts = data.Contacts;
            for (var i = 0; i < contacts.length; i++) {
                morningCheckIn += (fieldValue2(contacts[i], TripBusNumber) != '') ? 1 : 0;
                lessonCheckIn += (fieldValue2(contacts[i], TripCheckInLesson) != '') ? 1 : 0;
                lunchCheckIn += (fieldValue2(contacts[i], TripCheckInLunch) != '') ? 1 : 0;
                testingCheckIn += (fieldValue2(contacts[i], TripCheckInTesting) != '') ? 1 : 0;
                tested += (fieldValue2(contacts[i], TripTestDate) != '') ? 1 : 0;
                injuries += (fieldValue2(contacts[i], TripInjuryNotes) != '') ? 1 : 0;
                violations += (fieldValue2(contacts[i], TripViolationDate) != '') ? 1 : 0;
            }
            var html = '<table width="100%"><tr><td>Morning Check In</td><td>%s</td></tr>'.format(morningCheckIn) +
                            '<tr><td>Lesson Check In</td><td>%s</td></tr>'.format(lessonCheckIn) + 
                            '<tr><td>Lunch Check In</td><td>%s</td></tr>'.format(lunchCheckIn) + 
                            '<tr><td>Testing Check In</td><td>%s</td></tr>'.format(testingCheckIn) + 
                            '<tr><td>Tested</td><td>%s</td></tr>'.format(tested) + 
                            '<tr><td>Injuries</td><td>%s</td></tr>'.format(injuries) + 
                            '<tr><td>Violations</td><td>%s</td></tr>'.format(violations) +
                            '</table>';
            document.getElementById(outputField).innerHTML = html;
        },
        error: function (data, textStatus, jqXhr) {
            // ;
        }
    });
}

function FLSCresetTripFieldsAll(api, resultCount, outputField) {
    $.api.apiRequest({
        apiUrl: api.apiUrls.contacts({ '$filter' : anyUpdateFilter,
                                        '$top' : '1'}),

        success: function (data, textStatus, jqXhr) {
            var contacts = data.Contacts;
            if (contacts.length == 0) {
                document.getElementById(outputField).innerHTML = 'no members to reset';
                return;
            }
            
            for (var i = 0; i < contacts.length; i++) {
                var msg = '%s resetting %s, %s<br>'.format(resultCount, contacts[i].LastName, contacts[i].FirstName);

                msg += (fieldValue(contacts[i], TripBusNumber) != '') ? '%s %s<br>'.format(TripBusNumber, fieldValue(contacts[i], TripBusNumber)) : '';
                msg += (fieldValue(contacts[i], TripBusSeat) != '') ? '%s %s<br>'.format(TripBusSeat, fieldValue(contacts[i], TripBusSeat)) : '';
                msg += (fieldValue(contacts[i], TripCheckInLesson) != '') ? '%s %s<br>'.format(TripCheckInLesson, fieldValue(contacts[i], TripCheckInLesson)) : '';
                msg += (fieldValue(contacts[i], TripConfirmedLesson) != '') ? '%s %s<br>'.format(TripConfirmedLesson, fieldValue(contacts[i], TripConfirmedLesson)) : '';
                msg += (fieldValue(contacts[i], TripCheckInLunch) != '') ? '%s %s<br>'.format(TripCheckInLunch, fieldValue(contacts[i], TripCheckInLunch)) : '';
                msg += (fieldValue(contacts[i], TripCheckInTesting) != '') ? '%s %s<br>'.format(TripCheckInTesting, fieldValue(contacts[i], TripCheckInTesting)) : '';
                msg += (fieldValue(contacts[i], TripTestDate) != '') ? '%s %s<br>'.format(TripTestDate, fieldValue(contacts[i], TripTestDate)) : '';
                msg += (fieldValue(contacts[i], TripViolationDate) != '') ? '%s %s<br>'.format(TripViolationDate, fieldValue(contacts[i], TripViolationDate)) : '';
                msg += (fieldValue(contacts[i], TripViolationNotes) != '') ? '%s %s<br>'.format(TripViolationNotes, fieldValue(contacts[i], TripViolationNotes)) : '';
                msg += (fieldValue(contacts[i], TripLastUpdateDate) != '') ? '%s %s<br>'.format(TripLastUpdateDate, fieldValue(contacts[i], TripLastUpdateDate)) : ''; 
                document.getElementById(outputField).innerHTML = msg;

                FLSCresetTripFields(api, contacts[i].Id, FLSCresetTripFieldsAll, ++resultCount, outputField);
            }
        },
        error: function (data, textStatus, jqXhr) {
            document.getElementById(outputField).innerHTML = 'ERROR: %s. Try again'.format(textStatus);
        }
    });
}

var readinessMsg = '';
function FLSCLessonReadiness(event) {
    
    if (event === undefined) {
        readiessMsg += 'WARNING: No event received.';
        return;
    }
    
    if (!event.Name.includes('Student') && !event.Name.includes('Sibling') && !event.Name.includes('Chaperone')) {
        readinessMsg += "WARNING: Event name must contain Student, Sibling, or Chaperone: %s<br>".format(event.Name);
    }

    if (event.Name.includes('Student') || event.Name.includes('Sibling')) {
        var regFields = event.Details.EventRegistrationFields;
        if (regFields === undefined) {
            readinessMsg += "WARNING: Event has no registration fields. %s<br>".format(event.Name);
            return;
        }
        var lessonOptions = null;
        for (var i = 0; i < regFields.length; i++) {
            if (regFields[i].FieldName == "Lesson Options") {
                lessonOptions = regFields[i];
                break;
            }
        }
        if (lessonOptions == null) {
            readinessMsg += 'WARNING: Event has no lessons. %s<br'.format(event.Name);
        } else {
            readinessMsg += "OK: Lesson Options has %s choices for %s<br>".format(lessonOptions.AllowedValues.length-1, event.Name);
            // for (i = 0; i < lessonOptions.AllowedValues.length; i++) {
            //     readinessMsg
            // }    
        }
    }
    
    readinessMsg += "OK: Event %s<br>".format(event.Name);
}

function FLSCTripReadiness(api, tripDate, outputField) {
    readinessMsg = '';

    if ($.todayOverride != undefined) {
        readinessMsg += "WARNING: $.todayOverride is set to %s<br>".format($.todayOverride);
    }

    $.todayOverride = tripDate;

    $.api.apiRequest({
        apiUrl: api.apiUrls.contacts({ '$filter' : anyUpdateFilter}),
        success: function (data, textStatus, jqXhr) {
            if (data.Contacts.length != 0) {
                readinessMsg += "WARNING: Trip data is still set for %s members<br>".format(data.Contacts.length);
                
            } else {
                readinessMsg += "OK: Trip data fields are reset and ready to go.<br>".format(data.Contacts.length);
            }
            document.getElementById(outputField).innerHTML = readinessMsg;

            api.apiRequest({
                apiUrl: api.apiUrls.events(),
                success: function (data, textStatus, jqXhr) {
                    var todaysEvents = [];
                    var today = $.todayOverride || new Date().toJSON().slice(0,10);
                    var events = data.Events;
                    for (var i=0; i < events.length; i++) {
                        var event = events[i];
                        if (event.EndDate.slice(0,10) == today) {
                            if (event.Name.includes('Student')) {
                                todaysEvents.push(event);
                            } else if (event.Name.includes('Sibling')) {
                                todaysEvents.push(event);
                            } else if (event.Name.includes('Chaperone')) {
                                todaysEvents.push(event);
                            } 
                        } 
                    }
                    
                    if (todaysEvents.length != 3) {
                        readinessMsg += 'WARNING: wrong number of events %s. Should be 3.<br>Event list for %s [%s]'.format(todaysEvents.length, $.todayOverride, function() {
                            var eventText = '';
                            for (var j = 0; j<todaysEvents.length; j++) {
                                eventText += '<br>&nbsp;%s:&nbsp;%s'.format(j+1, todaysEvents[j].Name);
                            }
                            return eventText;
                        });
                        readinessMsg += "<br>Done. Refresh the page to run this again.";
                        document.getElementById(outputField).innerHTML = readinessMsg;
                    } else {
                        getCurrentEvent(api, todaysEvents[0].Id, function(event) {
                            FLSCLessonReadiness(event);
                            getCurrentEvent(api, todaysEvents[1].Id, function(event) {
                                FLSCLessonReadiness(event);
                                getCurrentEvent(api, todaysEvents[2].Id, function(event) {
                                    FLSCLessonReadiness(event);
                                    readinessMsg += 'Done<br>';
                                    document.getElementById(outputField).innerHTML = readinessMsg;
                                })
                            });
                        });           
                    }    
                }
            });
        },
        error: function (data, textStatus, jqXhr) {
            readinessMsg += "ERROR: could not query system";
            document.getElementById(outputField).innerHTML = readinessMsg;
        }
    });
}

//retrieves the current registration for the member
function getCurrentEventRegistration(api, memberID, membershipLevel, callback) {
    // get Event Info
    api.apiRequest({
        apiUrl: api.apiUrls.events(),
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
                alert('This is no %s event for today'.format(membershipLevel));
                return;
            }

            // Is this member registered for this event?
            $.todayEvent = todaysEvents[0]; 
            $.eventID = $.todayEvent.Id;            
            var params = {
                contactId: memberID,
                eventId: $.eventID,
            };

            api.apiRequest({
                apiUrl:api.apiUrls.registrations(params),
                success: function (registrations, textStatus, jqXhr) {
                    callback(registrations);
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

//retrieves the current registration for the member
function getCurrentEvent(api, eventID, callback) {
    // get Event Info
    api.apiRequest({
        apiUrl: api.apiUrls.event(eventID),
        success: function (event, textStatus, jqXhr) {
            console.log('event', event);

            callback(event);
        },
        error: function (data, textStatus, jqXhr) {
            callback(undefined);
            //document.getElementById('listResults2').innerHTML = html = 'failed getting search result: ' + textStatus;
        }
    });
}
