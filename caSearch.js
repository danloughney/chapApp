/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* custom saved searches
*/

const withIndexNone = 1;
const withIndexAlpha = 2;
const withIndexLesson = 3;

class SavedSearch {
    constructor(params) { 
        const name = '$name',
              entity = '$entity',
              filter = '$filter',
              help = '$help',
              counter = '$counter',
              selector = '$selector',
              sorter = '$sorter',
              indexer = '$index',
              formatter = '$formatter',
              includeFn = '$includeFn',
              summaryFn = '$summaryFn',
              href = '$href';
    
        const validParams = [
            name, entity, help, filter, counter, selector, sorter, formatter, includeFn, summaryFn, indexer, href,
        ];

        this.params = params;
        for (var key in this.params) {
            if (!validParams.includes(key)) {
                var list = 'invalid param: ' + key + '. Must be one of ';
                for(var i = 0; i < validParams.length; i++) {
                    list += validParams[i] + ', ';
                }
                throw list;
            }
        }

        if (this.params[name] == undefined || this.params[help] == undefined) {
            throw '$name and $help are required';
        }
    
        this.name      = params[name];
        this.help      = params[help];
        this.entity    = params[entity] || 'contacts';
        this.filter    = params[filter];
        this.counter   = params[counter];
        this.selector  = params[selector] || selectBasicFields;
        this.indexer   = params[indexer] || withIndexAlpha;
        this.sorter    = params[sorter] || sortAlphabetically;
        this.includeFn = params[includeFn] || function() { return true;};
        this.summaryFn = params[summaryFn] || function() { return ''; };
        this.formatter = params[formatter] || function(contact) {
            var busNumber = fieldValue2(contact, TripBusNumber);
            return '<tr><td><a href="%s">%s, %s</a>%s</tr>'.format(
                memberHome(contact.Id), 
                contact.LastName, contact.FirstName, 
                ((busNumber != '') ? '<br>Bus %s Seat %s</td>'.format(
                    fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat)
                    ) : ''
                )
            );    
        }
        this.href = params[href] || '/caList?name=' + this.name;
    }

    renderResultSummary(summaryElementID, contacts) {
        var html = '';

        if (contacts != undefined) {
            html = this.summaryFn(contacts);
        }
        
        if (html != '') {
            document.getElementById(summaryElementID).innerHTML = html;
        } else {
            document.getElementById(summaryElementID).innerHTML = 
                (($.resultCount != undefined) ? $.resultCount + ' result' + ($.resultCount == 1 ? '' : 's') : "Result pending") +
                (($.count != undefined) ? ' of %s total'.format($.count) : '');
        }
    }

    renderResults(contacts, elementID, summaryElementID) {
        if (contacts == undefined) {
            return;
        }   
        contacts.sort(this.sorter || { } );
        document.getElementById(elementID).innerHTML = '';
        var html = '<table width="100%"><tr><td width="80%"><table>';
        var lastLabel = '';
        var labelList = [];
        $.resultCount = 0;
     
        for (var i = 0; i < contacts.length; i++) {
            if (contacts[i] == null) {
                continue;
            }
            if (this.includeFn(contacts[i]) == true) {
                $.resultCount ++;
                switch(this.indexer) {
                    case withIndexNone:
                        break;
    
                    case withIndexAlpha:
                        var name = contacts[i].LastName || contacts[i].DisplayName;
                        if (lastLabel != name.substring(0, 1).toUpperCase()) {
                            lastLabel = name.substring(0, 1).toUpperCase();
                            labelList.push(lastLabel);
                            html += '<tr><td align="center"><b>%s</b><a id=%s></a><td></tr>'.format(lastLabel, lastLabel);
                        }
                        break;
    
                    case withIndexLesson:
                        var name = fieldValue(contacts[i], TripConfirmedLesson);
                        if (lastLabel != name.toUpperCase()) {
                            lastLabel = name.toUpperCase();
                            labelList.push(lastLabel);
                            html += '<tr><td align="center"><b><br>%s</b><a id=%s></a><td></tr>'.format(lastLabel, lastLabel);
                        }
                        break;
                }
                html += this.formatter(contacts[i]);
            }
       }
    
       if (this.indexer != withIndexNone) {
            var indexHtml = ''; 
            for (var i = 0;i<labelList.length; i++) {
                indexHtml += '<a href="#%s">%s</a><br>'.format(labelList[i], labelList[i]);
            }
            html += '</table><td valign="top" align="center">%s</td></tr></table>'.format(indexHtml);
        }
    
        html = document.getElementById(elementID).innerHTML + html;
        document.getElementById(elementID).innerHTML = html;

        this.renderResultSummary(summaryElementID, contacts);
    }

    executeAndRender(elementID, summaryElementID, callback) {
        //$.spinner.spin(document.body);
        var _this = this;
        var startTs = new Date();

        if (this.counter) {    
            $.api.apiRequest({
                apiUrl: $.api.apiUrls.contacts({ '$filter' : this.counter, '$count' : true }),
                success: function (data, textStatus, jqXhr) {
                    $.count = data.Count;
                    _this.renderResultSummary(summaryElementID);
                    if (callback != undefined) {
                        callback();
                    }
                    console.log('finished counter query ' + this.name, new Date() - startTs);
                },
                error: function (data, textStatus, jqXhr) {
                    document.getElementById(elementID).innerHTML = html = 'failed getting search result: ' + textStatus;
                }
            });    
        }
        
        $.api.apiRequest({
            apiUrl: $.api.apiUrls.contacts({ '$filter' : this.filter }),
            success: function (data, textStatus, jqXhr) {
                _this.renderResults(data.Contacts, elementID, summaryElementID);
                if (callback != undefined) {
                    callback();
                }

                var dur = new Date() - startTs;
                activityLog(this.name, this.name, dur);
                console.log('finished query ' + this.name, dur);
                $.spinner.stop();
            },
            error: function (data, textStatus, jqXhr) {
                document.getElementById(elementID).innerHTML = html = 'failed getting search result: ' + textStatus;
                $.spinner.stop();
            }
        });
    }

    execute() {

    }
}

