/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*/

function formatMember(contact) {
    var style = (contact.MembershipLevel.Name == 'Chaperone' || contact.MembershipLevel.Name == 'Sibling') ? 'color:black' : 'color:white';
    
    return '<a style="%s" href="%s">%s, %s</a><br>%s'.format(
        style,
        memberHome(contact.Id), 
        contact.LastName, contact.FirstName, 
        contact.MembershipLevel.Name
    );
}

function clearAllCells() {
    for (var i = maxRowsPerBus; i > 0; i--) {
        var rowNumber = '%s'.format(i).padStart(2, '0');
        
        var seats = ['A', 'B', 'C', 'D'];
        
        for (var j = 0; j < seats.length; j++) {
            var cell = document.getElementById(rowNumber + seats[j]);
            if (cell != undefined) {
                cell.innerHTML = '';
                cell.style = '';    
            }
        }
    }
}

function onChangeBusNumber() {
    var busNumber = document.querySelector('input[name="busNumber"]:checked').value;
    setCookie('busNumber', busNumber, 1);

    clearAllCells();
    executeQuery(busNumber);
    executeDetentionQuery(busNumber);
    executeMountainTestQuery(busNumber);
}

function executeDetentionQuery(busNumber) {
    document.getElementById('detentionList').innerHTML = '';
    
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts({ '$filter' : "'Status' eq 'Active' AND 'TripBusNumber' eq '%s' AND 'TripCheckInMorning' ne NULL".format(busNumber) }),
        success: function (data, textStatus, jqXhr) {
            var html = '<br><table>';
            for (var i = 0; i < data.Contacts.length; i++) {
                var detention = fieldValue(data.Contacts[i], 'Detention?');
                if (detention && detention.Id == detentionRequired) {
                    html += detentionFormatter(data.Contacts[i]);
                }
            }
            if (data.Contacts.length > 0) {
                html += '</table>';
                document.getElementById('detentionList').innerHTML = html;
            }
        },
        error: function (data, textStatus, jqXhr) {
            console.log('failed getting detentions', textStatus);
        }
    });    
}

function executeQuery(busNumber) {
    search = searches[$.listName];

    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts(
            { 
            '$filter' : "'Status' eq 'Active' AND 'TripBusNumber' eq '%s'".format(busNumber),
            }),
        success: function (data, textStatus, jqXhr) {
            var resultCount = 0;
            var contacts = data.Contacts;
            var students = 0, siblings = 0, chaperones = 0;

            contacts.sort(search.sorter || { } );

            for (var i = 0; i < contacts.length; i++) {    
                var contact = contacts[i];
                resultCount ++;
                switch(contact.MembershipLevel.Name) {
                    case 'Student':
                        students ++;
                        break;
                    case 'Chaperone':
                        chaperones ++;
                        break;
                    case 'Sibling':
                        siblings ++;
                        break;
                    default:
                        console.log('incorrect membership level', contact.MembershipLevel.Name);
                }

                var elt = document.getElementById(fieldValue(contact, TripBusSeat));
                if (elt != undefined) {
                    elt.innerHTML = formatMember(contact);
                    elt.style = memberStatusBackgroundStyle(fieldValue(contact, 'Member Status'));
                } else {
                    console.log('unknown seat', fieldValue(contact, TripBusSeat));
                }
            }

            var cells = document.getElementsByClassName('chartTable');
            for (i = 0; i < cells.length; i++) {
                var innerHtml = cells[i].innerHTML;
                if (innerHtml == '') {
                    var id = cells[i].id;
                    var row = parseInt(id);
                    var seat = id.substring(2);
                    var seatNumber = 0;
                    
                    switch(seat) {
                        case 'A':
                            seatNumber = 4*(row-1) + 1;
                            break;

                        case 'B':
                            seatNumber = 4*(row-1) + 2;
                            break;

                        case 'C':
                            seatNumber = 4*(row-1) + 3;
                            break;

                        case 'D':
                            seatNumber = 4*(row-1) + 4;
                            break;
                    }
                    // console.log('id', id, row, seat, seatNumber);
                    cells[i].innerHTML = '<a href="%s&bus=%s&seatID=%s">Seat %s</a>'.format('/caList?name=Morning Check In', busNumber, seatNumber, seatNumber);

                    // fill it with a check in link
                    // change the checkin page to calculate the seat number and seat/Row
                }
            }

            document.getElementById('listCount').innerHTML = '<table width="100%"><tr align="center"><td>%s Seat%s in Use</td><td>%s Student%s</td><td>%s Sibling%s</td><td>%s Chaperone%s</td></tr></table>'.format(
                resultCount, resultCount == 1 ? '' : 's',
                students, students == 1 ? '' : 's',
                siblings, siblings == 1 ? '' : 's',
                chaperones, chaperones == 1 ? '' : 's');
        },
        error: function (data, textStatus, jqXhr) {
            ;
        }
    });

    // sgGetBusCaptain(busNumber, function(data) {
    //     var contacts = data.Contacts;
    //     var html = '<table width="100%">';

    //     if (contacts.length == 0) {
    //         document.getElementById('captainInfo').innerHTML = 'No Captain Identified';           
    //         return; 
    //     }

    //     for (var i = 0; i < contacts.length; i++) {
    //         html += '<tr><td width="30%">%s</td><td width="70%"><button class="btnRed" onclick="FLSCcall(\'%s\');">Call</button></td></tr>'.format(FLSCformatChapName(contacts[i]), fieldValue(contacts[i], 'Cell Phone'));
    //     }
    //     html += "</table>";
    //     document.getElementById('captainInfo').innerHTML = html;
    // });
}

