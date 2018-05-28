window.onload = function () {
    document.getElementById("nick_login").addEventListener("focus", function () {
        document.getElementById("err_login").setAttribute("class", "hide");
    });
};