function eventDescription(event) {
    switch (event) {
        case TripCheckInMorning:
            return "AM Check In";

        case TripCheckInLunch:
            return "Lunch Check In";

        case TripCheckInLesson:
            return "Lesson Check In";

        case TripCheckInTesting:
            return "Testing Check In";

        case TripViolationNotes:
        case TripViolationDate:
            return "Violation";

        case TripTestDate:
            return "Tested";

        case TripChapNotes:
            return "Chap Note"

        case TripInjuryNotes:
            return "First Aid";

        default:
            return event;
    }
}

class Comment { 
    constructor(commentType) {
        this.commentType = commentType;
        this.ts = '';
        this.chapName = '';
        this.text = '';
        this.memberName = '';
        this.bus = '';
    }
    header() { 
        return '<tr> <th>Time</th> <th>Event</th> <th>Chap</th> <th>Student</th> <th>Bus</th> <th>Comment</th> </tr>';
    }
    html() {
        return '<tr> <td>%s</td> <td>%s</td> <td>%s</td> <td>%s</td> <td>%s</td> <td>%s</td> </tr>'.format(
                this.ts.replace(($.todayOverride || new Date().toJSON().slice(0,10)), ''), 
                eventDescription(this.commentType), 
                this.chapName, 
                this.memberName, 
                this.bus, 
                this.text
            );
    }
}

const sortComments = function(a, b) {
    if (a == undefined && b != undefined) {
        return -1;
    } 
    if (a != undefined && b == undefined) { 
        return 1;
    }
    if (a == undefined && b == undefined) {
        return 0;
    }
    var x = '%s|%s'.format(a.ts, a.commentType).toLowerCase();
    var y = '%s|%s'.format(b.ts, b.commentType).toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
};

