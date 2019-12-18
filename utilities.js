/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* general utilities
*/

const FLSCphoto = "Photo";
const FLSCclientID = "8jc86buyhc";
const clubBaseURL = 'https://foxlaneskiclub.wildapricot.org';


const MembershipLevelChaperone = 1088585;
const MembershipLevelStudent = 1089064;
const MembershipLevelSibling = 1092553;

String.prototype.format = function() {
    var newStr = this, i = 0;
    while (/%s/.test(newStr))
        newStr = newStr.replace("%s", arguments[i++])

    return newStr;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
  
function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user = getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
        user = prompt("Please enter your name:", "");
        if (user != "" && user != null) {
        setCookie("username", user, 365);
        }
    }
}

function chapAppHome() {
    window.location.href='%s/chapApp'.format(clubBaseURL);
}

function firstAidHome() {
    window.location.href = '%s/firstAid'.format(clubBaseURL);
}

function memberHome(id) {
    return '%s/caMember?ID=%s'.format(clubBaseURL, id || $.memberID);
}
function goMemberHome(id) {
    window.location.href='%s/caMember?ID=%s'.format(clubBaseURL, id || $.memberID);
}

function memberDetention(id) {
    return 'https://foxlaneskiclub.wildapricot.org/caDetention?ID=' + id || $.memberID;
}

function memberFirstAid(id) {
    return 'https://foxlaneskiclub.wildapricot.org/caFirstAid?ID=' + id || $.memberID;
}

function goMemberFirstAid(id) {
    window.location = memberFirstAid(id);
}

function memberURL(id) {
    return "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=" + id;
}

function auto_grow(element) {
    element.style.height = "5px";
    element.style.height = (element.scrollHeight)+"px";
}
  
// accepts wsApi data object and returns the corresponding fieldValue for the given name
function fieldValue(data, name) {
    if (data == undefined || name == undefined) {
        console.log('no data provied', data, name);
        return undefined;
    }
    if (data.FieldValues == undefined) {
        console.log('no field values provided');
        return undefined;
    }
    for (index = 0; index < data.FieldValues.length; index++) { 
        if (data.FieldValues[index].FieldName == name) {
            return data.FieldValues[index].Value;
        }
    }
    return undefined;
}

// API.member.data layout
// .DisplayName
// .Email
// .FirstName
// .LastName
// .Id
// .IsAccountAdministrator
// .MembershipEnabled
// .MembershipLevel.Name
// .Organization (mobile number?)
// .ProfileLastUpdated
// .Status (Active)
// .TermsOfUseAccepted
// .Url
 
function formatField(fieldName, value) {
    return fieldName + ': [' + value + ']<br>'
}

$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null){
        return null;
    }
    else {
        return decodeURI(results[1]) || 0;
    }
}

function AMPM(hrs) {
    if (hrs >= 12) {
        return "pm";
    }
    return "am";
}

function FLSCformatDate(d /* a date */) {
    return d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " +
         ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
}

function FLSCformatDateAMPM(d /* a date */) {
    return ("0" + d.getDate()).slice(-2) + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" +
        d.getFullYear() + " " + ("0" + (d.getHours()%12)).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + AMPM(d.getHours());
}

function FLSCformatName(data) {
    var grade = fieldValue(data, "School Grade Level");
    var school = fieldValue(data, "School");
    if (grade) {
        return '%s %s (%s %s)'.format(data.FirstName, data.LastName, school, grade[0].Label);    
    }
    return '%s %s'.format(data.FirstName, data.LastName);
}

function FLSCformatMemberName(data) {
    // assumes this is a Member Data object
    return data.FirstName + ' ' + data.LastName;
}

function FLSCformatChapName(data) {
    // assumes this is a Member Data object
    return FLSCformatMemberName(data);
}

function FLSCformatComment(currentComment, comment, chapName) {
    if (currentComment == undefined) { 
        currentComment = '';
    }
    if (comment == undefined || comment =='') {
        return currentComment; // no action when no comment is supplied
    }
    return '[' +  FLSCformatDate(new Date()) + ", " + chapName + ']<br>' + 
        comment + '<br><br>' + 
        currentComment;
}

function FLSCwindowAlert(text) {
    if ($.testHarness == undefined) {
        window.alert(text);
    } else {
        console.log('ALERT:' + text);
    }
}
function FLSCwindowBack() {
    if ($.testHarness == undefined) {
        window.history.back();
    }
}

function FLSCcall(phoneNumber) {
    if (phoneNumber.startsWith('1')) {
        phoneNumber = 'tel:+' + phoneNumber;
    } else {
        phoneNumber = 'tel:+1' + phoneNumber;
    }
    //document.location.href = phoneNumber;
    window.open(phoneNumber).close();
    //c.back();
}

function FLSCsms(phoneNumber) {
    if (phoneNumber.startsWith('1')) {
        phoneNumber = 'sms:+' + phoneNumber;
    } else {
        phoneNumber = 'sms:+1' + phoneNumber;
    }
    c = window.open(phoneNumber);//document.location.href = phoneNumber;
    c.close();
    //
}

function radioSelection(radioName, optionName) {
    return '<input id="%s" type="radio" name="%s" id="%s" value="%s">\n<label for="%s">%s</label><br>'.format(radioName, radioName, optionName, optionName, optionName, optionName);
}
