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

    document.getElementById('edituser').onclick = function () {
        event.preventDefault();

        if (document.getElementById('userinfo').getAttribute('style') == 'display: block') {
            var req = new XMLHttpRequest();
            req.open('GET', '/userinfo', true);
            req.addEventListener('load', function () {
                console.log("AJAX accedido");
                if (req.status >= 200 && req.status < 400) {
                    console.log(req.response);
                } else {
                    console.log(req.status + ' ' + req.statusText);
                }
            });
            req.addEventListener('error', function () {
                console.error('Network error');
            });
            req.send(null);

            setStyle('userinfo', 'none');
        } else {
            setStyle('listtasks', 'none');
            setStyle('newtask', 'none');
            setStyle('userinfo', 'block');
        };
    };

};