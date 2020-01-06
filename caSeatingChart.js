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
}

function executeQuery(busNumber) {

    search = searches[$.listName];

    $.api.apiRequest({
        apiUrl: $.api.apiUrls.contacts(
            { 
            '$filter' : "'Status' eq 'Active' AND 'TripBusNumber' eq '%s'".format(busNumber),
            //'$select' : "'Status', 'TripBusNumber', 'TripBusSeat', 'Id', 'LastName', 'FirstName'",
            }),
        success: function (data, textStatus, jqXhr) {
            var resultCount = 0;
            var contacts = data.Contacts;
            
            contacts.sort(search.sorter || { } );

            for (var i = 0; i < contacts.length; i++) {
                resultCount ++;
                var contact = contacts[i];
                var elt = document.getElementById(fieldValue(contact, TripBusSeat));
                elt.innerHTML = formatMember(contact);
                elt.style = memberStatusBackgroundStyle(fieldValue(contact, 'Member Status'));
            }
            document.getElementById('listCount').innerHTML = '%s Seat%s in Use'.format(resultCount, resultCount == 1 ? '' : 's');
        },
        error: function (data, textStatus, jqXhr) {
            ;
        }
    });

    sgGetBusCaptain(busNumber, function(data) {
        var contacts = data.Contacts;
        var html = '<table width="100%">';

        if (contacts.length == 0) {
            document.getElementById('captainInfo').innerHTML = 'No Captain Identified';           
            return; 
        }

        for (var i = 0; i < contacts.length; i++) {
            html += '<tr><td width="30%">%s</td><td width="70%"><button class="btnRed" onclick="FLSCcall(\'%s\');">Call</button></td></tr>'.format(FLSCformatChapName(contacts[i]), fieldValue(contacts[i], 'Cell Phone'));
        }
        html += "</table>";
        document.getElementById('captainInfo').innerHTML = html;
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
    $.listName = 'Bus Report';

    // read the bus number from the cookie
    var busNumber = getCookie('busNumber') || '1';
    var cell = document.getElementById('busNumber'+busNumber);
    cell.checked = true;

    // create the table
    var html = renderRow('th', '', '');

    for (var i = maxRowsPerBus; i > 0; i--) {
        var rowNumber = '%s'.format(i).padStart(2, '0');
        html += renderRow('td', rowNumber, 'chartTable');
    }
    document.getElementById('busChart').innerHTML = html;

    document.getElementById('A').innerHTML = 'A';
    document.getElementById('B').innerHTML = 'B';
    document.getElementById('C').innerHTML = 'C';
    document.getElementById('D').innerHTML = 'D';

    // fill table with data
    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        executeQuery(busNumber);
        return false;
    });
});
