/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* chapApp home page
*/


document.addEventListener("DOMContentLoaded", function() {
    
    $.api = new WApublicApi(FLSCclientID);
    $.when($.api.init()).done(function() {
        $.listName = 'First Aid';
        document.getElementById('listName').innerHTML = $.listName;
        var search = searchByName($.listName);

        $.api.apiRequest({
            apiUrl: $.api.apiUrls.contacts({ '$filter' : search.filter }),
            success: function (data, textStatus, jqXhr) {
                var resultCount = 0;
                var contacts = data.Contacts;
            
                contacts.sort(search.sorter || { } );

                var html = '<table width="100%"><tr><td></td></tr><tr><td width="80%"><table>';
                var lastLabel = '';
                var labelList = [];
        
                for (var i = 0; i < contacts.length; i++) {
                    resultCount ++;

                    var name = contacts[i].LastName;
                    if (lastLabel != name.substring(0, 1).toUpperCase()) {
                        lastLabel = name.substring(0, 1).toUpperCase();
                        labelList.push(lastLabel);
                        html += '<tr><td align="center"><b>%s</b><a id=%s></a><td></tr>'.format(lastLabel, lastLabel);
                    }
    
                    html += firstAidFormatter(contacts[i]);
                }

                var indexHtml = ''; 
                for (var i = 0;i<labelList.length; i++) {
                    indexHtml += '<a href="#%s">%s</a><br>'.format(labelList[i], labelList[i]);
                 }
                 html += '</table><td valign="top" align="center">%s</td></tr></table>'.format(indexHtml);
             
                document.getElementById('listResults').innerHTML = html;
                document.getElementById('listCount').innerHTML = resultCount + ' Result' + (resultCount == 1 ? '' : 's');

            },
            error: function (data, textStatus, jqXhr) {
                document.getElementById('listResults').innerHTML = html = 'failed getting search result: ' + textStatus;
            }
        });
       
        // look for injuries
        var injurySearch = searchInjuries;
        
        $.api.apiRequest({
            apiUrl: $.api.apiUrls.contacts({ '$filter' : injurySearch.filter
            }),
            success: function (data, textStatus, jqXhr) {
                var resultCount = 0;
                var contacts = data.Contacts;
            
                contacts.sort(injurySearch.sorter || { } );

                var html = '<table>';        
                for (var i = 0; i < contacts.length; i++) {
                    resultCount ++;    
                    html += firstAidFormatter(contacts[i]);
                }
             
                document.getElementById('injuryResults').innerHTML = html;
                document.getElementById('injuryCount').innerHTML = resultCount + ' Result' + (resultCount == 1 ? '' : 's');

            },
            error: function (data, textStatus, jqXhr) {
                document.getElementById('injuryResults').innerHTML = html = 'failed getting injury list: ' + textStatus;
            }
        });
        return false;
    });
});
