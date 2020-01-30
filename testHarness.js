/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* test harness code
*/
function formatFieldID(fieldName, value, Id) {
    return '%s//%s [%s]<br>'.format(fieldName, Id, value);
}
function FLSCdebugData(data) {
    var allFields = '';
    allFields += formatField('DisplayName', data.DisplayName);
    allFields += formatField('Email', data.Email);
    allFields += formatField('FirstName', data.FirstName);
    allFields += formatField('LastName', data.LastName);
    allFields += formatField('Id', data.Id);
    allFields += formatField('IsAccountAdministrator', data.IsAccountAdministrator);
    allFields += formatField('MembershipEnabled', data.MembershipEnabled);
    // allFields += formatField('MembershipLevel.Name', data.MembershipLevel.Name);
    allFields += formatField('ProfileLastUpdated', data.ProfileLastUpdated);
    allFields += formatField('Status', data.Status);
    allFields += formatField('TermsOfUseAccepted', data.TermsOfUseAccepted);
    allFields += formatField('Url', data.Url);
    allFields += '--- Field Values ---<br>';

    for (index = 0; index < data.FieldValues.length; index++) { 
        var o = data.FieldValues[index];
        allFields += formatFieldID(o.FieldName, o.Value, o.SystemCode);
    }
    var testing = fieldValue(data, 'Proficiency Test Pass?');

    return allFields;
}

document.addEventListener("DOMContentLoaded", function() {
    $.pageOpen();
    $.testHarness = true;

    // debug details
    if (document.getElementById("debugData") != undefined && $.urlParam("debug") != undefined) {
        document.getElementById("debugData").innerHTML = FLSCdebugData($.data);
    }    
});

function testFormatComment() {
    var cmt = undefined;    
    cmt = FLSCformatComment(cmt, "this is a new comment", "Dan");
    cmt = FLSCformatComment(cmt, "this is another comment", "Mike");
    cmt = FLSCformatComment(cmt, "third comment", "Tom");
    console.log (cmt);
}

function testAMPM() {
    console.log('should be PM', AMPM(12));
    console.log('should be AM', AMPM(1));
    console.log('should be PM', AMPM(22));
} 

function testDateFormat() {
    console.log('formatted date', FLSCformatDate(new Date()));
}

function testReportBlankViolation() {
    FLSCactionReportViolation($.api, $.memberID, '', 'CHAP NAME');
}

function testReportViolation() {
    FLSCactionReportViolation($.api, $.memberID, 'vaping', 'CHAP NAME');
}

function testChapNote() {
    FLSCactionChapNote($.api, $.memberID, 'it is a nice day', 'CHAP NAME');
}

function resetTripData() {
    if (window.confirm("Do you REALLY want to reset the TRIP fields?")) {
        FLSCresetTripFields($.api, $.memberID);
    }
}
function resetAllTripData() {
    if (window.confirm("Do you REALLY want to reset the TRIP fields?")) {
        FLSCresetTripFieldsAll($.api, 0);
    }
}

function testCheckInAM() {
    FLSCcheckInAM($.api, $.memberID, '1', '15C');
}

function testCheckInLunch() {
    FLSCcheckIn($.api, $.memberID, TripCheckInLunch);
}

function testCheckInDepart() {
    FLSCcheckIn($.api, $.memberID, TripCheckInDepart);
}

function testCheckInLesson() {
    FLSCcheckIn($.api, $.memberID, TripCheckInLesson);
}

function testQuery1() {
    var query = "'Membership status' ne 'Lapsed'";
    query = "'Membership status' ne 'Lapsed' and ('TripViolationDate' ne undefined) and ('TripViolationDate' ne '')";
    CAmemberQuery($.api, query, "'TripViolationDate'", function(data) {
        console.log('callback got', data);
        for (var i = 0; i < data.Contacts.length; i++) {
            var contact = data.Contacts[i];
            console.log(i, contact.DisplayName, contact.Id);
        } 
    });
}

function testPhotoUpload() {
    var result = $.ajax({
        url: memberQR(1234),
        type: "GET",
        dataType: "text",
        cache: false,
        // headers: { "clientId": this.clientId },
        success: function(){
            console.log('success');
        },
        error: function(){
            console.log('error');
        },
        data: data,
        contentType: "text"
    });
    
    
    // $.api.apiRequest({
    //     apiUrl: $.api.apiUrls.picture(photoValue.Id) + '?asBase64=true&fullSize=true',
    //     method: "PUT",
    //     dataType: 'multipart/form-data',
    //     success: function(photoData, textStatus, jqXhr) {
    //         document.getElementById('profilePhoto').src = 'data:image;base64,' + photoData;
    //         //document.getElementById('profilePhoto').addEventListener('click', goMemberHome);
    //     } 
    // });
}

