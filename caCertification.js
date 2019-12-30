// caCertification.js

class WAObject {
    constructor(Name, Id) {
        this.Name = Name;
        this.Id = Id;
        this.Value = Id;
    }
}

const evalSkiPass = new WAObject('ski', 12469877);
const evalBoardPass = new WAObject('board', 12469878);
const evalSkiFail   = new WAObject('Fail-Ski', 12469879);
const evalBoardFail = new WAObject('Fail-Board', 12469880);
const evalFailTypeOutOfControl = new WAObject('Out of control', 12469432);
const evalFailTypeLeanBack = new WAObject('Sitting/leaning back', 12469433);
const evalFailTypeFlailArms = new WAObject('Flailing arms', 12469430);
const evalFailTypeLiftsSkis = new WAObject('Lifts skis', 12469431);
const evalFailTypeUsePoles = new WAObject('Doesn’t use poles', 12469881);
const evalFailTypeSnowPlow = new WAObject('Snow plow', 12469434);
const evalFailTypeCarveTurns = new WAObject('Doesn’t carve turns', 12469882);
const evalFailTypeLinkTurns = new WAObject('Doesn’t link turns', 12469883);
const evalFailTypeTorsoTurn = new WAObject('Torso turning', 12469884);


const allEvalType = [
    evalSkiPass,
    evalBoardPass,
    evalSkiFail,
    evalBoardFail,
    evalFailTypeOutOfControl,
    evalFailTypeLeanBack,
    evalFailTypeFlailArms,
    evalFailTypeLiftsSkis,
    evalFailTypeUsePoles,
    evalFailTypeSnowPlow,
    evalFailTypeCarveTurns,
    evalFailTypeLinkTurns,
    evalFailTypeTorsoTurn,
];

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

    var settings = [];

    var elements = document.getElementsByName('passFail');
    for (i = 0; i< elements.length; i++) {
        element = elements[i];
        if (element.checked == true) {
            settings.push();
        }

    }
    // 'failtype'

}
