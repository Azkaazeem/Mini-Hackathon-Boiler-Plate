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

// console.log(sUName);
// console.log(sEmail);
// console.log(sPass);
// console.log(sPhn);
// console.log(sBtn);

//  ---------------   B: Password toggle button   ---------------

const togglePass = document.querySelector(".toggle-password");
// console.log(togglePass);

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
  console.log("Function Work Best!");

  //   1: fields required functionality

  if (
    !sUName.value.trim() ||
    !sEmail.value.trim() ||
    !sPass.value.trim() ||
    !sPhn.value.trim()
  ) {
    showAlert("All fields required!", "Please fill all fields before signup.");
    return;
  }

  //   2: Phone No Length functionality

  if (sPhn.value.length !== 11) {
    showAlert(
      "Incorrect Phone Number!",
      "Phone number must be exactly 11 digits."
    ).then(() => {
      sPhn.value = "";
    });
    return;
  }

  //   3: Password length functionality

  if (sPass.value.length < 6) {
    showAlert(
      "Incorrect Phone Number!",
      "Password must be at least 6 characters."
    ).then(() => {
      sPass.value = "";
    });
    return;
  }

  //   4: Email functionality

  if (!sEmail.value.includes("@") || !sEmail.value.includes(".")) {
    showAlert(
      "Please enter a valid Gmail address.",
      "Example: yourname@gmail.com"
    ).then(() => {
      sEmail.value = "";
      sPass.value = "";
    });
    return;
  }

  //   5: Try Catch Block functionality

  try {
    //   6: Fetch Data from Supabase functionality

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
    console.log(data);

    //   7: If Error Display functionality

    if (error) {
      console.log(error);
      showAlert("Signup Failed!", error.message, "error").then(() => {
        sUName.value = "";
        sEmail.value = "";
        sPass.value = "";
        sPhn.value = "";
      });
      return;

      //   8: Else Data SuccessFul Store functionality
    } else {
      showAlert(
        "Signup successfully!",
        "Welcome to Our Platform",
        "success"
      ).then(
        //  ---------------   D: Inserting Data in table   ---------------

        async () => {
          const { error } = await supabase.from("1.Users").insert({
            username: sUName.value,
            email: sEmail.value,
            phone: sPhn.value,
            role: "user",
          });
          window.location.href = "home.html";
        }
      );

      if (error) {
        console.log(`supabase error ${error}`); // If Error In Inserting Data
      } else {
        console.log("data insert successfully!!"); // Else Data Insert In supabase Table
      }
    }
  } catch (error) {
    //  ---------------   E: System Error Swal   ---------------

    console.log(err);
    Swal.fire({
      title: "",
      html: `Something went wrong internally! <br></br> <b>${
        err.message || "Unknown error"
      }</b>`,
      icon: "error",
      background: "#f9fbfc",
      color: "#4f46e5",
      confirmButtonColor: "#4f46e5",
      confirmButtonText: "Report issue",
      padding: "20px",
      borderRadius: "15px",
      customClass: {
        popup: "glass-alert",
      },
    }).then(() => {
      sUName.value = "";
      sEmail.value = "";
      sPass.value = "";
      sPhn.value = "";
    });
  }
}

sBtn && sBtn.addEventListener("click", signUp);

// ================================================================   Home Page Functionality   ================================================================
// Elements
const userImg = document.getElementById("user-img");
const userName = document.getElementById("user-name");
const welcomeMsg = document.getElementById("welcome-msg");
const postsContainer = document.getElementById("postsContainer");

// Navbar Links
const navHome = document.getElementById("nav-home");
const navMyPosts = document.getElementById("nav-myposts");

let currentUserEmail = ""; // Current user ka email store karenge

// ================= 1. INITIALIZE (Login Check & Load) =================
async function init() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return (window.location.href = "login/login.html");

  currentUserEmail = user.email; // Email save kar li filter ke liye

  // User Data Load
  const { data } = await supabase
    .from("1.Users")
    .select("username, profile_pic")
    .eq("email", user.email)
    .single();

  if (userName) userName.innerText = data?.username || "User";
  if (userImg)
    userImg.src =
      data?.profile_pic ||
      `https://ui-avatars.com/api/?name=${data?.username}&background=4f46e5&color=fff`;
  if (welcomeMsg)
    welcomeMsg.innerHTML = `Welcome back, ${data?.username || "User"}! 👋`;

  // Shuru mein Sab Posts dikhao (Home)
  loadPosts("all");
}
init();

