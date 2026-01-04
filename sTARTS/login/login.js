import supabase from "../config.js";

// ================================================================   Login Page Functionality   ================================================================

function showAlert(title, text, icon = "warning") {
    return Swal.fire({
        title: title,
        text: text,
        icon: icon,
        confirmButtonColor: "#4f46e5",
        draggable: true,
        customClass: { popup: "glass-alert" }
    });
}
//  ---------------   A: Get Input IDs   ---------------

let lEmail = document.getElementById("email");
let lPass = document.getElementById("password");
let lBtn = document.querySelector("#login-btn");



//  ---------------   B: Password toggle button   ---------------

const togglePass = document.querySelector(".toggle-password")

function toggleIcon() {
    if (!lPass) return;
    if (lPass.type === "password") {
        lPass.type = "text"
        togglePass.classList.remove("fa-eye-slash")
        togglePass.classList.add("fa-eye")
    } else {
        lPass.type = "password"
        togglePass.classList.remove("fa-eye")
        togglePass.classList.add("fa-eye-slash")
    }
}

togglePass && togglePass.addEventListener("click", toggleIcon)

//  ---------------   C: Form functionality   ---------------

async function login(e) {
    e.preventDefault();

    let email = lEmail.value.trim();
    let pass = lPass.value.trim();

    //   1: fields required functionality

    if (!email) {
        showAlert("Email Required!", "Please enter your email address.");
        return;
    }

    //   2: Email functionality

    if (!email.includes("@") || !email.includes(".")) {
        showAlert("Please enter a valid Gmail address.", "Example: yourname@gmail.com")
            .then(() => {
                lEmail.value = "";
                lPass.value = "";
            })
        return;
    }

    //   3: Password functionality

    if (!pass) {
        showAlert("Password field is empty.", "Please enter your password.")
        return;
    }

    //   4: Password length functionality

    if (pass.length < 6) {
        showAlert("Invalid password!", "Password must be at least 6 characters long.")
            .then(() => {
                lPass.value = "";
            })
        return;
    }


    //   5: Try Catch Block functionality

    try {
        Swal.fire({
            title: 'Logging in...',
            didOpen: () => Swal.showLoading()
        });

        // 6: Save Input Value Auth Table

        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email,
            password: pass
        });

        if (authError) throw authError;

        // 7: Fetch Role From Supabase

        const { data: userData, error: dbError } = await supabase
            .from('1.Users')
            .select('role')
            .eq('email', email)
            .single();

        console.log(userData);

        if (dbError) throw dbError;

        // 8: If role Equal to Admin Gona Dashboard

        if (!userData) {
        } else {
            showAlert("Login Success!", "Redirecting to Home...", "success")
                .then(() => {
                    location.href = "../home.html";
                });
        }

        //  ---------------   D: System Error Swal   ---------------

    } catch (err) {
        console.error("Login Error:", err);
        showAlert("Login Failed", err.message || "Invalid credentials", "error")

    }
}

lBtn && lBtn.addEventListener("click", login);

lBtn.disabled = true;
lBtn.innerText = "Loading...";

lBtn.disabled = false;
lBtn.innerText = "Log in";



//    FORGET PASSWORD FUNCINALITY


const resetBtn = document.getElementById("resetBtn");
const resEmail = document.getElementById("reset-email");


async function reset(e) {
    e.preventDefault();

    if (!resEmail.value) {
        console.log("Input is Empty!!");
        showAlert("Email required!", "Please Enter your Email.")
        return;
    }

    try {


        const { data, error } = await supabase.auth.resetPasswordForEmail(resEmail.value, {
            redirectTo: "https://azkaazeem.github.io/Login-page---Update-Password-page"

        });

        if (error) {
            console.log('supabase Error:' + ' ' + error.message);
            showAlert("Error!", error.message, "error")
                .then(() => {
                    resEmail.value = "";
                })


        } else {
            console.log('Reset link sent to you Email..')
            showAlert("Success!", "Reset link sent to you Email..", "success")
        }

    } catch (err) {
        console.log(err)
        Swal.fire({
            title: "System error!",
            html: `Something went wrong internally! <br></br> <b>${err.message || "Unknown error"}</b>`,
            icon: "error",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "Report issue",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        })
            .then(() => {
                resEmail.value = "";
            })
    }
}


