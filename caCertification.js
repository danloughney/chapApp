/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/

// caCertification.js

const evalFields = {
    '12469877' : 'ski', 
    '12469878' : 'board',
    '12469879' : 'Fail-Ski',
    '12469880' : 'Fail-Board',
    '12469432' : 'Out of control',
    '12469433' : 'Sitting/leaning back',
    '12469430' : 'Flailing arms',
    '12469431' : 'Lifts skis',
    '12469881' : 'Doesn’t use poles',
    '12469434' : 'Snow plow',
    '12469882' : 'Doesn’t carve turns',
    '12469883' : 'Doesn’t link turns',
    '12469884' : 'Torso turning',
};

const failOptions = [
    '12469432',
    '12469433',
    '12469430',
    '12469431',
    '12469881',
    '12469434',
    '12469882',
    '12469883',
    '12469884',
];

function enableFailOptions(enable) {
    for (var i = 0; i < failOptions.length; i++) {
        var cell = document.getElementById(failOptions[i]);
        if (enable) {
            cell.disabled = false;
        } else {
            cell.checked = false;
            cell.disabled = true;
        }
    }
}

document.addEventListener('DOMContentLoaded', function(){
    $.pageOpen(function(data) {
        var testing = fieldValue(data, 'Proficiency Test Pass?');
        if (testing != undefined) {
            for (var i=0; i < testing.length; i++) {
                test = testing[i];
                switch(test.Id) {
                    case 12469877:  
                    case 12469878:
                        enableFailOptions(false);
                        break;

                    case 12469879: 
                    case 12469880: 
                        enableFailOptions(true);
                        break;
                }
                var cell = document.getElementById(test.Id);
                cell.checked = true;
            }
        }
    });
});

function saveForm() {
    var i = 0;

    var values = [];

    var elements = document.getElementsByName('passFail');
    for (i = 0; i< elements.length; i++) {
        element = elements[i];
        if (element.checked == true) {
            values.push(new WAObject(evalFields[element.id], parseInt(element.id, 10)));
        }
    }
    
    elements = document.getElementsByName('failType');
    for (i = 0; i< elements.length; i++) {
        element = elements[i];
        if (element.checked == true) {
            values.push(new WAObject(evalFields[element.id], parseInt(element.id, 10)));
        }
    }

    var fieldValues = [ 
        { fieldName:ProficiencyField, value: values },   
        { fieldName:TripTestDate, value: ($.todayOverride || FLSCformatDate(new Date())) }
    ];
    
    var notes = document.getElementById("notes").value;
    if (notes != undefined && notes != '') {
        notes = FLSCformatComment(fieldValue($.data, TripTestingNotes), notes, $.chapName);
        fieldValues.push({ fieldName: TripTestingNotes, value: notes });
    }
    
    FLSCputMemberData($.api, $.memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Certification saved successfully', FLSCwindowBack);
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Update failed. Try again. " + textStatus);
        }
    );
}

function resetCertification() {
    // removes all values from the testing field. Does accept comment if Chap wants to say why they did this.

    if (!confirm("WARNING: This will REMOVE all testing info for %s. Do you want to continue?".format(FLSCformatMemberName($.data)))) {
        return;
    }

    var fieldValues = [ 
        { fieldName:ProficiencyField, value: [ ] },
        { fieldName:TripTestingNotes, value: null },
        { fieldName:TripTestDate, value: null },
    ];
        
    FLSCputMemberData($.api, $.memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Certification reset successfully', FLSCwindowBack);
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Reset failed. Try again. " + textStatus);
        }
    );
}