function parseComments(commentType, noteText) {
    // parses noteText "ts | chapName<br>text<br>..." into multiple Comment objects
    var noteEnd = 0;
    var comments = [];
    do {
        var comment = new Comment(commentType);
        comments.push(comment);

        noteEnd = noteText.indexOf('|');
        comment.ts = noteText.substring(0, noteEnd - 1);
        
        noteText = noteText.substring(noteEnd + 2);

        noteEnd = noteText.indexOf('<br>'); 
        if (noteEnd == -1) {
            // end of comment, no text
            comment.chapName = noteText;
            return comments;
        }
        
        comment.chapName = noteText.substring(0, noteEnd);
        
        noteText = noteText.substring(noteEnd + 4);

        noteEnd = noteText.indexOf('<br><br>');
        comment.text = noteText.substring(0, noteEnd);

        noteText = noteText.substring(noteEnd + 8);
    } while(noteText.length > 0);

    return comments;
}

class BusReport {
    constructor(busNumber) {
        this.busNumber = busNumber;
        this.total = 0;
        this.students = 0;
        this.siblings = 0;
        this.chaperones = 0;
        this.lessons = { };
        this.totalLessons = 0;
        this.testedContacts = [ ];
        this.comments = [ ];
    }

    addLesson(lessonName) {
        if (lessonName === undefined || lessonName == '') {
            return;
        }
        var lcount = this.lessons[lessonName];
        if (lcount === undefined) {
            lcount = 1;
        } else {
            lcount += 1;
        }
        this.lessons[lessonName] = lcount;
        this.totalLessons += 1;
    }

    addTested(contact) {
        this.testedContacts.push(contact);
    }

    addComment(comment) {
        this.comments.push(comment);
    }

    add(busReport) {
        this.total += busReport.total;
        this.students += busReport.students;
        this.siblings += busReport.siblings;
        this.chaperones += busReport.chaperones;

        this.testedContacts = this.testedContacts.concat(busReport.testedContacts);
        this.testedContacts = this.testedContacts.sort(sortByPassFailAlpha);

        this.comments = this.comments.concat(busReport.comments);
        this.comments = this.comments.sort(sortComments);

        for (var lessonName in busReport.lessons) {
            this.totalLessons += busReport.lessons[lessonName];
            if (this.lessons[lessonName] == undefined) {
                this.lessons[lessonName] = busReport.lessons[lessonName];
            } else {
                this.lessons[lessonName] += busReport.lessons[lessonName];
            }
        }
    }
}

const filterCheckedIn = "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL AND 'TripCheckInMorning' ne '')";
const filterStatusActive = "('Status' eq 'Active')";
const selectBasicFields = "'Last Name','First Name','Id";

const sortAlphabetically = function(a, b) {
    if (a == undefined && b != undefined) {
        return -1;
    } 
    if (a != undefined && b == undefined) { 
        return 1;
    }
    if (a == undefined && b == undefined) {
        return 0;
    }
    var x = '%s|%s'.format(a.LastName, a.FirstName).toLowerCase();
    var y = '%s|%s'.format(b.LastName, b.FirstName).toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
};

const sortLessonsAlphabetically = function(a, b) {
    if (a == undefined && b != undefined) {
        return -1;
    } 
    if (a != undefined && b == undefined) { 
        return 1;
    }
    if (a == undefined && b == undefined) {
        return 0;
    }
    var x = '%s|%s|%s'.format(fieldValue(a, TripConfirmedLesson), a.LastName, a.FirstName).toLowerCase();
    var y = '%s|%s|%s'.format(fieldValue(b, TripConfirmedLesson), b.LastName, b.FirstName).toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
};

const sortBySeat = function(a, b) {
    var x = '%s|%s'.format(fieldValue(a, TripBusNumber), fieldValue(a, TripBusSeat));
    var y = '%s|%s'.format(fieldValue(b, TripBusNumber), fieldValue(b, TripBusSeat));
    return x < y ? -1 : x > y ? 1 : 0;
};

