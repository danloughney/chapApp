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

function testPhotoUpload() {
    var el = document.getElementById('qrcode');
    el.innerHTML = '<center><img id="qrImage" src="%s" height="160" width="160"></center>'.format(memberQR(12345));
    el = document.getElementById('qrImage');

    // var ctx = el.getContext("2d");
    // var imgData = ctx.getImageData(0, 0, 160, 160);

    var clientId = "8jc86buyhc";
    var result = $.ajax({
        // url: memberQR(1234),
        url: "https://chart.googleapis.com/chart?cht=qr&chs=160x160&chl=1234",
        type: "GET",
        dataType: " text",
        cache: false,
        
        // headers: { "clientId": clientId,
        //     'Access-Control-Allow-Headers' : '*'},

        success: function(){
            console.log('success');
        },
        
        error: function (jqXHR, textStatus, errorThrown) {
            console.log('error', textStatus, 'errorThrown', errorThrown);
        },
        //data: data,
        contentType: "application/json"
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

