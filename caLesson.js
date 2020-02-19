/*
 * Copyright 2019 SpookyGroup LLC. All rights reserved.
 * Code used for change lesson
 *
 *   TripConfirmedLesson:
 *       "LessonName" - user confirmed original selected lesson
 */

class CheckInReady {
    constructor(memberID, eventID, lessonSelected) {
        this.memberID = memberID || false;
        this.eventID = eventID || false;
        this.lessonSelected = lessonSelected || false;
   
        this.ready = function() {
            return this.memberID && this.eventID && this.lessonSelected; // & this.seatSelected & this.rowSelected; // & this.seatChecked & this.eventID ;
        }
    }
}

function enableButton() {
    if ($.CIR.ready()) {
        const saveButton = 'saveButton';
        document.getElementById(saveButton).disabled = false;
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
    
        if ($.lessonOption == 'No') {
            document.getElementById('currentLesson').innerHTML = "Not signed up for a lesson";    
        } else {
            document.getElementById('currentLesson').innerHTML = $.lessonOption;
        }
        if ($.eventID) $.CIR.eventID = true;
        
        enableButton();
    
        // current lesson identified by pageOpen
    
        getCurrentEvent($.api, $.eventID, function(event) {
            // newLesson
            if (event === undefined) {
                alert('Could Not Find Today\'s event.');
                return;
            }
       
            // X - find the list of available lessons
            // ? - keep lesson name and value in dictionary 
            // X - render the available lessons as a radio control
    
            var html = '';
            var eventRegistrationFields = event.Details.EventRegistrationFields;
            for (var i = 0; i < eventRegistrationFields.length; i++) {
                if (eventRegistrationFields[i].FieldName == 'Lesson Options') {
                    $.lessonOptions = eventRegistrationFields[i].AllowedValues; // error for chaps where this is NULL (error on next line)
                    for (var j = 0; j < $.lessonOptions.length; j++) {
                        if ($.lessonOptions[j].Label != null && $.lessonOptions[j].Label != $.lessonOption.replace('ADD ', '').replace('CHG ', '')) {
                            html += radioSelection('newLesson', $.lessonOptions[j].Label, 
                                "$.CIR.lessonSelected = true;enableButton();") + '<br>';
                        }
                    }
                }
            }
            document.getElementById('newLesson').innerHTML = html;
        });
    });
});

function lessonIdfromLabel(lessonLabel) {
    for (var i = 0; i < $.lessonOptions.length; i++) {
        if ($.lessonOptions[i].Label == lessonLabel) {
            return $.lessonOptions[i].Id;
        }
    }
    return -1;
}

function execute() {
    $.spinner.spin(document.body);
    
    // read the radio buttons for the selected 
    var newLessonRadio = document.getElementsByName('newLesson');
    var selectedLessonLabel = '';
    for(var i = 0; i < newLessonRadio.length; i++) { 
        if(newLessonRadio[i].checked) {
            selectedLessonLabel = newLessonRadio[i].value;
            break;
        }
    }

    var selectedLessonId = lessonIdfromLabel(selectedLessonLabel);

    // var lessonInfo = ;
    // if ($.lessonOption == 'No') {
    //     lessonInfo = "%s".format(selectedLessonValue); // ADD 
    // } else {
    //     lessonInfo = "%s".format(selectedLessonValue); // CHG
    // }

    var fieldValues = [ 
        { fieldName:TripConfirmedLesson, value: selectedLessonLabel },
    ];
    
    FLSCputMemberData($.api, $.memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Lesson successfully changed to " + selectedLessonLabel, FLSCwindowBack);                        

            // find the lesson options in the registration -- good code does not work
            // for (var i=0; i< $.registration.RegistrationFields.length; i++) {
            //     if ($.registration.RegistrationFields[i].FieldName == "Lesson Options") {
            //         if ($.registration.RegistrationFields[i].Value == null) {
            //             $.registration.RegistrationFields[i].Value = new WAObject(selectedLessonLabel, selectedLessonId);
            //         } else {
            //             $.registration.RegistrationFields[i].Value.Label = selectedLessonLabel
            //             $.registration.RegistrationFields[i].Value.Id = selectedLessonId;
            //         }
            //         break;
            //     }
            // }

            // if (i == $.registration.RegistrationFields.length) {
            //     var waObject = 
            //     $.registration.RegistrationFields.push(waObject);
            // }
            // fieldValues = [
            //     { fieldName: 'RegistrationFields', value: [{ fieldName: 'Lesson Options', value: $.registration.RegistrationFields }] }
            // ];

            // good code should work, but doesn't
            // fieldValues = [
            //         // { fieldName : 'Organization', value: 'DanTest' },
            //         //{ fieldName: 'RegistrationFields', value: $.registration.RegistrationFields }
            //         { fieldName: 'Lesson Options', value: $.registration.RegistrationFields[i].Value }
            // ];

            // // update the registration
            // $.api.apiRequest({
            //     apiUrl: $.api.apiUrls.registration($.registration.Id),
            //         method: "PUT",
            //         data: { id: $.registration.Id, 
            //                 fieldValues: fieldValues
            //             },
                                    
            //             //                                                         { fieldName: 'RegistrationFields', 
            //             //                                                               value: $.registration.RegistrationFields }
            //             //                                                       ] 
            //             //             }
            //             //         ] 
            //             //   },
            //         success: function(data, textStatus, jqXhr){
            //             console.log('SUCCESS PUT Registration');
            //             FLSCwindowAlert("Lesson successfully changed to " + selectedLessonLabel, FLSCwindowBack);                        
            //         },
            //         error: function(data, textStatus, jqXhr) {
            //             console.log('**FAILURE PUT Registration:' + textStatus);
            //             FLSCwindowAlert("Lesson change not saved " + textStatus + ". Try again.", { });
            //         }
            // });
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Lesson change not saved " + textStatus + ". Try again.", { });
        }
    );
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