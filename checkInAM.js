/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* code used for AM check-in
*/

class CheckInReady {
    constructor(memberID, eventID, seatChecked, memberChecked, busSelected, seatSelected, rowSelected, lessonSelected) {
        this.memberID = memberID || false;
        this.eventID = eventID || false;
        this.seatChecked = seatChecked || false;
        this.memberChecked = memberChecked || false;
        this.seatSelected = seatSelected || false;
        this.rowSelected = rowSelected || false;
        this.busSelected = busSelected || false;
        this.lessonSelected = lessonSelected || false;
   
        this.ready = function() {
            return this.memberID & this.memberChecked; // & this.seatSelected & this.rowSelected; // & this.seatChecked & this.eventID ;
        }
    }
}
function enableButton() {
    if ($.CIR.ready()) {
        document.getElementById("checkInButton").disabled = false;
        document.getElementById("checkInButton").className = "btn";
        console.log('button enabled');
        return;
    }
    console.log('button NOT enabled');
}


function openCallback(memberData) {
    $.CIR = new CheckInReady();
    if ($.memberID) $.CIR.memberID = true;

    if ($.eventID) $.CIR.eventID = true;
    
    enableButton();

    // check if member is checked in
    FLSChasCheckedIn($.api, $.memberID, $.checkInType, function(checkedIn) {
        if (!checkedIn) {
            $.CIR.memberChecked = true;
        } else {
            alert("WARNING: %s %s is ALREADY checked in for %s.".format($.data.FirstName, $.data.LastName, $.checkInType));
            $.CIR.memberChecked = true;
        }
        enableButton();
    });
}

document.addEventListener('DOMContentLoaded', function(){
    $.checkInType = $.urlParam('type');
    document.getElementById('checkInLabel').innerHTML = $.checkInType + ' Check In';
    
    $.pageOpen(openCallback);

    var busNumber = getCookie('busNumber') || '1';
    if (busNumber == '') busNumber = '1';

    var cell = document.getElementById('busNumber'+busNumber);
    cell.checked = true;

    var row = getCookie('row') || '1';
    cell = document.getElementById('row').value = row;

    var seat = getCookie('seat') || 'A';
    cell = document.getElementById('seat%s'.format(seat)).checked = true;
});

function executeCheckIn() {
    var busNumber = document.querySelector('input[name="busNumber"]:checked').value;
    setCookie('busNumber', busNumber, 1);

    var row = document.getElementById("row").value;
    row = row.padStart(2, '0');
    setCookie('row', row, 1);

    var seat = "1";
    var seatElements = document.getElementsByName('seat');
    for(var i = 0; i < seatElements.length; i++) { 
        if(seatElements[i].checked) {
            seat = seatElements[i].value;
        }
    }
    setCookie('seat', seat, 1);
    
    var seatNumber = row + seat;
    checkInAM(busNumber, seatNumber, $.lessonOption, document.getElementById("notes").value);
}

function checkInAM (busNumber, seatNumber, lessonOption, notes) {
    // check if seat is already checked in
    FLSCisSeatAlreadyTaken($.api, busNumber, seatNumber, function(data) {
        if (data.Contacts.length != 0) {
            // seat is taken
            var seatTaker = data.Contacts[0];
            if (!confirm("WARNING: %s is ALREADY in Seat %s on Bus %s. Do you want to continue?".format(FLSCformatMemberName(seatTaker), seatNumber, busNumber))) {
                return;
            }
        }

        FLSChasCheckedIn($.api, $.memberID, pageCheckInAM, function(rc) {
            switch(rc) {
                case 1:
                    if (confirm("WARNING: %s %s is ALREADY checked in for %s. Do you want to check in AGAIN?".format($.data.FirstName, $.data.LastName, $.checkInType))) {
                        FLSCcheckInAM($.api, $.memberID, busNumber, seatNumber, lessonOption, notes); 
                        WAcheckInTrip($.api, $.memberID, $.eventID);
                    }
                    break;
                case 0:
                    if (confirm("Do you want to check in %s %s in Seat %s on Bus %s?".format($.data.FirstName, $.data.LastName, seatNumber, busNumber))) {
                        FLSCcheckInAM($.api, $.memberID, busNumber, seatNumber, lessonOption, notes);
                        WAcheckInTrip($.api, $.memberID, $.eventID);
                    }
                    break;
                case -1:
                    alert("Invalid MemberID " + FLSCformatMemberName($.data));
                    break;
            }
        });    
    });
}

function changeRow(difference) {
    var row = document.getElementById('row').value;

    switch(difference) {
        case 1:
            if (row == maxRowsPerBus) {
                console.log('more than max rows');
                return;
            }
            break;

        case -1:
            if (row == 1) {
                console.log('less than 0');
                return;
            }
            break;

        default:
            console.log('invalid value');
            return;
    }
    var newRow = parseInt(row) + parseInt(difference);
    document.getElementById('row').value = newRow.toString().padStart(2, '0');
}