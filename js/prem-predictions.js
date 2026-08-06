function enable() {
    $('#send').removeAttr('disabled');
}

function hashCode(str) {
    var hash = 0;
    if (!str || str.length === 0) return hash;
    for (var i = 0; i < str.length; i++) {
        var char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash;
}

function doSubmit() {
    var name = $('#Name').val().trim();
    name = name.replace(/"/g, '_');
    name = name.replace(/'/g, '_');
    name = name.replace(/>/g, '_');
    name = name.replace(/</g, '_');
    name = name.replace(/&/g, '_');

    $('ol').attr('id', name);
    $('#Name').val("<h3><a name='" + hashCode(name) + "'>" + name + "</a></h3>");

    var mylist = document.getElementById('<h3>Finishing Positions</h3>');
    var raw = document.getElementById('raw');
    if (mylist && raw) {
        raw.value = mylist.innerHTML;
    }
    document.forms[0].submit();
}

$(function() {
    $('#newsortable').sortable();
    $('#newsortable').disableSelection();
});
