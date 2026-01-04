import supabase from "./config.js";

// ================================================================
//             HOME PAGE LOGIC (Complete & Fixed)
// ================================================================

// Elements
const userImg = document.getElementById("user-img");
const userName = document.getElementById("user-name");
const welcomeMsg = document.getElementById("welcome-msg");
const postsContainer = document.getElementById("postsContainer");

// Navbar Links
const navHome = document.getElementById("nav-home");
const navMyPosts = document.getElementById("nav-myposts");

let currentUserEmail = "";

// ================= 1. INITIALIZE (Login Check & Load) =================
async function init() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Agar login nahi hai to wapis bhejo
  if (!user) return (window.location.href = "login/login.html");

  currentUserEmail = user.email;

  // Load User Profile
  const { data } = await supabase
    .from("1.Users")
    .select("username, profile_pic")
    .eq("email", user.email)
    .single();

  if (userName) userName.innerText = data?.username || "User";
  if (userImg) {
    userImg.src =
      data?.profile_pic ||
      `https://ui-avatars.com/api/?name=${data?.username}&background=4f46e5&color=fff`;
  }
  if (welcomeMsg) {
    welcomeMsg.innerHTML = `Welcome back, ${data?.username || "User"}! 👋`;
  }

  // Default: Load All Posts
  loadPosts("all");
}
init();

// ================= 2. LOAD POSTS FUNCTION =================
async function loadPosts(filterType) {
  if (!postsContainer) return;

  postsContainer.innerHTML =
    '<div class="text-center py-5"><div class="spinner-border text-primary"></div></div>';

  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (filterType === "my") {
    query = query.eq("user_email", currentUserEmail);
  }

  const { data: posts, error } = await query;

  if (error) {
    postsContainer.innerHTML = `<p class="text-danger text-center">Error: ${error.message}</p>`;
    return;
  }

  if (posts.length === 0) {
    postsContainer.innerHTML = `<p class="text-muted text-center py-5">No posts found.</p>`;
    return;
  }

  postsContainer.innerHTML = "";

  posts.forEach((post) => {
    const postUser = post.user_email ? post.user_email.split("@")[0] : "User";

    // Action Buttons Logic
    let actionButtons = "";

    if (filterType === "my") {
      // My Posts tab mein Edit/Delete dikhao
      actionButtons = `
            <div class="d-flex gap-2 mt-3">
                <button class="btn btn-sm btn-outline-primary w-100" onclick="openEditModal('${post.id}')">
                    <i class="fa-solid fa-pen"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger w-100" onclick="deletePost('${post.id}', '${post.image_url}')">
                    <i class="fa-solid fa-trash"></i> Delete
                </button>
            </div>
        `;
    } else {
      // Home tab mein "Read More" dikhao (Link FIXED: detail.html)
      actionButtons = `
            <a href="detail.html?id=${post.id}" class="btn btn-link text-primary p-0 text-decoration-none fw-bold small mt-3">
                Read More <i class="fa-solid fa-arrow-right ms-1"></i>
            </a>
        `;
    }

    const postHTML = `
        <div class="col-md-6 col-lg-4 fade-in">
            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden post-card">
                <div class="card-img-wrap">
                    <img src="${
                      post.image_url
                    }" class="card-img-top" style="height: 200px; object-fit: cover;">
                </div>
                <div class="card-body p-4 d-flex flex-column">
                    <div class="d-flex align-items-center mb-3">
                         <img src="https://ui-avatars.com/api/?name=${postUser}&background=random" class="rounded-circle me-2" width="25">
                        <small class="text-muted fw-medium">${postUser} • ${new Date(
      post.created_at
    ).toLocaleDateString()}</small>
                    </div>
                    <h5 class="card-title fw-bold mb-2">${post.title}</h5>
                    <p class="card-text text-muted small line-clamp-3 mb-auto">${
                      post.content
                    }</p>
                    
                    ${actionButtons}
                </div>
            </div>
        </div>
    `;
    postsContainer.innerHTML += postHTML;
  });
}

// Global scope mein functions (HTML onclick ke liye)
window.deletePost = deletePost;
window.openEditModal = openEditModal;

// ================= 3. DELETE POST FUNCTIONALITY =================
async function deletePost(postId, imageUrl) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      Swal.showLoading();

      // 1. Delete Image
      if (imageUrl) {
        const fileName = imageUrl.split("/").pop();
        await supabase.storage.from("post-images").remove([fileName]);
      }

      // 2. Delete Data
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;

      await Swal.fire("Deleted!", "Your post has been deleted.", "success");
      loadPosts("my");
    } catch (error) {
      Swal.fire("Error!", error.message, "error");
    }
  }
}