function executeMountainTestQuery(busNumber) {
    
    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts(
            {     
            '$filter' : "'Status' eq 'Active' and  substringof('TripTestDate', '%s') AND 'TripBusNumber' eq '%s'".format($.todayOverride || new Date().toJSON().slice(0,10), busNumber),            
            }),
        success: function (data, textStatus, jqXhr) {
            var resultCount = 0;
            var contacts = data.Contacts;
            
            contacts.sort(sortByPassFailAlpha);

            var html = '<table width="100%">';
            for (var i = 0; i < contacts.length; i++) {
                var testing = fieldValue(contacts[i], 'Proficiency Test Pass?');
                if (testing != undefined) {
                    for (var j=0; j < testing.length; j++) {
                        test = testing[j];
                        if (test.Id == '12469877' || test.Id == '12469878') {
                            html += '<tr><td width="30%">%s</td><td>Pass %s</td></tr>'.format(FLSCformatMemberName(contacts[i]), test.Label);
                        }
                    }
                }
                html += '</table>';
            }
            document.getElementById('mountainTest').innerHTML = html; // '%s Seat%s in Use'.format(resultCount, resultCount == 1 ? '' : 's');
        },
        error: function (data, textStatus, jqXhr) {
            ;
        }
    });
}


function renderRow(rowType, rowNumber, className) {
    return '<tr align="center"> \
        <th align="center" width="5%">%s</th> \
        <%s class="%s" width="20%" id="%s"></%s> \
        <%s class="%s" width="20%" id="%s"></%s> \
        <%s width="5%">&nbsp;</%s> \
        <%s class="%s" width="20%" id="%s"></%s> \
        <%s class="%s" width="20%" id="%s"></%s> \
        </tr>'.format(
            rowNumber, 
            rowType, className, rowNumber+'A', rowType,
            rowType, className, rowNumber+'B', rowType,  
            rowType, rowType,
            rowType, className, rowNumber+'C', rowType, 
            rowType, className, rowNumber+'D', rowType
            );
}

document.addEventListener("DOMContentLoaded", function() {
    $.listName = 'Trip Report';

    // read the bus number from the cookie
    var busNumber = getCookie('busNumber') || '1';
    var cell = document.getElementById('busNumber'+busNumber);
    cell.checked = true;

    // create the table
    var html = '<tr><td align="center" colspan="6"><b>BACK OF BUS</b></td></tr>';
    html += renderRow('th', '', '');
    for (var i = maxRowsPerBus; i > 0; i--) {
        var rowNumber = '%s'.format(i).padStart(2, '0');
        html += renderRow('td', rowNumber, 'chartTable');
    }
    html += '<tr><td align="center" colspan="6"><b>FRONT OF BUS</b></td></tr>'
    document.getElementById('busChart').innerHTML = html;

    document.getElementById('A').innerHTML = 'A';
    document.getElementById('B').innerHTML = 'B';
    document.getElementById('C').innerHTML = 'C';
    document.getElementById('D').innerHTML = 'D';

    // fill table with data
    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        executeQuery(busNumber);
        executeDetentionQuery(busNumber);
        executeMountainTestQuery(busNumber);
        return false;
    });
});

