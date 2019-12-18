/*
* Copyright 2019 SpookyGroup LLC. All rights reserved.
*
* main member administration page
*/


document.addEventListener("DOMContentLoaded", function() {
    $.pageOpen();
});


function txt(numberType) {
    switch(numberType) {
        case 'mobile':
            FLSCsms(fieldValue($.data, fieldCellPhone));
            break;
    }
    return false;
}

function call(numberType) {
    switch(numberType) {
        case 'mobile':
            FLSCcall(fieldValue($.data, fieldCellPhone));
            break;
    }
    return false;
}

function email(address) {

}