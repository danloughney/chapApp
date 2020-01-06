/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* Member ID page -- displays the member ID QR code
*/

document.addEventListener("DOMContentLoaded", function(){         
         var api = new WApublicApi('8jc86buyhc');

         $.when(api.init()).done(function(){
            api.apiRequest({
               apiUrl: api.apiUrls.me(),
               success: function (data, textStatus, jqXhr) {
                    document.getElementById("qr").src = "https://chart.googleapis.com/chart?cht=qr&chs=250x250&chl=" + data.Id;
                    if (document.getElementById("name")) {
                        document.getElementById("name").innerHTML = data.FirstName + ' ' + data.LastName;
                    } 
                }
           });
           return false;
       });
});