const sortByTestingCheckin = function(a, b) {
    var x = fieldValue(a, TripCheckInTesting);
    var y = fieldValue(b, TripCheckInTesting);
    return x < y ? -1 : x > y ? 1 : 0;
}

function passFailLex(proficiencyArray) {
    for (var i = 0; i < proficiencyArray.length; i++) {
        proficiency = proficiencyArray[i];
        switch(proficiency.Label) {
            case 'ski':
            case 'board':
                return 0;
        }
    }
    return 1;
}

const sortByPassFailAlpha = function(a, b) {
    var pfieldA = passFailLex(fieldValue(a, ProficiencyField));
    var pfieldB = passFailLex(fieldValue(b, ProficiencyField));

    var x = '%s|%s|%s'.format(pfieldA, a.LastName, a.FirstName).toLowerCase();
    var y = '%s|%s|%s'.format(pfieldB, b.LastName, b.FirstName).toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
}

function violationFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br>%s</td></tr>".format(
            memberHome(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            fieldValue(contact, TripViolationNotes)
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
    );
};

function lessonRegistrationFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br>%s</td></tr>".format(
            checkInURL(pageLesson, contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            fieldValue(contact, TripConfirmedLesson)
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a><br>%s</td></tr>".format(
        checkInURL(pageLesson, contact.Id), 
        contact.LastName, contact.FirstName, 
        fieldValue(contact, TripConfirmedLesson)
    );
};

function injuryFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br>%s</td></tr>".format(
            memberHome(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            fieldValue(contact, TripInjuryNotes)
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
    );
};

function firstAidFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br>%s</td></tr>".format(
            memberFirstAid(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            fieldValue(contact, TripInjuryNotes)
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
        memberFirstAid(contact.Id), 
        contact.LastName, contact.FirstName, 
    );
};

function passFail(proficiencyArray) {
    for (var i = 0; i < proficiencyArray.length; i++) {
        proficiency = proficiencyArray[i];
        switch(proficiency.Label) {
            case 'ski':
                return 'Pass Ski';

            case 'board':
                return 'Pass Board';

            case 'Fail-Ski':
                return 'Fail Ski';

            case 'Fail-Board':
                return 'Fail Board';
        }
    }
    return 'Failed';
}

function genericFormatter(contact, linkType) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s</td></tr>".format(
            checkInURL(linkType, contact.Id),
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat)
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
        checkInURL(linkType, contact.Id),
        contact.LastName, contact.FirstName, 
    );
};

function lunchRegistrationFormatter(contact) {
    return genericFormatter(contact, pageLunch);
}

function testingRegistrationFormatter(contact) {
    return genericFormatter(contact, pageTesting);
}

function testingFormatter(contact) {
    return genericFormatter(contact, pageCertification);
}

function testingResultsFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br>%s</td></tr>".format(
            memberHome(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            passFail(fieldValue(contact, ProficiencyField))
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a><br>%s</td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
        passFail(fieldValue(contact, ProficiencyField))
    );
};

function detentionFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br><label class='labelBad'>%s</label></td></tr>".format(
            memberHome(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            fieldValue(contact, TripDetentionNotes)
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a><br><label class='labelBad'>%s</label></td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
        fieldValue(contact, TripDetentionNotes)
    );
};

function sortRegistrations(a, b) {
    if (a == undefined && b != undefined) {
        return -1;
    } 
    if (a != undefined && b == undefined) { 
        return 1;
    }
    if (a == undefined && b == undefined) {
        return 0;
    }

    var x = a.DisplayName.toLowerCase();
    var y = b.DisplayName.toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
}

var buses = []; // contains the report of each bus

const searchBusSeatingChart = new SavedSearch({
    '$name' : 'Bus Seating Chart', 
    '$help' : 'The bus seating chart for Chaps',
    '$href' : '/caSeatingChart'
});