// ================= 4. EDIT POST FUNCTIONALITY =================

// A. Modal Open
async function openEditModal(postId) {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error) {
    Swal.fire("Error", "Could not fetch post details", "error");
    return;
  }

  document.getElementById("edit-post-id").value = post.id;
  document.getElementById("edit-old-image").value = post.image_url;
  document.getElementById("edit-post-title").value = post.title;
  document.getElementById("edit-post-content").value = post.content;
  document.getElementById("current-img-name").innerText =
    "Current Image: " + (post.image_url ? "Uploaded" : "None");

  const myModal = new bootstrap.Modal(document.getElementById("editPostModal"));
  myModal.show();
}

// B. Save Changes
const editForm = document.getElementById("editPostForm");
if (editForm) {
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const updateBtn = document.getElementById("updateBtn");
    updateBtn.innerHTML =
      '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';
    updateBtn.disabled = true;

    const postId = document.getElementById("edit-post-id").value;
    const oldImageUrl = document.getElementById("edit-old-image").value;
    const title = document.getElementById("edit-post-title").value;
    const content = document.getElementById("edit-post-content").value;
    const imageFile = document.getElementById("edit-post-image").files[0];

    let finalImageUrl = oldImageUrl;

    try {
      if (imageFile) {
        if (oldImageUrl) {
          const oldFileName = oldImageUrl.split("/").pop();
          await supabase.storage.from("post-images").remove([oldFileName]);
        }
        const {
          data: { user },
        } = await supabase.auth.getUser();
        const newFileName = `post_${user.id}_${Date.now()}`;
        await supabase.storage
          .from("post-images")
          .upload(newFileName, imageFile);
        const {
          data: { publicUrl },
        } = supabase.storage.from("post-images").getPublicUrl(newFileName);
        finalImageUrl = publicUrl;
      }

      const { error } = await supabase
        .from("posts")
        .update({
          title: title,
          content: content,
          image_url: finalImageUrl,
        })
        .eq("id", postId);

      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Post Updated!",
        timer: 1500,
        showConfirmButton: false,
      });

      const modalEl = document.getElementById("editPostModal");
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal.hide();

      loadPosts("my");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      updateBtn.innerHTML = "Update Post";
      updateBtn.disabled = false;
    }
  });
}

// ================= 5. CREATE POST (Re-added) =================
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

      await supabase.storage.from("post-images").upload(fileName, imageFile);
      const {
        data: { publicUrl },
      } = supabase.storage.from("post-images").getPublicUrl(fileName);

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

      postForm.reset();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("createPostModal")
      );
      if (modal) modal.hide();

      loadPosts("all");
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    } finally {
      publishBtn.innerHTML = "Publish Post";
      publishBtn.disabled = false;
    }
  });
}

// ================= 6. PROFILE UPLOAD & NAVBAR =================
const profileTrigger = document.getElementById("profile-trigger");
const profileUpload = document.getElementById("profile-upload");

if (profileTrigger && profileUpload) {
  profileTrigger.addEventListener("click", () => profileUpload.click());

  profileUpload.addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      if (userImg) userImg.src = "https://i.gifer.com/ZZ5H.gif";
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const fileName = `dp_${user.id}_${Date.now()}`;
      await supabase.storage.from("profiles").upload(fileName, file);
      const {
        data: { publicUrl },
      } = supabase.storage.from("profiles").getPublicUrl(fileName);
      await supabase
        .from("1.Users")
        .update({ profile_pic: publicUrl })
        .eq("email", user.email);
      if (userImg) userImg.src = publicUrl;
      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
      });
    } catch (err) {
      Swal.fire("Error", "Upload failed", "error");
    }
  });
}

if (navHome) {
  navHome.addEventListener("click", (e) => {
    e.preventDefault();
    loadPosts("all");
    navHome.classList.add("active");
    navMyPosts?.classList.remove("active");
  });
}
if (navMyPosts) {
  navMyPosts.addEventListener("click", (e) => {
    e.preventDefault();
    loadPosts("my");
    navMyPosts.classList.add("active");
    navHome?.classList.remove("active");
  });
}

document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  await supabase.auth.signOut();
  window.location.href = "login/login.html";
});
