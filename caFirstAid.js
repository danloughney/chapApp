// caFirstAid


const parent1name = 'Parent/Guardian "1" Name';
const parent1mobile = 'Parent/Guardian "1" Cell Phone';
const parent1email = 'Parent/Guardian "1" Email';
const parent2name = 'Parent/Guardian "2" Name';
const parent2mobile = 'Parent/Guardian "2" Cell Phone'
const parent2email = 'Parent/Guardian "2" Email';
const allergyInfo  = 'Allergies/Special Instructions';
const parentPermission = 'Parent/Guardian Permission';

const homeAddress = 'Home Address - Street';
const homeTown = 'Town';
const homeZip = 'Zip Code';

function contactHTML(data, fieldName, label) {
    var contact = fieldValue(data, fieldName);
    if (contact) {
        var onClick = '';
        switch(label) {
            case 'Send Text':
                onClick = 'FLSCsms(\'%s\');'.format(contact);
                break;

            case 'Call Mobile':
                onClick = 'FLSCcall(\'%s\');'.format(contact);
                break;

            case 'Email':
                onClick = 'FLSCemail(\'%s\');'.format(contact);
                break;

            default:
                window.alert('invalid call type' + label);
                break;

        }
        return '<p align="center"><button class="btn" onclick="%s">%s</button></p>'.format(onClick, label);
    }
    return '';
}

document.addEventListener("DOMContentLoaded", function() {
    $.pageOpen(function(data) {
        
        document.getElementById('parentInfo').innerHTML = '%s%s<br>%s<br>%s, NY %s'.format(
            fieldValue(data, parent1name),
            fieldValue(data, parent2name) ? ', %s'.format(fieldValue(data, parent2name)) : '',
            fieldValue(data, homeAddress),
            fieldValue(data, homeTown),
            fieldValue(data, homeZip)
        );

        var allergy = fieldValue(data, allergyInfo);
        if (allergy) {
            document.getElementById('allergyInfo').innerHTML = '<label class="labelBad">Allergies!<br>%s</label>'.format(allergy);
        } else {
            document.getElementById('allergyInfo').innerHTML = 'No allergies noted';
        }

        document.getElementById('parent1Name').innerHTML = "Contact %s".format(fieldValue(data, parent1name));
        document.getElementById('parent1Contacts').innerHTML = '%s%s&nbsp;'.format(
            contactHTML(data, parent1mobile, 'Call Mobile'),
            contactHTML(data, parent1mobile, 'Send Text')
            // contactHTML(data, parent1email, 'Email')
        );

        document.getElementById('parent2Name').innerHTML = "Contact %s".format(fieldValue(data, parent2name));
        document.getElementById('parent2Contacts').innerHTML = '%s%s&nbsp;'.format(
            contactHTML(data, parent2mobile, 'Call Mobile'),
            contactHTML(data, parent2mobile, 'Send Text')
            // contactHTML(data, parent2email, 'Email')
        );

        var value = fieldValue(data, TripInjuryNotes);
        document.getElementById('injuryLabel').innerHTML = (value == '' || value == undefined) ? 'No injuries reported' : value;

        value = fieldValue(data, TripChapNotes);
        document.getElementById('notesLabel').innerHTML = (value == '' || value == undefined) ? 'No notes' : value;
        
        value = fieldValue(data, TripViolationNotes);
        document.getElementById('violationLabel').innerHTML = (value == '' || value == undefined) ? 'No violations reported' : value;
        
        value = fieldValue(data, TripDetentionFlag);
        if (value == '' || value == undefined) {
            document.getElementById('detentionLabel').innerHTML = 'No detentions reported';    
        } else {
            document.getElementById('detentionLabel').innerHTML = '%s<br>%s'.format(fieldValue(data, TripDetentionFlag).Label, 
                                                                                    fieldValue(data, TripDetentionNotes));        
        }

        // summary
        document.getElementById('timestamps').innerHTML = formatTableRow(data, 'Morning', TripCheckInMorning) + 
                                                            formatTableRow(data, 'Lesson', TripCheckInLesson) +
                                                            formatTableRow(data, 'Lunch', TripCheckInLunch) +
                                                            formatTableRow(data, 'Testing', TripCheckInTesting);
    });
});