function formatContactFieldData(data) {
    var allowedValues = '';
    if (data.AllowedValues.length > 0) {
        allowedValues = 'AllowedValues<br>';
        for (var i = 0; i < data.AllowedValues.length; i++) {
            var value = data.AllowedValues[i];
            allowedValues += 'Id:(%s) Value:(%s) Label:(%s) <br>'.format(value.Id, value.Value, value.Label);
        }
    }
    return "<tr valign='true'><td>%s </td><td>%s </td><td>Search(%s) </td><td>Type(%s) </td><td>Descr(%s) </td></tr>".format(data.FieldName, allowedValues, data.SupportSearch, data.Type, data.Description);
}

function testContactFields() {

    $.api.apiRequest({
        apiUrl: 'https://foxlaneskiclub.wildapricot.org/sys/api/v2.1/accounts/300928/contactfields', 
        success: function (data, textStatus, jqXhr) {
            console.log('list', data);
            
            var html = '<table>';

            for (var i = 0; i < data.length; i++) {
                html += formatContactFieldData(data[i]);
            }

            html += '</table>';
            document.getElementById('listResults').innerHTML = html;
           

        },
        error: function (data, textStatus, jqXhr) {
            document.getElementById('listResults').innerHTML = html = 'failed getting search result: ' + textStatus;
        }
    });

}

function formatRegistrationFieldData(data) {
    var allowedValues = 'DisplayName:(%s) IsCheckedIn:(%s) RegistrationType:(%s) <br>'.format(data.DisplayName, data.IsCheckedIn, data.RegistrationType.Name);
    
    // data.RegistrationFields[]
    // contains Ski, Board, Race, Terrain
    return "<tr valign='true'><td>%s </td><td>%s</td></tr>".format('Registration', allowedValues);
}




function testEventRegistrations() {
    ///var url = $.api.apiUrls.registrations();

    var todaysEvents = [];

    $.api.apiRequest({
        apiUrl: 'https://foxlaneskiclub.wildapricot.org/sys/api/v2.1/accounts/300928/events', 
        success: function (data, textStatus, jqXhr) {
            console.log('list', data);

            var today = $.todayOverride || new Date().toJSON().slice(0,10);
            var events = data.Events;
            for (i=0; i < events.length; i++) {
                var event = events[i];
                if (event.EndDate.slice(0,10) == today) {
                    console.log('found today event', event);
                    todaysEvents.push(event);
                }
            }

            // look for 

        },
        error: function (data, textStatus, jqXhr) {
            document.getElementById('listResults2').innerHTML = html = 'failed getting search result: ' + textStatus;
        }
    });

    getCurrentEvent($.api, 3708452, function(event) {
        console.log('event', event);
    });

    $.api.apiRequest({
        apiUrl: 'https://foxlaneskiclub.wildapricot.org/sys/api/v2.1/accounts/300928/events/%s'.format(3708452), 
        // apiUrl: 'https://foxlaneskiclub.wildapricot.org/sys/api/v2.1/accounts/300928/eventregistrations?eventId=%s&contactId=%s'.format(3708452, $.memberID), 
        success: function (data, textStatus, jqXhr) {
            console.log('list', data);
            
            var html = '<table>';

            for (var i = 0; i < data.length; i++) {
                html += formatRegistrationFieldData(data[i]);
            }

            html += '</table>';
            document.getElementById('listResults2').innerHTML = html;
           

        },
        error: function (data, textStatus, jqXhr) {
            document.getElementById('listResults2').innerHTML = html = 'failed getting search result: ' + textStatus;
        }
    });
}

//function test

var tests = [
    testFormatComment,
    testAMPM,
    testDateFormat,
    // testQuery1,
    testContactFields,
    testEventRegistrations
    /* testReportBlankViolation,
    testReportViolation,
    testCheckInAM,
    testCheckInLesson,
    testCheckInLunch,
    testCheckInDepart,
    testChapNote
    */
];

function test() {
    for (i = 0; i < tests.length; i++) {
        console.log(tests[i].name, '---------------------------');
        tests[i]();
    }

    // show after data
    var memberURL=$.api.apiUrls.contact($.memberID) + "?getExtendedMembershipInfo=true"; 
    $.api.apiRequest({
        apiUrl: memberURL,
        success: function (data, textStatus, jqXhr) {
            document.getElementById("debugData2").innerHTML = FLSCdebugData(data);
        },
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('ERROR:', textStatus, errorThrown);
            document.getElementById("debugData2").innerHTML = "Unknown memberID [" + $.memberID + "]";
        }
    });
}

