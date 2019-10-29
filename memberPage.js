<script type="text/javascript" src="https://rawgit.com/WildApricot/ApiSamples/master/JavaScript/waPublicApi.js"></script>

<div id="profileURL">
TEST: A member logs into the site with WA User app and goes to this page. It shows the member name, photo, and the QR code<br>
</br>
The Chap scans the QR with their camera app and opens the page when prompted.
<p></p>
</div>


<script>
document.addEventListener("DOMContentLoaded", function(){
  // Handler when the DOM is fully loaded
         var clientId = "8jc86buyhc";
         var api = new WApublicApi(clientId);

         $.when(api.init()).done(function(){
            api.apiRequest({
               apiUrl: api.apiUrls.me(),
               success: function (data, textStatus, jqXhr) {
                  // $("#contactIdEntry").val(data.Id);
                  // alert("Hello " + data.FirstName + " " + data.LastName + " !\r\nSpirits say that your ID is '" + data.Id + "' and your email is '" + data.Email + "'."); 

                  document.getElementById("member").innerHTML = "Member Name: " + data.FirstName + ' ' + data.LastName;
                  document.getElementById("qr").src = "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=https://foxlaneskiclub.wildapricot.org/memberAdmin?ID=" + data.Id;
                  // document.getElementById("profilePhoto").src = 
                  // document.getElementById("profileURL").innerHTML = data.Url;
                }
           });
           return false;
       });
});

</script>

<div id="member">
TEST TEST TEST Page to see how API calls work in Wild Apricot TEST TEST TEST
</div>
<img id="qr" src="">