const searchTodayTrip = new SavedSearch({
    '$name' : 'Registered for Today\'s Trip', 
    '$entity' : 'registrations',
    '$help' : 'All students, siblings, and chaperones who are registered for today\'s trip.',
    '$filter' : filterCheckedIn, 
    '$sorter' : sortRegistrations
});

const searchMorningCheckIn = new SavedSearch({
    '$name' : 'Not Checked In', 
    '$entity' : 'registrationsNotCheckedIn',
    '$help' : 'All students who are registered for today\'s trip, but haven\'t checked in.',
    '$filter' : filterCheckedIn,
    '$sorter' : sortRegistrations 
});

const searchCheckedInOnBus = new SavedSearch({
    '$name' : 'Checked In on Bus', 
    '$help' : 'Everyone who has checked in on the morning bus.',
    '$filter' : filterCheckedIn, // change this
});

const searchFirstAid = new SavedSearch({
    '$name' : 'First Aid', 
    '$help' : 'Who is on the trip for the First Aid team.',
    '$filter' : filterStatusActive,
});

const searchInjuries = new SavedSearch({
    '$name' : 'Injuries', 
    '$help' : 'Report of people with injuries.',
    '$filter' : "('Status' eq 'Active' and 'First Aid Notes' ne NULL)", 
    '$formatter' : injuryFormatter
});

const searchTestingRegistration = new SavedSearch({
    '$name' : 'Testing Registration',
    '$help' : 'Restricted students on today\'s trip. Use this page to check students in for mountain testing.', 
    '$filter' : "'Status' eq 'Active' AND 'TripCheckInMorning' ne NULL AND " + 
            "('TripCheckInTesting' eq NULL OR 'TripCheckInTesting' eq '') AND " +
            "('Member Status' eq '12483746' OR 'Member Status' eq '12483747' OR 'Member Status' eq '12483748' OR 'Member Status' eq '12483749' OR 'Member Status' eq '12483750')",
    '$formatter' : testingRegistrationFormatter
});

const searchTestingEvaluation = new SavedSearch({
    '$name' : 'Testing Evaluation', 
    '$help' : 'Students checked in for testing, but who haven\'t tested yet.',
    '$filter' : "('Status' eq 'Active' AND 'TripCheckInTesting' ne NULL AND 'TripTestDate' eq NULL)", 
    '$sorter' : sortByTestingCheckin, 
    '$formatter' : testingFormatter,
    '$index' : withIndexNone,
});

const searchTestingResults = new SavedSearch({
    '$name' : 'Testing Result Report',
    '$help' : 'Students that have taken the mountain test.',
    '$filter' : "'Status' eq 'Active' and  substringof('TripTestDate', '%s')".format($.todayOverride || new Date().toJSON().slice(0,10)),
    '$sorter' : sortByPassFailAlpha,
    '$formatter' : testingResultsFormatter,
    '$summaryFn' : function(contacts) {
        var html = '<table width="100%" align="left" valign="top">';
        var passed = 0, failed = 0, all = 0;
        for (var i = 0; i < contacts.length; i++) {
            var contact = contacts[i];
            all += 1;
            if (passFailLex(fieldValue(contact, ProficiencyField)) == 0) {
                passed += 1;
            } else {
                failed += 1;
            }
        }             
        html += '<tr align="center"><td width="20%">Total</td><td width="20%">Passed</td><td width="20%">Failed</td><td width="20%">Passing %</td></tr>';
        var rate = ((passed / all)*100).toFixed(1);
        html += '<tr align="center"><td width="20%">%s</td><td width="20%">%s</td><td width="20%">%s</td><td width="20%">%s%</td></tr>'.format(all, passed, failed, rate);
        html += "</table>";
        return html;
    }
});

const searchLessonCheckIn = new SavedSearch({
    '$name' : 'Lesson Check In',
    '$help' : 'Students who have registered for lesson, but who have not yet checked in',
    '$filter' : "'Status' eq 'Active' AND 'TripConfirmedLesson' ne NULL AND 'TripCheckInLesson' eq NULL",
    '$formatter' : lessonRegistrationFormatter
});

