/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* general utilities
*/

const FLSCphoto = 'Photo';
const FLSCclientID = '8jc86buyhc';
const clubBaseURL = 'https://foxlaneskiclub.wildapricot.org';
const FLSCHotline = '805-635-7669';

// trip configurations
const maxRowsPerBus = 16;
const maxBusesPerTrip = 6;
$.todayOverride = '2020-02-08'; // '2020-01-18'; //  undefined; // set to undefined for production '2020-03-18';
 
// field value definitions
const MembershipLevelChaperone = 1088585;
const MembershipLevelStudent = 1089064;
const MembershipLevelSibling = 1092553;

class WAObject {
    constructor(Label, Id) {
        this.Label = Label;
        this.Id = Id;
    }
}

String.prototype.format = function() {
    var newStr = this, i = 0;
    while (/%s/.test(newStr))
        newStr = newStr.replace('%s', arguments[i++])

    return newStr;
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = 'expires='+d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}
  
function getCookie(cname) {
    var name = cname + '=';
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
    return '';
}

function checkCookie() {
    var user = getCookie('username');
    if (user != '') {
        console.log('Welcome again ' + user);
    } else {
        user = prompt('Please enter your name:', '');
        if (user != '' && user != null) {
        setCookie('username', user, 365);
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

function fieldValue2(data, name) {
    if (data == undefined || name == undefined) {
        return '';
    }
    if (data.FieldValues == undefined) {
        return '';
    }
    for (index = 0; index < data.FieldValues.length; index++) { 
        if (data.FieldValues[index].FieldName == name) {
            return (data.FieldValues[index].Value == null) ? '' : data.FieldValues[index].Value;
        }
    }
    return '';
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
    if ($.spinner != undefined) {
        $.spinner.stop();
    }
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
function FLSCwindowBack(skip) {
    if ($.testHarness == undefined) {
        if (skip != undefined) {
            window.history.back(skip);
        } else {
            window.history.back();
        }
    }
}

function FLSCwindowBack2() {
    if ($.testHarness == undefined) {
        window.history.go(-2);
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

function FLSCsms(phoneNumber, message) {
    if (phoneNumber.startsWith('1')) {
        phoneNumber = 'sms:+' + phoneNumber;
    } else {
        phoneNumber = 'sms:+1' + phoneNumber;
    }
    
    if (message != undefined) {
        phoneNumber += '&body=%s'.format(message);
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

function disableButton(elementID) {
    elt = document.getElementById(elementID);
    elt.disable = true;
    elt.className = "btnInactive";
}

function formatTableRow(data, name, field) {
    return '<tr><td width="10%" align="left" valign="top">%s</td><td><b>%s</b></td></tr>'.format(name, fieldValue(data, field));
}

const spinOpts = {
    length : 15,
    width : 8,
    length: 10,
    radius : 45,
    corners : 0.4,
    rotate : 0,
    color : '#000000',
    fadeColor : '#FFFFFF',
    // animation : 'spinner-line-shrink'
};

/* Spin.Js.Org
*/
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var defaults = {
    lines: 12,
    length: 7,
    width: 5,
    radius: 10,
    scale: 1.0,
    corners: 1,
    color: '#000',
    fadeColor: 'transparent',
    animation: 'spinner-line-fade-default',
    rotate: 0,
    direction: 1,
    speed: 1,
    zIndex: 2e9,
    className: 'spinner',
    top: '50%',
    left: '50%',
    shadow: '0 0 1px transparent',
    position: 'absolute',
};
var Spinner = /** @class */ (function () {
    function Spinner(opts) {
        if (opts === void 0) { opts = {}; }
        this.opts = __assign(__assign({}, defaults), opts);
    }
    /**
     * Adds the spinner to the given target element. If this instance is already
     * spinning, it is automatically removed from its previous target by calling
     * stop() internally.
     */
    Spinner.prototype.spin = function (target) {
        // $("#blackground_spinner").remove();
        // my_spinner_sampleTT.el.remove();

        this.stop();
        this.el = document.createElement('div');
        this.el.className = this.opts.className;
        this.el.setAttribute('role', 'progressbar');
        css(this.el, {
            position: this.opts.position,
            width: 0,
            zIndex: this.opts.zIndex,
            left: this.opts.left,
            top: this.opts.top,
            backgroundColor: '#AAAAAA',
            transform: "scale(" + this.opts.scale + ")",
        });

        this.background_spinner = document.createElement('div');
        this.background_spinner.setAttribute('role', 'progressbar');
        
        css(this.background_spinner, {
            width:'100%',
            height:'100%',
            position: 'fixed',
            backgroundColor : 'black',
            zIndex : 12,
            opacity: 0.5,
        });
        if (target) {
            target.insertBefore(this.background_spinner, target.firstChild || null);
            this.background_spinner.appendChild(this.el);
            // target.insertBefore(this.el, target.firstChild || null);
        }
        drawLines(this.el, this.opts);
        return this;
    };
    /**
     * Stops and removes the Spinner.
     * Stopped spinners may be reused by calling spin() again.
     */
    Spinner.prototype.stop = function () {
        if (this.el) {
            if (typeof requestAnimationFrame !== 'undefined') {
                cancelAnimationFrame(this.animateId);
            }
            else {
                clearTimeout(this.animateId);
            }
            if (this.background_spinner.parentNode) {
                this.background_spinner.parentNode.removeChild(this.background_spinner);
            }
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el);
            }
            this.el = undefined;
            this.background_spinner = undefined;
        }
        return this;
    };
    return Spinner;
}());

/**
 * Sets multiple style properties at once.
 */
function css(el, props) {
    for (var prop in props) {
        el.style[prop] = props[prop];
    }
    return el;
}
/**
 * Returns the line color from the given string or array.
 */
function getColor(color, idx) {
    return typeof color == 'string' ? color : color[idx % color.length];
}
/**
 * Internal method that draws the individual lines.
 */
function drawLines(el, opts) {
    var borderRadius = (Math.round(opts.corners * opts.width * 500) / 1000) + 'px';
    var shadow = 'none';
    if (opts.shadow === true) {
        shadow = '0 2px 4px #000'; // default shadow
    }
    else if (typeof opts.shadow === 'string') {
        shadow = opts.shadow;
    }
    var shadows = parseBoxShadow(shadow);
    for (var i = 0; i < opts.lines; i++) {
        var degrees = ~~(360 / opts.lines * i + opts.rotate);
        var backgroundLine = css(document.createElement('div'), {
            position: 'absolute',
            top: -opts.width / 2 + "px",
            width: (opts.length + opts.width) + 'px',
            height: opts.width + 'px',
            background: getColor(opts.fadeColor, i),
            borderRadius: borderRadius,
            transformOrigin: 'left',
            transform: "rotate(" + degrees + "deg) translateX(" + opts.radius + "px)",
        });
        var delay = i * opts.direction / opts.lines / opts.speed;
        delay -= 1 / opts.speed; // so initial animation state will include trail
        var line = css(document.createElement('div'), {
            width: '100%',
            height: '100%',
            background: getColor(opts.color, i),
            borderRadius: borderRadius,
            boxShadow: normalizeShadow(shadows, degrees),
            animation: 1 / opts.speed + "s linear " + delay + "s infinite " + opts.animation,
        });
        backgroundLine.appendChild(line);
        el.appendChild(backgroundLine);
    }
}
function parseBoxShadow(boxShadow) {
    var regex = /^\s*([a-zA-Z]+\s+)?(-?\d+(\.\d+)?)([a-zA-Z]*)\s+(-?\d+(\.\d+)?)([a-zA-Z]*)(.*)$/;
    var shadows = [];
    for (var _i = 0, _a = boxShadow.split(','); _i < _a.length; _i++) {
        var shadow = _a[_i];
        var matches = shadow.match(regex);
        if (matches === null) {
            continue; // invalid syntax
        }
        var x = +matches[2];
        var y = +matches[5];
        var xUnits = matches[4];
        var yUnits = matches[7];
        if (x === 0 && !xUnits) {
            xUnits = yUnits;
        }
        if (y === 0 && !yUnits) {
            yUnits = xUnits;
        }
        if (xUnits !== yUnits) {
            continue; // units must match to use as coordinates
        }
        shadows.push({
            prefix: matches[1] || '',
            x: x,
            y: y,
            xUnits: xUnits,
            yUnits: yUnits,
            end: matches[8],
        });
    }
    return shadows;
}
/**
 * Modify box-shadow x/y offsets to counteract rotation
 */
function normalizeShadow(shadows, degrees) {
    var normalized = [];
    for (var _i = 0, shadows_1 = shadows; _i < shadows_1.length; _i++) {
        var shadow = shadows_1[_i];
        var xy = convertOffset(shadow.x, shadow.y, degrees);
        normalized.push(shadow.prefix + xy[0] + shadow.xUnits + ' ' + xy[1] + shadow.yUnits + shadow.end);
    }
    return normalized.join(', ');
}
function convertOffset(x, y, degrees) {
    var radians = degrees * Math.PI / 180;
    var sin = Math.sin(radians);
    var cos = Math.cos(radians);
    return [
        Math.round((x * cos + y * sin) * 1000) / 1000,
        Math.round((-x * sin + y * cos) * 1000) / 1000,
    ];
}
