import supabase from "./config.js";

// ================================================================   SignUp Page Functionality   ================================================================

function showAlert(title, text, icon = "warning") {
  return Swal.fire({
    title: title,
    text: text,
    icon: icon,
    confirmButtonColor: "#4f46e5",
    draggable: true,
    customClass: { popup: "glass-alert" },
  });
}

//  ---------------   A: Get Input IDs   ---------------

let sUName = document.getElementById("name");
let sEmail = document.getElementById("email");
let sPass = document.getElementById("password");
let sPhn = document.getElementById("ph-no.");
let sBtn = document.querySelector(".btn-signup");

//  ---------------   B: Password toggle button   ---------------

const togglePass = document.querySelector(".toggle-password");

togglePass &&
  togglePass.addEventListener("click", () => {
    if (sPass.type === "password") {
      sPass.type = "text";
      togglePass.classList.remove("fa-eye-slash");
      togglePass.classList.add("fa-eye");
    } else {
      sPass.type = "password";
      togglePass.classList.remove("fa-eye");
      togglePass.classList.add("fa-eye-slash");
    }
  });

//  ---------------   C: Form functionality   ---------------

async function signUp(e) {
  e.preventDefault();

  if (!sUName.value.trim() || !sEmail.value.trim() || !sPass.value.trim() || !sPhn.value.trim()) {
    showAlert("All fields required!", "Please fill all fields before signup.");
    return;
  }

  if (sPhn.value.length !== 11) {
    showAlert("Incorrect Phone Number!", "Phone number must be exactly 11 digits.");
    return;
  }

  if (sPass.value.length < 6) {
    showAlert("Weak Password!", "Password must be at least 6 characters.");
    return;
  }

  if (!sEmail.value.includes("@") || !sEmail.value.includes(".")) {
    showAlert("Invalid Email", "Please enter a valid Gmail address.");
    return;
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: sEmail.value,
      password: sPass.value,
      options: {
        data: {
          user_name: sUName.value,
          phone_no: sPhn.value,
        },
      },
    });

    if (error) {
      showAlert("Signup Failed!", error.message, "error");
    } else {
      showAlert("Signup successfully!", "Welcome to Our Platform", "success").then(
        async () => {
          await supabase.from("1.Users").insert({
            username: sUName.value,
            email: sEmail.value,
            phone: sPhn.value,
            role: "user",
          });
          // Signup ke baad Login page par bhejna behtar hai
          window.location.href = "login/login.html"; 
        }
      );
    }
  } catch (err) {
    console.log(err);
    showAlert("Error", err.message, "error");
  }
}

sBtn && sBtn.addEventListener("click", signUp);