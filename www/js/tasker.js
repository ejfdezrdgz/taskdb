window.onload = function () {

    function getStyle(elementId) {
        return document.getElementById(elementId).getAttribute('style');
    };

    function setStyle(elementId, displayType) {
        document.getElementById(elementId).setAttribute('style', 'display: ' + displayType);
    }

    document.getElementById('huser').onclick = function () {
        if (document.getElementById('userdd').getAttribute('class') == 'ddhide') {
            document.getElementById('userdd').setAttribute('class', 'ddshow');
        } else {
            document.getElementById('userdd').setAttribute('class', 'ddhide');
        }
    };

    document.getElementById('ddhome').onclick = function () {
        event.preventDefault();

        if (getStyle('listtasks') == 'display: block') {
            setStyle('listtasks', 'none');
            setStyle('newtask', 'none');
        } else {
            setStyle('listtasks', 'block');
            setStyle('newtask', 'block');
            setStyle('userinfo', 'none');
        }
    };

    document.getElementById('edit_submit').onclick = function (event) {
        event.preventDefault();
        console.log('Sending POST data');
        var req = new XMLHttpRequest();
        req.open('POST', '/userinfo', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            console.log(req.response);
            if (req.response == 'ok') {
                alert('GUD');
            } else {
                alert('GIT GUD');
            }
        });
        req.addEventListener('error', function () {
            console.log('SUBMIT error');
        });
        var data = {
            name: document.getElementById('edit_name').value,
            nick: document.getElementById('edit_nick').value,
            mail: document.getElementById('edit_mail').value,
            pass: document.getElementById('pass_check').value,
            n2pass: document.getElementById('new_pass1').value,
            n2pass: document.getElementById('new_pass2').value
        };
        req.send(JSON.stringify(data));
    };

    document.getElementById('edituser').onclick = function () {
        event.preventDefault();

        if (document.getElementById('userinfo').getAttribute('style') != 'display: block') {
            document.getElementById('throbber').setAttribute('class', 'show');
            var req = new XMLHttpRequest();
            req.open('GET', '/userinfo', true);
            req.addEventListener('load', function () {
                console.log("AJAX accedido");
                if (req.status >= 200 && req.status < 400) {
                    var userinfo = JSON.parse(req.response);
                    console.log(userinfo);
                    document.getElementById('edit_name').value = userinfo.uname;
                    document.getElementById('edit_nick').value = userinfo.unick;
                    document.getElementById('edit_mail').value = userinfo.umail;
                    document.getElementById('throbber').setAttribute('class', 'hide');
                    setStyle('listtasks', 'none');
                    setStyle('newtask', 'none');
                    setStyle('userinfo', 'block');
                } else {
                    console.log(req.status + ' ' + req.statusText);
                }
            });
            req.addEventListener('error', function () {
                console.error('Network error');
            });
            req.send(null);
        } else {
            setStyle('userinfo', 'none');
        };
    };

    document.getElementById('newtask').onclick = function (event) {
        event.preventDefault();
        console.log('Sending new task data');
        var req = new XMLHttpRequest();
        req.open('POST', '/newtask', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            var answer = JSON.parse(req.response);
            if (answer.status == 1) {
                alert('Tarea creada con id:' + answer.taskid);
                document.getElementById('newform').reset();
            } else {
                alert('No se ha podido crear la tarea');
            }
        });
        req.addEventListener('error', function () {
            console.log('SUBMIT error');
        });
        var data = {
            titl: document.getElementById('arttitl').value,
            desc: document.getElementById('artdesc').value,
            exec: document.getElementById('artexec').value,
            date: document.getElementById('artdate').value
        };
        req.send(JSON.stringify(data));
    };

};