const searchCheckedInForLesson = new SavedSearch({ 
    '$name' : 'Checked In for Lesson', 
    '$help' : 'Students that have checked in for their lesson.',
    '$filter' : "('Status' eq 'Active' AND 'TripCheckInLesson' ne NULL)", 
    '$sorter' : sortLessonsAlphabetically,
    '$index' : withIndexLesson
});

const searchLessonChanges = new SavedSearch({
    '$name' : 'Changed Lesson Report', 
    '$help' : 'Report of added or changed lessons',
    '$entity' : 'changedLessons',
    '$filter' : "'TripConfirmedLesson' ne NULL AND 'TripConfirmedLesson' ne ''",
});
    
const searchDetentions = new SavedSearch({
    '$name' : 'Detentions', 
    '$help' : 'Report of members with detentions.',
    '$filter' : "('Status' eq 'Active' AND 'TripDetentionFlag' ne NULL)",
    '$formatter' : detentionFormatter,
});

const searchViolations = new SavedSearch({ 
    '$name' : 'Violations', 
    '$help' : 'Report of members with violations on today\'s trip.',
    '$filter' : "('Status' eq 'Active' AND 'TripViolationDate' ne NULL)",
    '$formatter' : violationFormatter,
});

const searchLunchCheckIn = new SavedSearch({
    '$name' : 'Lunch Check In', 
    '$help' : 'Students and Siblings who have not checked in for lunch.',
    '$filter' : "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL and 'TripCheckInLunch' eq NULL AND 'MembershipLevelId' ne %s)".format(MembershipLevelChaperone),
    '$counter' : "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL AND 'MembershipLevelId' ne %s)".format(MembershipLevelChaperone),
    '$formatter' : lunchRegistrationFormatter
});

const searchAllStudents = new SavedSearch({
    '$name' : 'All Students', 
    '$help' : 'All active FLSC student members',
    '$filter' : "('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelStudent,
});

const searchAllSiblings = new SavedSearch({
    '$name' : 'All Siblings',
    '$help' : 'All active FLSC sibling members',
    '$filter' : "('Status' eq 'Active') AND 'MembershipLevelId' eq " +  MembershipLevelSibling,
});

const searchAllChaperones = new SavedSearch({
    '$name' : 'All Chaperones', 
    '$help' : 'All active FLSC chaperones',
    '$filter' : "('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelChaperone,
});

const searchTripReport = new SavedSearch({
    '$name' : 'Trip Report',
    '$help' : 'Summary of students, siblings, chaperones, with lessons, by bus. Lists all students with detention. Export data and send to the mountain.',
    '$filter' : filterCheckedIn, 
    '$sorter' : sortBySeat, 
    '$formatter' : detentionFormatter,
    '$includeFn' : function(contact) {
        var detention = fieldValue(contact, TripDetentionFlag);
        if (detention && detention.Id == detentionRequired) {
            return true;
        }
        return false;
    },
    '$summaryFn' : function(contacts) {
        var bus = 1;
        var busReport = new BusReport(bus);
        buses.push(busReport);

        for (var i = 0; i < contacts.length; i++) {
            var contact = contacts[i];
            
            if (fieldValue(contact, TripBusNumber) == bus) {
                busReport.total ++;

                switch(contact.MembershipLevel.Name) {
                    case 'Student':
                        busReport.students ++;
                        break;
                    case 'Chaperone':
                        busReport.chaperones ++;
                        break;
                    case 'Sibling':
                        busReport.siblings ++;
                        break;
                    default:
                        console.log('incorrect membership level', contact.MembershipLevel.Name);
                }

                const noteTypes = [TripChapNotes, TripViolationNotes, TripInjuryNotes, TripTestingNotes];
                for (var k = 0; k < noteTypes.length; k++) {
                    var notes = fieldValue2(contact, noteTypes[k]);
                    if (notes != '') { 
                        var comments = parseComments(noteTypes[k], notes);
                        for (var l = 0; l < comments.length; l++) {
                            comments[l].memberName = contact.LastName + ', ' + contact.FirstName;
                            comments[l].bus = fieldValue(contact, TripBusNumber);
                            busReport.addComment(comments[l]);
                        }
                    }
                }
                
                if (fieldValue(contact, TripTestDate) == ($.todayOverride || new Date().toJSON().slice(0,10))) {
                    busReport.addTested(contact);
                }
    
                var lessonName = fieldValue(contact, TripConfirmedLesson);
                busReport.addLesson(lessonName);

            } else {
                bus ++;
                busReport = new BusReport(bus);
                buses.push(busReport);
                --i; // reset i to count the person with code above
            }
        }

        var exportCode='<button onclick="exportCSV();" class="btnRed">Export</button><div id="csvData" hidden=true>%s</div>'.format(busReportCSV(buses));
        document.getElementById('export').innerHTML = exportCode;
        return busReportHTML(buses);
    }
});

