// FLSC action utilities

// waApi - initialized WildApricot API object
// memberID 

function FLSCactionCheckInAM(waApi, memberID) {
    //
    let currentTS = new Date();

    api.apiRequest({
        apiUrl: waApi.apiUrls.contact(memberID),
            method: "PUT",
            data: { id: contactId, fieldValues: [ { fieldName:"TripCheckInMorning", value: currentTS } ] },
            success: function(data, textStatus, jqXhr){
                alert("Member checked in was successfully updated at " + $.datepicker.formatDate("M d, yy", currentTS.format));
            },
            error: function(data, textStatus, jqXhr){
                alert("Failed to update contact. See console for details " + data.responseText);
            }
    });
}