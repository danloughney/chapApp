/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* Member ID page
*/

document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
         
         var api = new WApublicApi(FLSCclientID);

         $.when(api.init()).done(function(){
            api.apiRequest({
               apiUrl: api.apiUrls.me(),
               success: function (data, textStatus, jqXhr) {
                    document.getElementById("member").innerHTML = "Member: " + FLSCformatMemberName(data);
                    var qrurl = memberURL(data.Id);

                    document.getElementById("qr").src = qrurl;
                    document.getElementById('qrurl').innerHTML = qrurl;
                }
           });
           return false;
       });
});