resetBtn && resetBtn.addEventListener("click", reset)







//      UPDATE PASSWORD FUNCTIONALITY

let newPassInp = document.getElementById("newPass");
let conPassInp = document.getElementById("confirmPass");
let ubdBtn = document.getElementById("updatePassBtn");


async function newPass(e) {
    e.preventDefault();

    console.log("Button is clicked!!!!");

    if (!newPassInp.value && !conPassInp.value) {
        console.log("Input is Empty!!");
        showAlert("Password fields required!", "Please Enter New password and Confirm password.")
        return;
    }

    if (newPassInp.value !== conPassInp.value) {
        console.log("Passwords are not equal!!");
        showAlert("Password Do Not Match", "The New Password and Confirm Password fields must be identical..")
        return;
    }


    try {

        const { data, error } = await supabase.auth.updateUser({
            password: newPassInp.value
        });

        if (error) {
            console.log(error.message);
            showAlert("Updation Failed!", error.message, "error")
                .then(() => {
                    newPassInp.value = "";
                    conPassInp.value = "";
                })


        } else {
            showAlert("Success!", "Your password has been updated successfully. Redirecting to login.", "success")
                .then(() => {
                    location.href = 'https://azkaazeem.github.io/Login-page/';
                });
        }

    } catch (err) {
        console.log(err)
        Swal.fire({
            title: "System error!",
            html: `Something went wrong internally! <br></br> <b>${err.message || "Unknown error"}</b>`,
            icon: "error",
            background: "#f9fbfc",
            color: "#4f46e5",
            confirmButtonColor: "#4f46e5",
            confirmButtonText: "Report issue",
            padding: "20px",
            borderRadius: "15px",
            customClass: {
                popup: "glass-alert"
            }
        })
            .then(() => {
                newPassInp.value = "";
                conPassInp.value = "";

            })
    }
}

ubdBtn && ubdBtn.addEventListener("click", newPass)


// SHOW/HIDE PASSWORD TOGGLE  for update Password

let toggles = document.querySelectorAll(".toggle-password");

toggles && toggles.forEach(toggle => {

    function toggIcon() {
        let id = toggle.getAttribute("data-target");
        let input = document.getElementById(id);

        if (input.type === "password") {
            input.type = "text";
            toggle.classList.replace("fa-eye-slash", "fa-eye");
        } else {
            input.type = "password";
            toggle.classList.replace("fa-eye", "fa-eye-slash");
        }

        console.log("Cutie Eye Icon is clicked!!!!");


    }

    toggle && toggle.addEventListener("click", toggIcon)
}

)

// --- OAuth Functions ---

// async function signInWithGoogle() {
//     const { error } = await supabase.auth.signInWithOAuth({
//         provider: 'google',
//         options: {
//             redirectTo: window.location.origin + '/home.html',
//         },
//     });
//     if (error) console.error("Google Login Error:", error.message);
// }

// async function signInWithGithub() {
//     const { error } = await supabase.auth.signInWithOAuth({
//         provider: 'github',
//         options: {
//             redirectTo: window.location.origin + '/home.html',
//         },
//     });
//     if (error) console.error("Github Login Error:", error.message);
// }

// const googleLoginBtn = document.querySelector(".btn-social.google");
// const githubLoginBtn = document.querySelector(".btn-social.github");

// if (googleLoginBtn) {
//     googleLoginBtn.addEventListener("click", signInWithGoogle);
// }

// if (githubLoginBtn) {
//     githubLoginBtn.addEventListener("click", signInWithGithub);
// }