/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* custom saved searches
*/

class SavedSearch {
    constructor(entity, filter, selector, sorter, includeFn, summaryFn) {
        this.entity = entity;
        this.filter = filter;
        this.selector = selector;
        this.sorter = sorter;
        this.includeFn = includeFn || function() { return true;};
        this.summaryFn = summaryFn || function() { return ''; };
    }
}

const listTodayTrip = "Registered for Today's Trip";
const listCheckedInTodayTrip = "Checked In on Today's Trip";
const listViolation = "Violations";
const listInTesting = "Checked In for Testing";
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
    listAllActiveMembers,
    listAllActiveSiblings,
    listAllChaperones,
    listInTesting,
    listLessons,
    listMissedLunch,
    listTodayTrip,
    listCheckedInTodayTrip,
    listViolation,
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

const searches = {
    'Registered for Today\'s Trip' : new SavedSearch('registrations',
                                        filterCheckedIn, 
                                        selectBasicFields, 
                                        sortAlphabetically),

    'Checked In on Today\'s Trip' : new SavedSearch('contacts',
                                        filterCheckedIn, // change this
                                        selectBasicFields, 
                                        sortAlphabetically),

    'First Aid'     : new SavedSearch('contacts',
                                        filterCheckedIn, 
                                        selectBasicFields,
                                        sortAlphabetically),

    'Injuries'      : new SavedSearch('contacts',
                                        filterCheckedIn, 
                                        selectBasicFields,
                                        sortAlphabetically),

    'Bus Report'    : new SavedSearch('contacts',
                                        filterCheckedIn, 
                                        selectBasicFields,
                                        sortBySeat, 
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
    
    'Checked In for Lesson'     : new SavedSearch('contacts',
                                        "('Status' eq 'Active' AND 'TripCheckInLesson' ne NULL)", 
                                        selectBasicFields, 
                                        sortAlphabetically),
    
                                        
    'Violations'                : new SavedSearch('contacts',
                                        "('Status' eq 'Active' AND 'TripViolationDate' ne NULL)",
                                        selectBasicFields, 
                                        sortAlphabetically),

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
            var today = new Date().toJSON().slice(0,10);
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