const searches = [
    searchTodayTrip,
    searchMorningCheckIn,
    searchCheckedInOnBus,
    searchFirstAid,
    searchInjuries,
    searchTestingRegistration,
    searchTestingEvaluation,
    searchTestingResults,
    searchLessonCheckIn,
    searchCheckedInForLesson,
    searchLessonChanges,
    searchDetentions,
    searchViolations,
    searchLunchCheckIn,
    searchAllStudents,
    searchAllSiblings,
    searchAllChaperones,
    searchTripReport,
];

function searchByName(name) {
    for (var i = 0; i < searches.length; i++) {
        if (searches[i].name == name) {
            return searches[i];
        }
    }
    var msg = 'unknown search ' + name;
    throw msg;
}

function allLessons(buses) {
    // get unique list of lesson names in use on this trip.
    var lessonTypes = [];

    for (var i = 0; i < buses.length; i++) {
        for (key in buses[i].lessons) {
            if (!(lessonTypes.includes(key))) {
                lessonTypes.push(key);
            }
        }
    }
    return lessonTypes.sort();
}

const newline = '\r\n'; //'%0D%0A';

function lessonCount(lessons, lessonType) {
    if (lessons[lessonType] != undefined) {
        return lessons[lessonType];  
    } 
    return 0;
}

function td(value) {
    return '<td align="center">%s</td>'.format(value);
}

function th(value, width) {
    return '<th width="%s" align="center">%s</th>'.format(width || '10%', value);
}

// total ticket summary
// total tickets            123
// students + siblings      100
// chaps                    23

// Lesson Summary
// Advanced Ski             3
// Advanced Board           5
// Intermediate Ski         1
// Beginner Ski             2

// By Bus     Total         Student/Sibs    Chaps       Lessons
//   1          45             37             2           8     
//   2
//   3
//   4

