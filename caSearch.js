/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* custom saved searches
*/

class SavedSearch {
    constructor(entity, filter, selector, sorter, formatter, includeFn, summaryFn) {
        this.entity = entity;
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

const listTodayTrip = "Registered for Today's Trip";
const listCheckedInTodayTrip = "Checked In on Bus";
const listViolation = "Violations";
const listInTesting = "Checked In for Testing";
const listTestResults = 'Testing Results';
const listMissedLunch = 'Missed Lunch Check In';
const listFirstAid = 'First Aid';
const listInjury = 'Injuries';
const listBusReport = 'Bus Report';
const listAllActiveMembers = 'All Students';
const listAllActiveSiblings = 'All Siblings';
const listAllChaperones = 'All Chaperones';
const listLessons = 'Checked In for Lesson';

// firstAid does not go in this public list of searches
const lists = [
    listTodayTrip,
    listCheckedInTodayTrip,
    listLessons,
    listInTesting,
    listTestResults,
    listMissedLunch,
    listViolation,
    listInjury,
];

const lists2 = [
    listAllActiveMembers,
    listAllActiveSiblings,
    listAllChaperones,
];

const filterCheckedIn = "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL)";
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

function testingFormatter(contact) {
    var busNumber = fieldValue(contact, TripBusNumber);
    if (busNumber != undefined && busNumber != '') {
        return "<tr><td><a href='%s'>%s, %s</a><br>Bus %s Seat %s<br>%s</td></tr>".format(
            memberHome(contact.Id), 
            contact.LastName, contact.FirstName, 
            fieldValue(contact, TripBusNumber), fieldValue(contact, TripBusSeat),
            passFail(fieldValue(contact, ProficiencyField))
        );    
    }
    return "<tr><td><a href='%s'>%s, %s</a></td></tr>".format(
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
    );
};

const searches = {
    'Registered for Today\'s Trip' : new SavedSearch('registrations',
                                        filterCheckedIn, 
                                        selectBasicFields, 
                                        sortAlphabetically),

    'Checked In on Bus' : new SavedSearch('contacts',
                                        filterCheckedIn, // change this
                                        selectBasicFields, 
                                        sortAlphabetically),

    'First Aid'     : new SavedSearch('contacts',
                                        filterCheckedIn, 
                                        selectBasicFields,
                                        sortAlphabetically),

    'Injuries'      : new SavedSearch('contacts',
                                        "('Status' eq 'Active' and 'First Aid Notes' ne NULL)", 
                                        selectBasicFields,
                                        sortAlphabetically,
                                        injuryFormatter),

    'Bus Report'    : new SavedSearch('contacts',
                                        filterCheckedIn, 
                                        selectBasicFields,
                                        sortBySeat, 
                                        undefined, // default formatter
                                        function() { 
                                            return false; // only need the summary
                                        },
                                        function(contacts) {
                                            var html = '<table width="100%" align="left" valign="top">';
                                            var bus = 1, count = 0, sibCount = 0, studentCount = 0, chapCount = 0,
                                                         allCount = 0, allSibCount = 0, allStudentCount = 0, allChapCount = 0;

                                            for (var i = 0; i < contacts.length; i++) {
                                                var contact = contacts[i];
                                                if (fieldValue(contact, TripBusNumber) == bus) {
                                                    count ++;
                                                    switch(contact.MembershipLevel.Name) {
                                                        case 'Student':
                                                            studentCount ++;
                                                            break;
                                                        case 'Chaperone':
                                                            chapCount ++;
                                                            break;
                                                        case 'Sibling':
                                                            sibCount ++;
                                                            break;
                                                    }
                                                } else {
                                                    html += '<tr><td width="20%">Bus %s</td><td width="20%">All %s</td><td width="20%">Students %s</td><td width="20%">Sibs %s</td><td width="20%">Chaps %s</td></tr>'.format(bus, count, studentCount, sibCount, chapCount);
                                                    bus ++;
                                                    allCount += count, allSibCount += sibCount, allStudentCount += studentCount, allChapCount += chapCount;
                                                    count = 0, sibCount = 0, studentCount = 0, chapCount = 0;
                                                }
                                            }
                                            allCount += count, allSibCount += sibCount, allStudentCount += studentCount, allChapCount += chapCount;
                                                    
                                            html += '<tr><td width="20%">Bus %s</td><td width="20%">All %s</td><td width="20%">Students %s</td><td width="20%">Sibs %s</td><td width="20%">Chaps %s</td></tr>'.format(bus, count, studentCount, sibCount, chapCount);
                                            html += '<tr><td>&nbsp;</td></tr><tr><td width="20%">Total</td><td width="20%">All %s</td><td width="20%">Students %s</td><td width="20%">Sibs %s</td><td width="20%">Chaps %s</td></tr>'.format(allCount, allStudentCount, allSibCount, allChapCount);
                                            html += "</table>";
                                            return html;
                                        }),
        
    'Checked In for Testing'    : new SavedSearch('contacts',
                                        "('Status' eq 'Active' AND 'TripCheckInTesting' ne NULL AND 'TripTestDate' eq NULL)", 
                                        selectBasicFields, 
                                        sortByTestingCheckin),
    'Testing Results'           : new SavedSearch('contacts', 
                                        "'Status' eq 'Active' and  substringof('TripTestDate', '%s')".format($.todayOverride || new Date().toJSON().slice(0,10)),
                                        selectBasicFields, 
                                        sortByPassFailAlpha,
                                        testingFormatter,
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
    'Checked In for Lesson'     : new SavedSearch('contacts',
                                        "('Status' eq 'Active' AND 'TripCheckInLesson' ne NULL)", 
                                        selectBasicFields, 
                                        sortAlphabetically),
    'Violations'                : new SavedSearch('contacts',
                                        "('Status' eq 'Active' AND 'TripViolationDate' ne NULL)",
                                        selectBasicFields, 
                                        sortAlphabetically, 
                                        violationFormatter,
                                        ),
    'Missed Lunch Check In'     : new SavedSearch('contacts',
                                        "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL and 'TripCheckInLunch' eq NULL)",
                                        selectBasicFields, 
                                        sortAlphabetically),
    // return 1 to include the record, 0 to exclude it
    'All Students' : new SavedSearch('contacts',
                                        "('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelStudent,
                                        selectBasicFields, 
                                        sortAlphabetically),
    'All Siblings' : new SavedSearch('contacts',
                                        "('Status' eq 'Active') AND 'MembershipLevelId' eq " +  MembershipLevelSibling,
                                        selectBasicFields, 
                                        sortAlphabetically),
    'All Chaperones' : new SavedSearch('contacts',
                                        "('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelChaperone,
                                        selectBasicFields, 
                                        sortAlphabetically),

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
