/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/
 
// all FLSC custom field names
const TripCheckInMorning = "TripCheckInMorning";
const TripBusNumber = "TripBusNumber";
const TripBusSeat = "TripBusSeat";
const TripCheckInLunch = "TripCheckInLunch";
const TripCheckInDepart = "TripCheckInDepart";
const TripCheckInLesson = "TripCheckInLesson";
const TripCheckInTesting = "TripCheckInTesting";
const TripCertificationNotes = "TripCertificationNotes"; // ??
const TripChapNotes = "TripChapNotes";
const TripViolationDate = "TripViolationDate";
const TripViolationNotes = "TripViolationNotes";
const TripInjuryNotes = "First Aid Notes";
const TripLastUpdateDate  = "TripLastUpdateDate";
const TripDetentionFlag = 'Detention?';
const TripDetentionNotes = 'Detention Explanation';
const ProficiencyField = 'Proficiency Test Pass?'; 
const TripTestDate = 'TripTestDate';

const fieldCellPhone = "Cell Phone";
const detentionRequired = 12555903;

// page/actions
const pageCheckInAM = 'AM';         // morning check-in
const pageLesson = 'Lesson';        // check-in at lesson
const pageLunch = 'Lunch';          // mandatory lunch check-in
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


$.nextPage = function(pageType) {
    var nextPage = '';

    switch(pageType) {
        case pageCheckInAM:
            nextPage = '%s/morningCheckIn?ID=%s&type=%s'.format(clubBaseURL, $.data.Id, pageType);
            break;

        // check in for lunch, lesson, testing, etc.
        case pageLunch:
        case pageLesson:
        case pageDepart:
        case pageTesting:
            nextPage = '%s/checkIn?ID=%s&type=%s'.format(clubBaseURL, $.data.Id, pageType);
            break;

        case pageCertification://doesn't exist yet
            nextPage = '%s/testingEval?ID=%s&type=%s'.format(clubBaseURL, $.data.Id, pageType);
            break;
         
        case pageFirstAid:
        case pageViolation:
        case pageNotes:
            nextPage = '%s/reportEvent?ID=%s&type=%s'.format(clubBaseURL, $.data.Id, pageTripMap[pageType]);                
            break;

        default:
            window.alert("Choose a correct pageType");
    }
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
            console.log('got chap info');
        }
    });
}

$.pageOpen = function(callback) {
    // render the initial page with all selected member data
    
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
                
                if (callback) {
                    callback(data);
                }

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

                var profilePhotoBackground = document.getElementById('photoBackground')
                if (profilePhotoBackground) {
                    profilePhotoBackground.style = memberStatusBackgroundStyle(memberStatus);
                }

                var profilePhotoCell = document.getElementById("profilePhoto");
                if (profilePhotoCell) {
                    var photoValue = fieldValue(data, FLSCphoto);
                    if (photoValue) {
                        $.api.apiRequest({
                            apiUrl: $.api.apiUrls.picture(photoValue.Id) + '?asBase64=true&fullSize=true',
                            method: "GET",
                            dataType: "text",
                            success: function(photoData, textStatus, jqXhr) {
                                document.getElementById('profilePhoto').src = 'data:image;base64,' + photoData;
                                //document.getElementById('profilePhoto').addEventListener('click', goMemberHome);
                            } 
                        });       
                    }
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                document.getElementById("memberName").innerHTML = "Unknown memberID [" + $.memberID + "]";
            }
        });
        return false;
    });
}

function FLSCputMemeberData(api, memberID, fieldValues, fSuccess, fError) {
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
                        console.log('SUCCESS PUT member: ' + memberID, fieldValues);
                        fSuccess(fieldValues, textStatus)
                    },
                    error: function(data, textStatus, jqXhr){
                        console.log('**FAILURE PUT member: ' + memberID, fieldValues);
                        fError(fieldValues, textStatus)
                    }
            });
            
         },
         error: function(data, textStatus, jqXhr) {
            console.log('**MEMBER NOT FOUND: ' + memberID, fieldValues);
            fError(fieldValues)
        }
    });
}


function FLSCcheckInAM(api, memberID, busNumber, busSeat, notes) {
    var fieldValues = [ 
        { fieldName:TripCheckInMorning, value: FLSCformatDate(new Date()) },
        { fieldName:TripBusNumber, value: busNumber },
        { fieldName:TripBusSeat, value: busSeat }
    ];

    if (notes != undefined && notes != '') {
        notes = FLSCformatComment(fieldValue($.data, TripChapNotes), notes, $.chapName);
        fieldValues.push({ fieldName: TripChapNotes, value: notes });
    }

    FLSCputMemeberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Check in successful. Bus ' + busNumber + ' Seat ' + busSeat);
            FLSCwindowBack();
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Failed to update contact. See console for details " + textStatus);
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

    FLSCputMemeberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Check in ' + checkInType + ' successful');
            FLSCwindowBack();
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Check in for ' + checkInType + ' FAILED. Try again. ' + textStatus);
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
    
    FLSCputMemeberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('%s reported'.format(reportName));
            FLSCwindowBack();
        },
        function(fieldValues, textStatus) {
            FLSCwindowAlert('%s report failed (%s). Try again'.format(reportType, textStatus));
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

    FLSCputMemeberData(api, memberID, fieldValues, 
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

function FLSCresetTripFields(api, memberID, completion) {
    var fieldValues = [
        { fieldName: TripCheckInMorning, value: undefined },
        { fieldName: TripCheckInLunch, value: undefined },
        { fieldName: TripCheckInDepart, value: undefined },
        { fieldName: TripCheckInLesson, value: undefined },
        { fieldName: TripCheckInTesting, value: undefined },
        { fieldName: TripBusNumber, value: undefined },
        { fieldName: TripBusSeat, value: undefined },
        { fieldName: TripViolationDate, value: undefined },
        { fieldName: TripViolationNotes, value: undefined },
        { fieldName: TripChapNotes, value: undefined },
        { fieldName: TripInjuryNotes, value: undefined },
        { fieldName: TripLastUpdateDate, value: undefined }
    ];

    console.log('resetting memberID', memberID);

    FLSCputMemeberData(api, memberID, fieldValues, 
        function(fieldValues, textStatus) {
            console.log('data reset successfully');
        },
        function(fieldValues, textStatus) {
            console.log('data reset FAILED ' + textStatus);
        }
    );
}

function FLSCresetTripFieldsAll(api, resultCount) {
    $.api.apiRequest({
        apiUrl: api.apiUrls.contacts({ '$filter' : "'Status' eq 'Active' and 'TripCheckInMorning' ne NULL",
                                        '$top' : '1'}),

        success: function (data, textStatus, jqXhr) {
            var contacts = data.Contacts;
            
            for (var i = 0; i < contacts.length; i++) {
                console.log('resetting', resultCount);
                FLSCresetTripFields(api, contacts[i].Id);
                FLSCresetTripFieldsAll(api, ++resultCount);
            }
        },
        error: function (data, textStatus, jqXhr) {
            ;
        }
    });
}

//retrieves the current registration for the member
function getCurrentEvent(api, memberID, membershipLevel, callback) {
    // get Event Info
    api.apiRequest({
        apiUrl: api.apiUrls.events(),
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
                alert('This is no %s event for today'.format(membershipLevel));
                return;
            }

            // Is this member registered for this event?
            $.eventID = todaysEvents[0].Id;            
            var params = {
                contactId: memberID,
                eventId: $.eventID,
            };

            api.apiRequest({
                apiUrl:api.apiUrls.registrations(params),
                success: function (data, textStatus, jqXhr) {
                    callback(data);
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