function busReportHTML(buses) {
    var totals = new BusReport(0);
    for (var i = 0; i < buses.length; i++) {
        totals.add(buses[i]);
    }

    var html = '<b>Ticket Summary</b><br><table cellpadding="5" width="100%">' + 
                '<tr><td width="20%">Total Tickets</td><td>%s</td></tr>'.format(totals.total) + 
                '<tr><td>Students + Sibs</td><td>%s</td></tr>'.format(totals.students + totals.siblings) + 
                '<tr><td>Chaperones</td><td>%s</td></tr>'.format(totals.chaperones) + 
                '</table><br>';

    html += '<b>Lesson Summary</b><br><table width="100%" cellpadding="5">' +
            '<tr><td width="20%">Total Lessons</td><td>%s</td></tr>'.format(totals.totalLessons);
    
    var keys = Object.keys(totals.lessons).sort();
    for (var i = 0; i < keys.length; i++) {
        html += '<tr><td>%s</td><td>%s</td></tr>'.format(keys[i], totals.lessons[keys[i]]);
    }
    html += '</table><br>';

    html += '<b>Bus Summary</b><br><table width="100%" cellpadding="5" align="center">' +
            '<tr align="center"><td width="10%">By Bus</td><td width="20%">Total</td><td width="20%">Students & Sibs</td><td width="20%">Chaps</td><td width="20%">Lessons</td></tr>';
    for (var i = 0; i < buses.length; i++) {    
        html += '<tr align="center"><td>%s</td><td>%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'.format(i+1, buses[i].total, buses[i].students+buses[i].siblings, buses[i].chaperones, buses[i].totalLessons);
    }
    html += '</table><br>';

    html += '<b>Testing Summary</b><br><table width="100%" cellpadding="5" align="center">' +
        '<tr align="center"><td width="10%">MemberID</td><td width="20%">Name</td><td width="20%">Pass/Fail</td></tr>';
    
        for (i = 0; i < totals.testedContacts.length; i++) {
            html += '<tr align="center"><td width="10%">%s</td><td width="20%">%s</td><td width="20%">%s</td></tr>'.format(totals.testedContacts[i].Id,  FLSCformatMemberName(totals.testedContacts[i]), passFail(fieldValue(totals.testedContacts[i], ProficiencyField)));
        }
    html += '</table><br>';

    html += '<b>Notes</b><br><table width="100%" cellpadding="5">';    
    for (i = 0; i < totals.comments.length; i++) {
        if (i == 0) {
            html += totals.comments[i].header();
        }
        html += totals.comments[i].html();
    }
    html += '</table>'; 

    const style='style="font-size: 95%;border: 1px solid black; border-collapse: collapse;cell-"';
    html = html.replace(/<table /g, '<table %s'.format(style))
        .replace(/<th/g, '<th %s'.format(style))
        .replace(/<td/g, '<td %s'.format(style));

    html += '<p>&nbsp;<p><label class="labelBad">Detentions</label>';
    return html;
}

function busReportCSV(buses) {
    var totals = new BusReport(0);
    for (var i = 0; i < buses.length; i++) {
        totals.add(buses[i]);
    }

    var csv = 'Ticket Summary' + newline + 
        'Total Tickets, %s'.format(totals.total) + newline + 
        'Students + Sibs, %s'.format(totals.students + totals.siblings) + newline + 
        'Chaperones, %s'.format(totals.chaperones) + newline + newline;


    csv += 'Lesson Summary' + newline + 
        'Total Lessons, %s'.format(totals.totalLessons) + newline;

    var keys = Object.keys(totals.lessons).sort();
    for (var i = 0; i < keys.length; i++) {
        csv += '%s, %s'.format(keys[i], totals.lessons[keys[i]]) + newline;
    }
    csv += newline;

    csv += 'Bus Summary' + newline +
        'By Bus, Total, Students & Sibs, Chaps, Lessons' + newline;
    
    for (var i = 0; i < buses.length; i++) {    
        csv += 'Bus %s, %s, %s, %s, %s'.format(i+1, buses[i].total, buses[i].students+buses[i].siblings, buses[i].chaperones, buses[i].totalLessons) + newline;
    }
    csv += newline;

    csv += 'Testing Summary' + newline + 
        'MemberID, Name, Pass/Fail' + newline;

    for (i = 0; i < totals.testedContacts.length; i++) {
        csv += '%s, %s, %s'.format(totals.testedContacts[i].Id, FLSCformatMemberName(totals.testedContacts[i]), passFail(fieldValue(totals.testedContacts[i], ProficiencyField)));
        csv += newline;
    }
    return csv;
}

function exportCSV() {

    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(document.getElementById('csvData').innerHTML);
    console.log(hiddenElement.href);

    hiddenElement.setAttribute("download", "flscTickets.csv");
    hiddenElement.target = '_blank';
    document.body.appendChild(hiddenElement); // Required for for (const iterator of object)
    hiddenElement.click();

//    document.location = "mailto:info@foxlaneskiclub.com?subject=Ticket Order for Fox Lane Ski Club&body="+document.getElementById('csvData').innerHTML;

}
