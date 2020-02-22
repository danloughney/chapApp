/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* test harness code
*/

document.addEventListener("DOMContentLoaded", function() {
    $.api = new WApublicApi(FLSCclientID);
    $.memberID = $.urlParam("ID");
    
    $.when($.api.init()).done(function(){
        // alert('ready');
        document.getElementById('tripDate').value = $.todayOverride || new Date().toJSON().slice(0,10);
    });
});

function tripReadiness(tripDate) {
    document.getElementById('outputLegend').innerHTML = "Readiness";
    document.getElementById('outputText').innerHTML = 'Please wait...';
    FLSCTripReadiness($.api, tripDate, 'outputText');

    document.getElementById('tripReadinessBtn').disabled = true;
    document.getElementById('tripReadinessBtn').className = "btnInactive";
}

function tripStatus() {
    document.getElementById('outputLegend').innerHTML = "Trip Status";
    document.getElementById('outputText').innerHTML = 'Please wait...';
    FLSCTripStatus($.api, 'outputText');
}

function resetAllTripData() {
    if (window.confirm("Do you REALLY want to reset the \"Trip\" fields?")) {
        document.getElementById('outputLegend').innerHTML = "Reset Trip Fields";
        document.getElementById('outputText').innerHTML = "Please wait...";
        FLSCresetTripFieldsAll($.api, 1, 'outputText');
    }
}

function generateScript(script) {
    var params = { 
        '$filter' : "'Status' eq 'Active'",
    };

    var html = '';
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts(params),
        success: function (data, textStatus, jqXhr) {
            console.log('result', data);
            
            var contacts = data.Contacts;

            for (var i = 0;i<contacts.length; i++) {
                html += script.format(contacts[i].Id) + '<br>';
            }
            
            document.getElementById('output').innerHTML = html;
         },
         error: function(data, textStatus, jqXhr){
            console.log("member not found");
        }
    });
}

function generateQRScript() {
    generateScript('python downloadQR.py %s');
}

function generateUploadScript() {
    generateScript('curl -H "Authorization: OAuth Q1MNKW3m2xaesJXHmYqTe08Xrlw-" -X POST "https://foxlaneskiclub.wildapricot.org/sys/api/v2.2/accounts/300928/pictures" -H "accept: application/json" -H "Content-Type: multipart/form-data" -F "picture0=@qrCodes/%s.jpg;type=image/jpeg"');
}

function changedLessonReport() {
    window.location.href='/caList?name=Lesson Changes';
}


const sortAudits = function(a, b) {
    if (a == undefined && b != undefined) {
        return -1;
    } 
    if (a != undefined && b == undefined) { 
        return 1;
    }
    if (a == undefined && b == undefined) {
        return 0;
    }

    var x = a.ts;
    var y = b.ts;
    return x < y ? -1 : x > y ? 1 : 0;
};

function tripAudit() {
    document.getElementById('outputLegend').innerHTML = "Audit";
    document.getElementById('outputText').innerHTML = 'Please wait...';

    var events = [
        TripCheckInMorning,
        TripCheckInLunch,
        TripCheckInLesson,
        TripCheckInTesting,
        TripChapNotes,
        TripInjuryNotes,
        TripViolationNotes
    ];

    var auditLog = [];

    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts({ '$filter' : "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL AND 'TripCheckInMorning' ne '')" }),
        success: function (data, textStatus, jqXhr) {
            document.getElementById('outputText').innerHTML = 'Got data...';

            for (var i = 0; i < data.Contacts.length; i++) {
                for (var j = 0; j < events.length; j++) {
                    var ts = fieldValue(data.Contacts[i], events[j]);
                    var bus = fieldValue(data.Contacts[i], TripBusNumber);
                    if (ts != undefined && ts != '') {                        
                        var comments = parseComments(events[j], fieldValue(data.Contacts[i], events[j]));
                        for (var k = 0; k < comments.length; k++) {

                            comments[k].memberName = data.Contacts[i].LastName + ', ' + data.Contacts[i].FirstName
                            comments[k].bus = bus;
                            auditLog.push(comments[k]);
                        }
                    }
                }
            }

            auditLog = auditLog.sort(sortAudits);

            var html = '<table width="100%">';
            const style='style="font-size: 95%;border: 1px solid black; border-collapse: collapse;"';

            for (i = 0; i < auditLog.length; i++) {
                if (i == 0) {
                    html += auditLog[i].header();
                }
                html += auditLog[i].html();
            }
            html += '</table>';  
            html = html.replace(/<table /g, '<table %s'.format(style))
                        .replace(/<th/g, '<th %s'.format(style))
                        .replace(/<td/g, '<td %s'.format(style));

            document.getElementById('outputText').innerHTML = html;

        },
        error: function (data, textStatus, jqXhr) {
            alert('audit query failed');
        }
    });
}
