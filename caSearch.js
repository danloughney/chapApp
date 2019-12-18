/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* custom saved searches
*/

class SavedSearch {
    constructor(filter, selector, sorter, includeFn) {
        this.filter = filter;
        this.selector = selector;
        this.sorter = sorter;
        this.includeFn = includeFn || function() { return 1;};
    }
}

const listTodayTrip = "Registered for Today's Trip";
const listCheckedInTodayTrip = "Checked In on Today's Trip";
const listViolation = "Violations";
const listInTesting = "In Testing";
const listFirstAid = 'First Aid';
const listInjury = 'Injuries';
const listBusReport = 'Bus Report';
const listAllActiveMembers = 'All Active Members';
const listAllActiveSiblings = 'All Active Siblings';
const listAllChaperones = 'All Chaperones';

// firstAid does not go in this public list of searches
const lists = [
    listTodayTrip,
    listCheckedInTodayTrip,
    listInTesting,
    listViolation,
    listBusReport,
    listAllActiveMembers,
    listAllActiveSiblings,
    listAllChaperones,
];

const filterCheckedIn = "('Status' eq 'Active' AND 'TripCheckInMorning' ne NULL)";
const selectBasicFields = "'Last Name','First Name','Id";

const sortAlphabetically = function(a, b) {
    var x = '%s|%s'.format(a.LastName, a.FirstName).toLowerCase();
    var y = '%s|%s'.format(b.LastName, b.FirstName).toLowerCase();
    return x < y ? -1 : x > y ? 1 : 0;
};

const sortBySeat = function(a, b) {
    var x = '%s|%s'.format(fieldValue(a, TripBusNumber), fieldValue(a, TripBusSeat));
    var y = '%s|%s'.format(fieldValue(b, TripBusNumber), fieldValue(b, TripBusSeat));
    return x < y ? -1 : x > y ? 1 : 0;
};

const searches = {
    'Registered for Today\'s Trip' : new SavedSearch(filterCheckedIn, 
                                        selectBasicFields, 
                                        sortAlphabetically),

    'Checked In on Today\'s Trip' : new SavedSearch(filterCheckedIn, // change this
                                        selectBasicFields, 
                                        sortAlphabetically),

    'First Aid'     : new SavedSearch(filterCheckedIn, 
                                        selectBasicFields,
                                        sortAlphabetically),

    'Injuries'      : new SavedSearch(filterCheckedIn, 
                                        selectBasicFields,
                                        sortAlphabetically),

    'Bus Report'    : new SavedSearch(filterCheckedIn, 
                                        selectBasicFields,
                                        sortBySeat),
        
    'In Testing'    : new SavedSearch("('Status' eq 'Active' AND 'TripCheckInTesting' ne NULL AND 'TripChapNotes' ne NULL)", 
                                        selectBasicFields, 
                                        "'TripCheckInTesting'"),
    
    'Violations'    : new SavedSearch("('Status' eq 'Active' AND 'TripViolationDate' ne NULL)",
                                        selectBasicFields, 
                                        sortAlphabetically),

    // return 1 to include the record, 0 to exclude it
    'All Active Members' : new SavedSearch("('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelStudent,
                                        selectBasicFields, 
                                        sortAlphabetically,
                                        function(data) {
                                            if (data.MembershipLevel.Name == 'Chaperone') {
                                                return 0;
                                            }
                                            return 1;
                                        }),

    'All Active Siblings' : new SavedSearch("('Status' eq 'Active') AND 'MembershipLevelId' eq " +  MembershipLevelSibling,
                                        selectBasicFields, 
                                        sortAlphabetically,
                                        function(data) {
                                            if (data.MembershipLevel.Name == 'Sibling') {
                                                return 1;
                                            }
                                            return 0;
                                        }),

    'All Chaperones' : new SavedSearch("('Status' eq 'Active') AND 'MembershipLevelId' eq " + MembershipLevelChaperone,
                                        selectBasicFields, 
                                        sortAlphabetically,
                                        function(data) {
                                            if (data.MembershipLevel.Name == 'Chaperone') {
                                                return 1;
                                            }
                                            return 0;
                                        }),
};

