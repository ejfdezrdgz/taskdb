window.onload = function () {

    reloadTable();

    document.getElementById('createtask').onclick = function () {
        setStyle('formtable', 'block');
        setStyle('listtasks', 'none');
        setStyle('updatetask', 'none');
        setStyle('userinfo', 'none');
    };

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
        if (getStyle('listtasks') == 'display: none') {
            setStyle('listtasks', 'block');
            setStyle('updatetask', 'none');
            setStyle('userinfo', 'none');
            setStyle('formtable', 'none')
        } else {
            setStyle('listtasks', 'none');
        }
    };

    document.getElementById('uinfo_editsubmit').onclick = function (event) {
        event.preventDefault();
        console.log('Sending POST data');
        let req = new XMLHttpRequest();
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
        let data = {
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
            let req = new XMLHttpRequest();
            req.open('GET', '/userinfo', true);
            req.addEventListener('load', function () {
                if (req.status >= 200 && req.status < 400) {
                    let userinfo = JSON.parse(req.response);
                    document.getElementById('edit_name').value = userinfo.uname;
                    document.getElementById('edit_nick').value = userinfo.unick;
                    document.getElementById('edit_mail').value = userinfo.umail;
                    document.getElementById('throbber').setAttribute('class', 'hide');
                    setStyle('listtasks', 'none');
                    setStyle('updatetask', 'none');
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
        let req = new XMLHttpRequest();
        req.open('POST', '/addtask', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            let answer = JSON.parse(req.response);
            if (answer.status == 1) {
                document.getElementById('newform').reset();
                setStyle('formtable', 'none');
                setStyle('listtasks', 'block');
            } else {
                alert('No se ha podido crear la tarea');
            };
            reloadTable();
        });
        req.addEventListener('error', function () {
            console.log('SUBMIT error');
        });
        let data = {
            titl: document.getElementById('arttitl').value,
            desc: document.getElementById('artdesc').value,
            exec: document.getElementById('artexec').value,
            date: document.getElementById('artdate').value
        };
        req.send(JSON.stringify(data));
    };

    document.getElementById('updtask').onclick = function (event) {
        event.preventDefault();
        let req = new XMLHttpRequest();
        req.open('POST', '/edit', true);
        req.setRequestHeader('Content-Type', 'application/json');
        req.addEventListener('load', function () {
            let answer = JSON.parse(req.response);
            if (answer.status == 1) {
                document.getElementById('updform').reset();
                setStyle('listtasks', 'block');
                setStyle('updatetask', 'none');
            } else {
                alert('No se ha podido editar la tarea');
            };
            reloadTable();
        });
        req.addEventListener('error', function () {
            console.log('SUBMIT error');
        });
        let data = {
            taskid: document.getElementById('updtaskid').value,
            titl: document.getElementById('updtitl').value,
            desc: document.getElementById('upddesc').value,
            exec: document.getElementById('updexec').value
        };
        req.send(JSON.stringify(data));
    };

    document.getElementById('updcancel').onclick = function (event) {
        setStyle('listtasks', 'block');
        setStyle('updatetask', 'none');
        document.getElementById('updform').reset();
    };

    document.getElementById('reloadlist').onclick = function (event) {
        event.preventDefault();
        reloadTable();
    };

    document.getElementById('avatar').onchange = function (event) {
        let file = event.target.files;
        let reader = new FileReader();
        reader.onload = (function (read) {
            return function (e) {
                console.log(e.target.result);
                document.getElementById('avatar_preview').innerHTML = ['<img class="thumb" src="', e.target.result, '" title="', escape(read.name), '"/>'].join('');
            };
        })(file);
        reader.readAsDataURL(file[0]);
    };

};

function getStyle(elementId) {
    return document.getElementById(elementId).getAttribute('style');
};

function setStyle(elementId, displayType) {
    document.getElementById(elementId).setAttribute('style', 'display: ' + displayType);
};

function reloadTable() {
    let req = new XMLHttpRequest();
    req.open('POST', '/reload', true);
    req.addEventListener('load', function (err, result) {
        showTasklist(JSON.parse(req.response));
    });
    req.addEventListener('error', function (err) {
    });
    req.send(null);
};

function showTasklist(tasklist) {
    let content = '';
    tasklist.forEach(element => {
        switch (element.permission) {
            case 0:
                divOptions = `<div></div>`;
                break;
            case 1:
                divOptions = `
                <div>
                    <i id="optEdit" class="far fa-edit" onclick="taskEdit(${element.id})"></i>
                    <i id="optDel" class="far fa-trash-alt" onclick="taskDelete(${element.id})"></i>
                </div>`;
                break;
            case 2:
                divOptions = `
                <div>
                    <i id="optComp" class="fas fa-check" onclick="taskComplete(${element.id})"></i>
                </div>`;
                break;
            case 3:
                divOptions = `
                <div>
                    <i id="optComp" class="fas fa-check" onclick="taskComplete(${element.id})"></i>
                    <i id="optEdit" class="far fa-edit" onclick="taskEdit(${element.id})"></i>
                    <i id="optDel" class="far fa-trash-alt" onclick="taskDelete(${element.id})"></i>
                </div>`;
                break;
        };

        let block = `<article>
            <div class="artheader">
                <div class="artdiv">
                    <p class="label">Title</p>
                    <p>${element.title}</p>
                </div>
                <div class="artdiv">
                    <p class="label">Author</p>
                    <p>${element.author}</p>
                </div>
                <div class="artdiv">
                    <p class="label">Executor</p>
                    <p>${element.executor}</p>
                </div>
                <div class="artdiv">
                    <p class="label">Date</p>
                    <p>${element.date}</p>
                </div>
            </div>
            <hr>
            <div class="artbody">
                <div>
                    <p class="label">Description</p>
                    <p>${element.description}</p>
                </div>
                <div class="artopt">
                    <p class="label">Options</p>
                    ${divOptions}
                </div>
            </div>
        </article>`;
        content += block;
    });
    document.getElementById('arttable').innerHTML = content;
};

function taskComplete(id) {
    let req = new XMLHttpRequest();
    let url = '/complete?id=' + id;
    req.open('GET', url, true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            let result = JSON.parse(req.response);
            if (result.status == 1) {
                reloadTable();
            }
        } else {
            console.log(req.status + ' ' + req.statusText);
        }
    });
    req.addEventListener('error', function () {
        console.error('Network error');
    });
    req.send(null);
}

function taskDelete(id) {
    let req = new XMLHttpRequest();
    let url = '/delete?id=' + id;
    req.open('GET', url, true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            let result = JSON.parse(req.response);
            if (result.status == 1) {
                reloadTable();
            }
        } else {
            console.log(req.status + ' ' + req.statusText);
        }
    });
    req.addEventListener('error', function () {
        console.error('Network error');
    });
    req.send(null);
};

function taskEdit(id) {
    let req = new XMLHttpRequest();
    let url = '/edit?id=' + id;
    req.open('GET', url, true);
    req.addEventListener('load', function () {
        if (req.status >= 200 && req.status < 400) {
            let result = JSON.parse(req.response);
            document.getElementById('updtaskid').value = result.task.tid;
            document.getElementById('updtitl').value = result.task.titl;
            document.getElementById('upddesc').value = result.task.tdesc;
            document.getElementById('updexec').value = result.task.texec;
            setStyle('updatetask', 'block');
            setStyle('listtasks', 'none');
        } else {
            console.log(req.status + ' ' + req.statusText);
        }
    });
    req.addEventListener('error', function () {
        console.error('Network error');
    });
    req.send(null);
};