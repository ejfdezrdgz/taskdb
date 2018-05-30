window.onload = function () {

    function getStyle(elementId) {
        return document.getElementById(elementId).getAttribute('style');
    };

    function setStyle(elementId, displayType) {
        document.getElementById(elementId).setAttribute('style', 'display: ' + displayType);
    };

    function showTasklist(tasklist) {
        let content = '';
        tasklist.forEach(element => {
            let block = `<article>
            <div class="artheader">
                <div class="artdiv">
                    <p>Title</p>
                    <p>${element.title}</p>
                </div>
                <div class="artdiv">
                    <p>Author</p>
                    <p>${element.author}</p>
                </div>
                <div class="artdiv">
                    <p>Executor</p>
                    <p>${element.executor}</p>
                </div>
                <div class="artdiv">
                    <p>Date</p>
                    <p>${element.date}</p>
                </div>
            </div>
            <hr>
            <div class="artdiv">
                <p>Description</p>
                <p>${element.description}</p>
            </div>
            </article>`;
            content += block;
        });
        document.getElementById('arttable').innerHTML = content;
    };

    function reloadTable() {
        var req = new XMLHttpRequest();
        req.open('POST', '/reload', true);
        req.addEventListener('load', function (err, result) {
            showTasklist(JSON.parse(req.response));
        });
        req.addEventListener('error', function (err) {
        });
        req.send(null);
    };

    document.getElementById('createtask').onclick = function () {
        setStyle('formtable', 'block');
        setStyle('listtasks', 'none');
        setStyle('userinfo', 'none');
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
        reloadTable();
        if (getStyle('listtasks') == 'display: block') {
            setStyle('listtasks', 'none');
        } else {
            setStyle('listtasks', 'block');
            setStyle('userinfo', 'none');
            setStyle('formtable', 'none')
        }
    };

    document.getElementById('edit_submit').onclick = function (event) {
        event.preventDefault();
        console.log('Sending POST data');
        var req = new XMLHttpRequest();
        req.open('POST', '/userinfo', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
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
            n1pass: document.getElementById('new_pass1').value,
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
                if (req.status >= 200 && req.status < 400) {
                    var userinfo = JSON.parse(req.response);
                    document.getElementById('edit_name').value = userinfo.uname;
                    document.getElementById('edit_nick').value = userinfo.unick;
                    document.getElementById('edit_mail').value = userinfo.umail;
                    document.getElementById('throbber').setAttribute('class', 'hide');
                    setStyle('listtasks', 'none');
                    setStyle('formtable', 'none');
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

    document.getElementById('addtask').onclick = function (event) {
        event.preventDefault();
        var req = new XMLHttpRequest();
        req.open('POST', '/addtask', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            var answer = JSON.parse(req.response);
            if (answer.status == 1) {
                alert('Tarea creada con id:' + answer.taskid);
                document.getElementById('newform').reset();
            } else {
                alert('No se ha podido crear la tarea');
            };
            reloadTable();
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

    document.getElementById('reloadlist').onclick = function (event) {
        event.preventDefault();
        reloadTable();
    };

};