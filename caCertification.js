/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/

// caCertification.js

class WAObject {
    constructor(Label, Id) {
        this.Label = Label;
        this.Id = Id;
    }
}

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

document.addEventListener('DOMContentLoaded', function(){
    $.pageOpen(function(data) {
        var testing = fieldValue(data, 'Proficiency Test Pass?');
        if (testing != undefined) {
            for (var i=0; i < testing.length; i++) {
                test = testing[i];
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

    console.log('values', values);

    var fieldValues = [ 
        { fieldName:ProficiencyField, value: values },   
        { fieldName:TripTestDate, value: FLSCformatDate(new Date()) }
    ];
    
    if (notes != undefined && notes != '') {
        notes = FLSCformatComment(fieldValue($.data, TripChapNotes), notes, $.chapName);
        fieldValues.push({ fieldName: TripChapNotes, value: notes });
    }
    
    FLSCputMemeberData($.api, $.memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Certification saved successfully');
            FLSCwindowBack();
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Update failed. Try again. " + textStatus);
        }
    );
}

function resetCertification() {
    // removes all values from the testing field. Does accept comment if Chap wants to say why they did this.

    var fieldValues = [ 
        { fieldName:ProficiencyField, value: [ ] },
        { fieldName:TripTestDate, value: null },
    ];
    
    if (notes != undefined && notes != '') {
        notes = FLSCformatComment(fieldValue($.data, TripChapNotes), notes, $.chapName);
        fieldValues.push({ fieldName: TripChapNotes, value: notes });
    }
    
    FLSCputMemeberData($.api, $.memberID, fieldValues, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert('Certification reset successfully');
            FLSCwindowBack();
        }, 
        function(fieldValues, textStatus) {
            FLSCwindowAlert("Reset failed. Try again. " + textStatus);
        }
    );

}