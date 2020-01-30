/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* general utilities
*/

const FLSCphoto = "Photo";
const FLSCclientID = "8jc86buyhc";
const clubBaseURL = 'https://foxlaneskiclub.wildapricot.org';
const FLSCHotline = '805-635-7669';

// trip configurations
const maxRowsPerBus = 16;
const maxBusesPerTrip = 6;
$.todayOverride = '2020-02-02'; // '2020-03-18'; // undefined; // set to undefined for production 
 
// field value definitions
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

function memberQR(id) {
    return "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=" + id;
}

function memberURL(id) {
    return "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=" + id;
}

function memberLesson(id) {
    return '%s/caLesson?ID=%s'.format(clubBaseURL, id || $.memberID);
}
function goMemberLesson(id) {
    window.location.href='%s/caLesson?ID=%s'.format(clubBaseURL, id || $.memberID);
}

// for textArea controls
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
            return (data.FieldValues[index].Value == null) ? '' : data.FieldValues[index].Value;
        }
    }
    return undefined;
}

function memberStatusBackgroundStyle(memberStatus) {
    // any 'restricted' member status receives a red background color
    if (memberStatus) {
        switch(memberStatus.Id) {
            case 12483751:
            case 12483744:
            case 12483745:
                return 'background-color:darkgreen;color:white;';

            case 12483748:
            case 12483749:
                return 'background-color:gold;color:white;';

            default:
                return 'background-color:crimson;color:white;';
        }
    }
    return 'background-color:white;color:black;';
}
 
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
    // date with chap name indicating who checked in member
    var ts = d.getFullYear() + "-" + ("0"+(d.getMonth()+1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " +
         ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    if ($.chapName != undefined) {
        return "%s | %s".format(ts, $.chapName);
    }
    return ts;
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
    return '[' +  FLSCformatDate(new Date()) + ']<br>' + 
        comment + '<br><br>' + 
        currentComment;
}

function timedAlert(msg,completion)
{
    var el = document.createElement("div");
    el.setAttribute("style", "margin:20;color:white;background:dimgray;position:absolute;top:50%;left:50%;margin-right: -50%;transform:translate(-50%, -50%);border-radius:4px;");
    //el.setAttribute("style", "margin:5;color:white;background:dimgray;position:absolute;height:100%;width:100%;bottom:0;align-content:center;border-radius:4px;");

    el.innerHTML = "&nbsp;<br>&nbsp;&nbsp;&nbsp;&nbsp;%s&nbsp;&nbsp;&nbsp;&nbsp;<br>&nbsp;".format(msg);
    document.body.appendChild(el);

    setTimeout(function(){
        el.parentNode.removeChild(el);
        if (completion != undefined) {
            completion();
        }
    },2000);
}

function FLSCwindowAlert(text, completion) {
    // pass a completion fn and we will make this a timed alert. regular alert otherwise.
    if ($.testHarness == undefined) {
        if (completion != undefined) {
            timedAlert(text, completion);
        } else {
            window.alert(text);
        }
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

function FLSCcallHotline() {
    FLSCcall(FLSCHotline);
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

function radioSelection(radioName, optionName, onchangeFn) {
    var onchange = '';
    if (onchangeFn != undefined) {
        onchange = 'onchange="%s;"'.format(onchangeFn);
    }
    return '<input id="%s" type="radio" name="%s" id="%s" value="%s" %s>\n<label for="%s">%s</label><br>'.format(radioName, radioName, optionName, optionName, onchange, optionName, optionName);
}
