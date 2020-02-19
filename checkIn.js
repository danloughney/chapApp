/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* code used for general check-in
*/


document.addEventListener('DOMContentLoaded', function(){
    $.checkInType = $.urlParam('type');
    document.getElementById('checkInLabel').innerHTML = $.checkInType + ' Check In';

    $.pageOpen();
});

function executeCheckIn() {
    checkIn($.checkInType, document.getElementById("notes").value, undefined);
}

function checkIn(checkInType, notes) {
    FLSChasCheckedIn($.api, $.memberID, checkInType, function(rc) {
        switch(rc) {
            case 1:
                if (confirm("WARNING: %s %s is ALREADY checked in for %s. Do you want to check in AGAIN?".format($.data.FirstName, $.data.LastName, $.checkInType))) {
                    $.spinner.spin(document.body);
                    disableButton('checkInButton');
                    FLSCcheckIn($.api, $.memberID, checkInType, notes);
                }
                break;
            case 0:
                // don't prompt to confirm check in
                $.spinner.spin(document.body);
                disableButton('checkInButton');
                FLSCcheckIn($.api, $.memberID, checkInType, notes);
                break;
            case -1:
                alert("Invalid MemberID " + FLSCformatMemberName($.data));
                break;
        }
    });
}


