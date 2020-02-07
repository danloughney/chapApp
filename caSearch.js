/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* custom saved searches
*/

class SavedSearch {
    constructor(name, entity, helpText, filter, selector, sorter, formatter, includeFn, summaryFn) {
        this.name = name;
        this.entity = entity;
        this.helpText = helpText;
        this.filter = filter;
        this.selector = selector;
        this.sorter = sorter;
        this.formatter = formatter || function(contact) {
            var busNumber = fieldValue(contact, TripBusNumber);
            if (busNumber != undefined && busNumber != '') {
                return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s</td></tr>".format(
                    memberHome(contact.Id), 
                    contact.LastName, contact.FirstName, 
                    fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat)
                );    
            }
            return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
                memberHome(contact.Id), 
                contact.LastName, contact.FirstName, 
            );
        };
        this.includeFn = includeFn || function() { return true;};
        this.summaryFn = summaryFn || function() { return ''; };
    }
}

class BusReport {
    constructor(busNumber) {
        this.busNumber = busNumber;
        this.total = 0;
        this.students = 0;
        this.siblings = 0;
        this.chaperones = 0;
        this.lessons = { };
    }

    add(busReport) {
        this.total += busReport.total;
        this.students += busReport.students;
        this.siblings += busReport.siblings;
        this.chaperones += busReport.chaperones;
        for (var key in busReport.lessons) {
            if (this.lessons[key] == undefined) {
                this.lessons[key] = busReport.lessons[key];
            } else {
                this.lessons[key] += busReport.lessons[key];
            }
        }
    }
}

const listTodayTrip = "Registered for Today's Trip";
const listCheckedInTodayTrip = "Checked In on Bus";
const listMorningCheckIn = 'Morning Check In (Students)';
const listMorningCheckInCandS = 'Morning Check In (Chaps and Sibs)';

const listViolation = "Violations";

const listLunchCheckIn = 'Lunch Check In';
const listMissedLunch = 'Missed Lunch Check In';

const listInTesting = "Testing Evaluation";
const listTestResults = 'Testing Result Report';
const listTestingRegistration = 'Testing Registration';

const listFirstAid = 'First Aid';
const listInjury = 'Injuries';
const listBusReport = 'Trip Report';

const listAllActiveMembers = 'All Students';
const listAllActiveSiblings = 'All Siblings';
const listAllChaperones = 'All Chaperones';

const listLessonCheckIn = "Lesson Check In"; //xx have a lesson, but have not checked in. goes to lesson check-in
const listInLessons = 'Checked In for Lesson'; // this isn't very useful

const morningLists = [
    listTodayTrip,
    listMorningCheckIn,
    listMorningCheckInCandS,
    // listCheckedInTodayTrip,
    listLunchCheckIn,
    listMissedLunch,
];

const lessonLists = [
    listLessonCheckIn,
    listInLessons,
];

const testingList = [
    listTestingRegistration,
    listInTesting,
    listTestResults,
];

const memberLists = [
    listAllActiveMembers,
    listAllActiveSiblings,
    listAllChaperones,
];

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

