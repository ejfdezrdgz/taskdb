window.onload = function () {

    console.log('Pass handler loaded');
    var pass1_signup = document.getElementById("pass1_signup");
    var pass2_signup = document.getElementById("pass2_signup");

    pass2_signup.addEventListener("blur", function () {
        if (pass1_signup.value != pass2_signup.value) {
            document.getElementById("err_mesg").innerHTML = "Both passwords are not the same";
            document.getElementById("err_mesg").setAttribute("style", "display: block");
        } else {
            document.getElementById("btn_signup").disabled = false;
            document.getElementById("err_mesg").setAttribute("style", "display: none");
        }
    });
}