// ================= 2. LOAD POSTS FUNCTION (Magic Logic) =================
async function loadPosts(filterType) {
  postsContainer.innerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  // Agar "My Posts" click hua hai, to filter lagao
  if (filterType === "my") {
    query = query.eq("user_email", currentUserEmail);
  }

  const { data: posts, error } = await query;

  if (error) {
    postsContainer.innerHTML = `<p class="text-danger text-center">Error loading posts: ${error.message}</p>`;
    return;
  }

  if (posts.length === 0) {
    postsContainer.innerHTML = `<p class="text-muted text-center py-5">No posts found. Create one now!</p>`;
    return;
  }

  // Render Posts
  postsContainer.innerHTML = "";
  posts.forEach((post) => {
    const postHTML = `
            <div class="col-md-6 col-lg-4 fade-in">
                <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden post-card">
                    <div class="card-img-wrap">
                        <img src="${
                          post.image_url
                        }" class="card-img-top" alt="Post Image">
                    </div>
                    <div class="card-body p-4">
                        <div class="d-flex align-items-center mb-3">
                             <img src="https://ui-avatars.com/api/?name=${
                               post.user_email
                             }&background=random" class="rounded-circle me-2" width="25">
                            <small class="text-muted fw-medium">${
                              post.user_email.split("@")[0]
                            } • ${new Date(
      post.created_at
    ).toLocaleDateString()}</small>
                        </div>
                        <h5 class="card-title fw-bold mb-2">${post.title}</h5>
                        <p class="card-text text-muted small line-clamp-3">${
                          post.content
                        }</p>
                    </div>
                    <div class="card-footer bg-white border-0 px-4 pb-4 pt-0">
                        <button class="btn btn-link text-primary p-0 text-decoration-none fw-bold small">Read More <i class="fa-solid fa-arrow-right ms-1"></i></button>
                    </div>
                </div>
            </div>
        `;
    postsContainer.innerHTML += postHTML;
  });
}

// ================= 3. NAVBAR CLICK EVENTS =================
if (navHome) {
  navHome.addEventListener("click", (e) => {
    e.preventDefault();
    navHome.classList.add("active");
    navMyPosts.classList.remove("active");
    loadPosts("all"); // Saari Posts
  });
}

if (navMyPosts) {
  navMyPosts.addEventListener("click", (e) => {
    e.preventDefault();
    navMyPosts.classList.add("active");
    navHome.classList.remove("active");
    loadPosts("my"); // Sirf Meri Posts
  });
}

// ================= 4. CREATE POST FUNCTIONALITY =================
const postForm = document.getElementById("createPostForm");
if (postForm) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const publishBtn = document.getElementById("publishBtn");
    publishBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Publishing...';
    publishBtn.disabled = true;

    const title = document.getElementById("post-title").value;
    const content = document.getElementById("post-content").value;
    const imageFile = document.getElementById("post-image").files[0];

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const fileName = `post_${user.id}_${Date.now()}`;

      // Upload Image
      await supabase.storage.from("post-images").upload(fileName, imageFile);
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

      // Save Post
      const { error } = await supabase.from("posts").insert({
        title: title,
        content: content,
        image_url: publicUrl,
        user_id: user.id,
        user_email: user.email,
      });

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Published!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Form Reset & Reload Posts
      postForm.reset();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("createPostModal")
      );
      modal.hide();

      // Agar "My Posts" tab khula hai to wahi reload karo, warna All reload karo
      if (navMyPosts.classList.contains("active")) {
        loadPosts("my");
      } else {
        loadPosts("all");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      publishBtn.innerHTML = "Publish Post";
      publishBtn.disabled = false;
    }
  });
}

// ================= 5. PROFILE UPLOAD & LOGOUT (Same as before) =================
// (Profile aur Logout ka code wohi purana rahega jo pichli baar diya tha)
const profileTrigger = document.getElementById("profile-trigger");
const profileUpload = document.getElementById("profile-upload");
if (profileTrigger && profileUpload) {
  profileTrigger.addEventListener("click", () => profileUpload.click());
  profileUpload.addEventListener("change", async (e) => {
    /* ... Purana Code ... */
  });
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  Swal.fire({
    title: "Logout?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes",
  }).then(async (result) => {
    if (result.isConfirmed) {
      await supabase.auth.signOut();
      window.location.href = "login/login.html";
    }
  });
});