function lessonRegistrationFormatter(contact) {
    return genericFormatter(contact, pageLesson);
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

const searches = {
    'Registered for Today\'s Trip' : new SavedSearch('Registered for Today\'s Trip', 
        'registrations',
        'All students, siblings, and chaperones who are registered for today\'s trip.',
        filterCheckedIn, 
        selectBasicFields, 
        sortRegistrations),

    'Morning Check In (Students)' : new SavedSearch('Morning Check In (Students)', 
        'registrationsNotCheckedIn',
        'All students who are registered for today\'s trip, but haven\'t checked in',
        filterCheckedIn,
        selectBasicFields,
        sortRegistrations),

    'Morning Check In (Chaps and Sibs)' : new SavedSearch('Morning Check In (Chaps and Sibs)', 
        'registrationsNotCheckedInChapsandSibs',
        'All chaperones and siblings who are registered for today\'s trip, but haven\'t checked in',
        filterCheckedIn,
        selectBasicFields,
        sortRegistrations),

        

    'Checked In on Bus' : new SavedSearch('Checked In on Bus', 
                                        'contacts',
                                        'Everyone who has checked in on the morning bus.',
                                        filterCheckedIn, // change this
                                        selectBasicFields, 
                                        sortAlphabetically),

    'First Aid'     : new SavedSearch('First Aid', 
                                        'contacts',
                                        'Who is on the trip for the First Aid team.',
                                        // filterCheckedIn,
                                        filterStatusActive, 
                                        selectBasicFields,
                                        sortAlphabetically),

    'Injuries'      : new SavedSearch('Injuries', 
                                        'contacts',
                                        'Report of people with injuries.',
                                        "('Status' eq 'Active' and 'First Aid Notes' ne NULL)", 
                                        selectBasicFields,
                                        sortAlphabetically,
                                        injuryFormatter),

    'Testing Registration'      : new SavedSearch('Testing Registration',
                                        'contacts',
                                        'Restricted students on today\'s trip. Use this page to check students in for mountain testing.', 
                                        "'Status' eq 'Active' AND " + // 'TripCheckInMorning' ne NULL AND " + 
                                            "('TripCheckInTesting' eq NULL OR 'TripCheckInTesting' eq '') AND " +
                                            "('Member Status' eq '12483746' OR 'Member Status' eq '12483747' OR 'Member Status' eq '12483748' OR 'Member Status' eq '12483749' OR 'Member Status' eq '12483750')",
                                        selectBasicFields, 
                                        sortAlphabetically, 
                                        testingRegistrationFormatter),
        
    'Testing Evaluation'    : new SavedSearch('Testing Evaluation', 
                                        'contacts',
                                        'Students checked in for testing, but who haven\'t tested yet.',
                                        "('Status' eq 'Active' AND 'TripCheckInTesting' ne NULL AND 'TripTestDate' eq NULL)", 
                                        selectBasicFields, 
                                        sortByTestingCheckin, 
                                        testingFormatter),

    'Testing Result Report'           : new SavedSearch('Testing Result Report',
                                        'contacts', 
                                        'Students that have taken the mountain test.',
                                        "'Status' eq 'Active' and  substringof('TripTestDate', '%s')".format($.todayOverride || new Date().toJSON().slice(0,10)),
                                        selectBasicFields, 
                                        sortByPassFailAlpha,
                                        testingResultsFormatter,
                                        function() { 
                                            return true; // show all records
                                        },
                                        function(contacts) {
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
                                            html += '<tr align="center"><td width="20%">%s</td><td width="20%">%s</td><td width="20%">%s</td><td width="20%">%s%</td></tr>'.format(all, passed, failed, (passed / all)*100);
                                            html += "</table>";
                                            return html;
                                        }),

    'Lesson Check In'           : new SavedSearch('Lesson Check In',
                                        'contacts',
                                        'Students who have registered for lesson, but who have not yet checked in',
                                        "'Status' eq 'Active' AND 'TripConfirmedLesson' ne NULL AND 'TripCheckInLesson' eq NULL",
                                        selectBasicFields, 
                                        sortAlphabetically,
                                        lessonRegistrationFormatter),

    'Checked In for Lesson'     : new SavedSearch('Checked In for Lesson', 
                                        'contacts',
                                        'Students that have checked in for their lesson.',
                                        "('Status' eq 'Active' AND 'TripCheckInLesson' ne NULL)", 
                                        selectBasicFields, 
                                        sortAlphabetically),
                                        
    'Violations'                : new SavedSearch('Violations', 
                                        'contacts',
                                        'Report of members with violations on today\'s trip.',
                                        "('Status' eq 'Active' AND 'TripViolationDate' ne NULL)",
                                        selectBasicFields, 
                                        sortAlphabetically, 
                                        violationFormatter,
                                        ),

    'Missed Lunch Check In'     : new SavedSearch('Missed Lunch Check In', 
                                        'contacts',
                                        'Students and Siblings who have not checked in for lunch.',
                                        "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL and 'TripCheckInLunch' eq NULL AND 'MembershipLevelId' ne %s)".format(MembershipLevelChaperone),
                                        selectBasicFields, 
                                        sortAlphabetically, 
                                        undefined), // default formatter

    'Lunch Check In'     : new SavedSearch('Lunch Check In', 
                                        'contacts',
                                        'Students and Siblings who have not checked in for lunch.',
                                        "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL and 'TripCheckInLunch' eq NULL AND 'MembershipLevelId' ne %s)".format(MembershipLevelChaperone),
                                        selectBasicFields, 
                                        sortAlphabetically, 
                                        lunchRegistrationFormatter),


    // return 1 to include the record, 0 to exclude it
    'All Students' : new SavedSearch('All Students', 
                                        'contacts',
                                        'All active FLSC student members',
                                        "('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelStudent,
                                        selectBasicFields, 
                                        sortAlphabetically),

    'All Siblings' : new SavedSearch('All Siblings',
                                        'contacts',
                                        'All active FLSC sibling members',
                                        "('Status' eq 'Active') AND 'MembershipLevelId' eq " +  MembershipLevelSibling,
                                        selectBasicFields, 
                                        sortAlphabetically),

    'All Chaperones' : new SavedSearch('All Chaperones', 
            'contacts',
            'all active FLSC chaperones',
            "('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelChaperone,
            selectBasicFields, 
            sortAlphabetically),

    'Trip Report'    : new SavedSearch('Trip Report',
            'contacts',
            'Summary of students, siblings, chaperones, with lessons, by bus. Lists all students with detention. Export data and send to the mountain.',
            filterCheckedIn, 
            selectBasicFields,
            sortBySeat, 
            detentionFormatter, // default formatter
            function(contact) {
                var detention = fieldValue(contact, TripDetentionFlag);
                if (detention && detention.Id == detentionRequired) {
                    return true;
                }
                return false;
            },
            function(contacts) {
                var bus = 1;
                var busReport = new BusReport(bus);
                var buses = [];
                buses.push(busReport);

                var lessonsByBus = { };

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

                        var lesson = fieldValue(contact, TripConfirmedLesson);
                        if (lesson != undefined && lesson != '') {
                            var lcount = lessonsByBus[lesson];
                            if (lcount == undefined) {
                                lcount = 1;
                            } else {
                                lcount += 1;
                            }
                            lessonsByBus[lesson] = lcount;
                        }        
                    } else {
                        busReport.lessons = lessonsByBus;
                        lessonsByBus = { };
                        bus ++;
                        busReport = new BusReport(bus);
                        buses.push(busReport);
                        --i; // reset i to count the person with code above
                    }
                }
                busReport.lessons = lessonsByBus;

                var exportCode='<button onclick="exportCSV();" class="btnRed">Export</button><div id="csvData" hidden=true>%s</div>'.format(busReportCSV(buses));
                document.getElementById('export').innerHTML = exportCode;
                return busReportHTML(buses);
            }),


  };

