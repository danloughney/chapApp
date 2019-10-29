<script type="text/javascript" src="https://rawgit.com/WildApricot/ApiSamples/master/JavaScript/waPublicApi.js"></script>

<script type="text/javascript">
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
       return null;
    }
    else {
       return decodeURI(results[1]) || 0;
    }
}

document.addEventListener("DOMContentLoaded", function(){
    // render the initial page with all selected member data
    var memberID = $.urlParam("ID");
    
    var clientId = "8jc86buyhc";
    var api = new WApublicApi(clientId);

    $.when(api.init()).done(function(){
        
        api.apiRequest({
          apiUrl: api.apiUrls.contact(memberID),
          success: function (data, textStatus, jqXhr) {
                $.data = data;

                document.getElementById("memberName").innerHTML = data.FirstName + ' ' + data.LastName + " " + textStatus;
                document.getElementById("skiLevel").innerHTML = data.email;
                var allFields = ""
                var thisField = ""
                for (index = 0; index < data.FieldValues.length; index++) { 
                    var o = data.FieldValues[index];
                    thisField = o.FieldName + ": [" + o.Value + "]<br>";
                    allFields += thisField;

                }
                document.getElementById("skiLevel").innerHTML = allFields;
              // document.getElementById("profilePhoto").src = 
                //data.FieldValues[]
                //"Email"
                //"Cell Phone"
                //"Home Phone"
                //"Admin Notes"
                //"FieldName", "SystemCode", "Value"

           },
           error: function (jqXHR, textStatus, errorThrown) {
            document.getElementById("memberName").innerHTML = "Unknown memberID [" + memberID + "]";
           }
      });
      return false;
    });
});

$.checkInAM = function() {
    alert("Do you want to check-In " + $.data.FirstName + "  " + $.data.LastName + "?");
    window.location.href = "http://example.com/new_url";


}


</script>