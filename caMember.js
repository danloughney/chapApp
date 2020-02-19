/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* main member administration page
*/

document.addEventListener("DOMContentLoaded", function() {
    $.pageOpen(function(contact) {
        if (fieldValue2($.data, fieldCellPhone) == '') {
            disableButton('callMember');
            disableButton('txtMember');
        }

        if (contact.MembershipLevel.Name == 'Chaperone') {
            disableButton('lunchButton');
            disableButton('testingButton');
            disableButton('evaluationButton');
            disableButton('changeLessonButton');
            disableButton('checkinLessonButton');
        }

        document.getElementById('timestamps').innerHTML = 
            formatTableRow(contact, 'Morning', TripCheckInMorning) + 
            formatTableRow(contact, 'Lesson', TripCheckInLesson) +
            formatTableRow(contact, 'Lunch', TripCheckInLunch) +
            formatTableRow(contact, 'Testing', TripCheckInTesting) +
            formatTableRow(contact, 'Notes', TripChapNotes) + 
            formatTableRow(contact, 'Injuries', TripInjuryNotes) +
            formatTableRow(contact, 'Violations', TripViolationNotes);
    });
});


function txt(numberType) {
    switch(numberType) {
        case 'mobile':
            FLSCsms(fieldValue($.data, fieldCellPhone));
            break;
    }
    return false;
}

function call(numberType) {
    switch(numberType) {
        case 'mobile':
            FLSCcall(fieldValue($.data, fieldCellPhone));
            break;
    }
    return false;
}

function txtQR() {
    FLSCsms(fieldValue($.data, fieldCellPhone), 'Tap here to open your FLSC page. https://foxlaneskiclub.wildapricot.org/me');
    return false;
}

function email(address) {

}