function todaysRegistrations(api, callback) {

    todaysEvents(api, function(events) {
        for (var i = 0; i < events.length; i++) {
            // count number of registrations, etc.
        }
    });
}

function todaysEvents(api, callback) {
    api.apiRequest({
        apiUrl: api.apiUrls.events(),
        success: function (data, textStatus, jqXhr) {
            console.log('list', data);

            var todaysEvents = [];
            var today = $.todayOverride || new Date().toJSON().slice(0,10);
            var events = data.Events;
            for (i=0; i < events.length; i++) {
                var event = events[i];
                if (event.EndDate.slice(0,10) == today && event.Name.includes(membershipLevel)) {
                    console.log('found today event', event);
                    todaysEvents.push(event);
                }
            }
            if (todaysEvents.length==0) {
                alert('This is no %s event for today'.format(membershipLevel));
                return;
            }

            callback(todaysEvents);
        },
        error: function (data, textStatus, jqXhr) {
            //document.getElementById('listResults2').innerHTML = html = 'failed getting search result: ' + textStatus;
        }
    });
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

function busReportCSV(buses) {
    var totals = new BusReport(0);
    var lessonTypes = allLessons(buses);
    var csv = 'bus, total, students, siblings, chaperones,';
    for (var i = 0; i < lessonTypes.length; i++) {
        csv += "%s, ".format(lessonTypes[i]);
    }
    csv += newline;

    var data = '';
    for (i = 0; i < buses.length; i++) {
        totals.add(buses[i]);

        data = '%s, %s, %s, %s, %s, '.format(buses[i].busNumber, buses[i].total, buses[i].students, buses[i].siblings, buses[i].chaperones);

        for (var j = 0; j < lessonTypes.length; j++) {
            data += "%s, ".format(lessonCount(buses[i].lessons, lessonTypes[j]));
        }
        csv += data + newline;
    }
    data = 'Total, %s, %s, %s, %s, '.format(totals.total, totals.students, totals.siblings, totals.chaperones);
    for (var j = 0; j < lessonTypes.length; j++) {
        data += "%s, ".format(lessonCount(totals.lessons, lessonTypes[j]));
    }
    csv += data + newline;

    return csv;
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
//   1          45             37             2           8            6
//   2
//   3
//   4

function busReportHTML(buses) {
    var totals = new BusReport(0);
    var lessonTypes = allLessons(buses);

    var html = '<table width="100%" align="left" valign="top">';
    html += '<tr>%s%s%s%s%s'.format(th('Bus', '5%'), th('All'), th('Students'), th('Siblings'), th('Chaperones'));
    for (var i = 0; i < lessonTypes.length; i++) {
        html += th(lessonTypes[i]);
    }
    html += '</tr>';

    for (i = 0; i < buses.length; i++) {
        totals.add(buses[i]);

        html += '<tr>%s%s%s%s%s'.format(td(buses[i].busNumber), td(buses[i].total), td(buses[i].students), td(buses[i].siblings), td(buses[i].chaperones));
        for (var j = 0; j < lessonTypes.length; j++) {
            html += td(lessonCount(buses[i].lessons, lessonTypes[j]));
        }
        html += '</tr>';
    }

    html += '<tr><td>&nbsp;</td></tr>';
    html += '<tr>%s%s%s%s%s'.format(td("Totals"), td(totals.total), td(totals.students), td(totals.siblings), td(totals.chaperones));
    for (j = 0; j < lessonTypes.length; j++) {
        html += td(lessonCount(totals.lessons, lessonTypes[j]));
    }
    html += '</tr></table><p>&nbsp;<p><label class="labelBad">Detentions</label>';

    return html;
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
