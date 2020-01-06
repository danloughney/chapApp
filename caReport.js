/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* code used for reporting violations
*/

function typeToName(fieldType) {
    for (var key in pageTripMap) {
        if (pageTripMap[key] == fieldType) {
            return key;
        }
    }
    return fieldType;
}

function radioControl(name) {
    return radioSelection(name, 'Late to Morning Bus') +
        radioSelection(name, 'Late to Lunch') +
        radioSelection(name, 'Late to Depart') +
        radioSelection(name, 'Missing Badge') +
        radioSelection(name, 'Missed Lesson') +
        radioSelection(name, 'Reckless Skiing') +
        radioSelection(name, 'Smoking') +
        radioSelection(name, 'Vaping') + 
        radioSelection(name, 'Alcohol');
}

document.addEventListener('DOMContentLoaded', function(){

    $.reportType = $.urlParam('type');    
    $.reportName = typeToName($.reportType);

    document.getElementById('reportLabel').innerHTML = 'Report ' + $.reportName;
    var element;

    switch($.reportType) {
        case TripViolationNotes:
            document.getElementById('submitButton').className = 'btnRed';
            document.getElementById('notesLabel').innerHTML = 'Violation';
            document.getElementById('options').innerHTML = radioControl('violationRadio');
            break;
            
        case TripInjuryNotes:
            document.getElementById('submitButton').className = 'btnRed';
            document.getElementById('notesLabel').innerHTML = 'Injury';
            element = document.getElementById('options');
            element.parentNode.removeChild(element);
            break;

        default:
            document.getElementById('submitButton').className = 'btn';
            element = document.getElementById('options');
            element = element.parentNode.removeChild(element);
            break;
    }
    
    $.pageOpen(function(data) {
        var currentNote = fieldValue(data, $.reportType);
        if (currentNote != undefined && currentNote != '') {
            document.getElementById('currentNote').innerHTML = currentNote;
        } else {
            element = document.getElementById('currentNoteFieldset');
            element.parentNode.removeChild(element);
        }
    });
});


function saveText() {
    var text = document.getElementById('notesTextArea').value;
    var options = document.getElementsByName('violationRadio');
    if (options != undefined) {
        for(var i = 0; i < options.length; i++) { 
            if(options[i].checked) {
                text = '%s... %s'.format(options[i].value, text);
            }
        }
    }

    if (text == undefined || text == '') {
        FLSCwindowAlert("You didn't enter any information.");
        return;
    }

    if (confirm('Ready to submit this %s?'.format($.reportName))) {
        FLSCactionReportNote($.api, $.memberID, text, $.reportType, $.reportName);
    }
}

