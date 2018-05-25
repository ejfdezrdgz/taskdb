window.onload = function () {
    document.getElementById('btnAjax').onclick = function () {
        var req = new XMLHttpRequest();
        req.open('GET', '/ajax', true);
        req.addEventListener('load', function () {
            if (req.status >= 200 && req.status < 400) {
                document.getElementById('data').innerHTML = req.responseText;
            } else {
                console.error(req.status + " " + req.statusText);
            };
        });
        req.addEventListener('error', function () {
            console.error('Network error');
        });
        req.send(null);
    };
};