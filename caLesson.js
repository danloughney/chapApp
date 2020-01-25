/*
 * Copyright 2019 SpookyGroup LLC. All rights reserved.
 * Code used for change lesson
 *
 *   TripConfirmedLesson:
 *       "LessonName" - user confirmed original selected lesson
 *       "ADD LessonName" - user did not register for a lesson, but added it at the morning check-in
 *       "CHG LessonName ORIG OriginalLessonName" - user changed lesson from OriginalLessonName to LessonName
 *
 */

class CheckInReady {
    constructor(memberID, eventID, lessonSelected) {
        this.memberID = memberID || false;
        this.eventID = eventID || false;
        this.lessonSelected = lessonSelected || false;
   
        this.ready = function() {
            return this.memberID & this.memberChecked; // & this.seatSelected & this.rowSelected; // & this.seatChecked & this.eventID ;
        }
    }
}

function enableButton() {
    if ($.CIR.ready()) {
        const saveButton = 'saveButton';
        document.getElementById().disabled = false;
        document.getElementById(saveButton).className = "btn";
        console.log('button enabled');
        return;
    }
    console.log('button NOT enabled');
}


document.addEventListener('DOMContentLoaded', function(){
    
    $.pageOpen(function(member) {
        $.CIR = new CheckInReady();
        if ($.memberID) $.CIR.memberID = true;
    
        document.getElementById('currentLesson').innerHTML = $.lessonOption;
        if ($.eventID) $.CIR.eventID = true;
        
        enableButton();
    
        // current lesson identified by pageOpen
    
        getCurrentEvent($.api, $.eventID, function(event) {
            // newLesson
            if (event === undefined) {
                alert('Could Not Find Today\'s event.');
                return;
            }
       
            // find the list of available lessons
            // keep lesson name and value in dictionary 
            // render the available lessons as a radio control
    
            var html = '';
            var eventRegistrationFields = event.Details.EventRegistrationFields;
            for (var i = 0; i < eventRegistrationFields.length; i++) {
                if (eventRegistrationFields[i].FieldName == 'Lesson Options') {
                    lessonOptions = eventRegistrationFields[i].AllowedValues;
                    for (var j = 0; j < lessonOptions.length; j++) {
                        if (lessonOptions[j].Label != null && lessonOptions[j].Label != $.lessonOption) {
                            //onchange ISN'T working
                            html += radioSelection('newLesson', lessonOptions[j].Label, function() {
                                $CIR.lessonSelected = true;
                                enableButton();
                            }) + '<br>';
                        }
                    }
                }
            }
            document.getElementById('newLesson').innerHTML = html;
        });
    });
});

function execute() {
    // read the radio buttons for the selected 
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