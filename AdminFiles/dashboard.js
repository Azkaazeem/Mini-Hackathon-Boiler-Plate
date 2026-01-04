import supabase from "../config.js";

// ================================================================   Dashboard Page Functionality   ================================================================

// A: Side Bar

let sidebar = document.getElementById("sidebar");

sidebar.innerHTML = `
  <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
    <div class="container-fluid px-4">

      <button class="btn btn-primary d-lg-none me-2" type="button" data-bs-toggle="offcanvas"
        data-bs-target="#sidebarMenu">
        <i class="fa-solid fa-bars"></i>
      </button>

      <a class="navbar-brand fw-bold text-primary d-flex align-items-center gap-2" href="#">
        <i class="fa-solid fa-cube fa-lg"></i> Luxora
      </a>

      <div class="d-flex align-items-center gap-3 ms-auto">
        <div class="input-group d-none d-md-flex" style="width: 250px;">
          <span class="input-group-text bg-light border-end-0"><i class="fa-solid fa-search text-muted"></i></span>
          <input type="text" id="globalSearch" class="form-control bg-light border-start-0" placeholder="Search...">
        </div>

        <a href="#" class="position-relative text-dark">
          <i class="fa-regular fa-bell fs-5"></i>
          <span
            class="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"></span>
        </a>

        <div class="dropdown">
          <a href="#" class="d-flex align-items-center text-decoration-none dropdown-toggle text-dark"
            data-bs-toggle="dropdown">
            <img src="https://ui-avatars.com/api/?name=Azka+Azeem&background=4f46e5&color=fff" alt="" width="32"
              height="32" class="rounded-circle me-2">
            <span class="d-none d-md-inline fw-medium">Azka</span>
          </a>
        </div>
      </div>
    </div>
  </nav>

  <div class="container-fluid pt-5 mt-4">
    <div class="row">
      <div class="col-lg-2 offcanvas-lg offcanvas-start bg-white border-end position-fixed h-100 p-0" tabindex="-1"
        id="sidebarMenu">

        <div class="offcanvas-header border-bottom">
          <h5 class="offcanvas-title fw-bold text-primary">Luxora Menu</h5>
          <button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebarMenu"
            aria-label="Close"></button>
        </div>

        <div class="offcanvas-body d-flex flex-column h-100 p-0" style="overflow-y: auto;">

          <ul class="nav flex-column mt-3 w-100">
            <li class="nav-item">
              <a class="nav-link active d-flex align-items-center gap-3 px-4 py-3" href="dashboard.html">
                <i class="fa-solid fa-chart-pie" style="width: 20px;"></i> Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link d-flex align-items-center gap-3 px-4 py-3" href="./products.html">
                <i class="fa-solid fa-box-open" style="width: 20px;"></i> Products
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link d-flex align-items-center gap-3 px-4 py-3" href="#">
                <i class="fa-solid fa-users" style="width: 20px;"></i> Customers
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link d-flex align-items-center gap-3 px-4 py-3" href="#">
                <i class="fa-solid fa-cart-shopping" style="width: 20px;"></i> Orders
                <span class="badge bg-danger ms-auto rounded-pill">12</span>
              </a>
            </li>
          </ul>

          <div class="mt-auto w-100 p-3 pb-5">
            <hr class="text-muted mb-3">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link d-flex align-items-center gap-3 px-3 py-2" href="#">
                  <i class="fa-solid fa-gear" style="width: 20px;"></i> Settings
                </a>
              </li>
              <li class="nav-item">
                <a href="#" class="nav-link text-danger d-flex align-items-center gap-3 px-3 py-2 fw-bold" id="LogoutBtn">
                  <i class="fa-solid fa-right-from-bracket" style="width: 20px;"></i> Logout
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>
`

// B: Swal function 

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


// C: Logout Functionality

const LogoutBtn = document.getElementById("LogoutBtn");
// console.log(LogoutBtn);

async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    if (!error) {
      Swal.fire({
        title: "Successfully logged out!",
        icon: "success",
        background: "#f9fbfc",
        color: "rgb(132, 0, 255)",
        confirmButtonColor: "rgb(132, 0, 255)",
        confirmButtonText: "Go to Login page",
        padding: "20px",
      }).then(() => {
        location.href = "../login/login.html";
      });
    }
  } catch (err) {
    console.log(err)
  }
}
LogoutBtn && LogoutBtn.addEventListener("click", logout);


// D: Is User Authenticated Or not?

async function protectDashboard() {
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    if (!window.location.href.includes("login.html")) {
      window.location.href = "../login/login.html";
    }
    return;
  }

  const { data: userData } = await supabase
    .from('1.Users')
    .select('role')
    .eq('email', user.email)
    .single();

  if (!userData) return;

  const isDashboardPage = window.location.href.includes("dashboard.html");

  if (userData.role !== 'admin' && isDashboardPage) {
    window.location.href = "./UsersFiles/home.html";
  }
}

protectDashboard();


// E: Search Users

setTimeout(() => {
  const searchInput = document.getElementById("globalSearch");
  if (searchInput) {
    searchInput.addEventListener("keyup", function () {
      let filter = this.value.toLowerCase();
      let rows = document.querySelectorAll("tbody tr");

      rows.forEach((row) => {
        let text = row.textContent.toLowerCase();
        if (text.includes(filter)) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
    });
  }
}, 1000);




















// ================================================================   Product Page Functionality   ================================================================

// F: Add Product colors

const colorContainer = document.getElementById('color-container');
const addColorBtn = document.getElementById('addColorBtn');

addColorBtn.addEventListener('click', () => {
  const div = document.createElement('div');
  div.className = 'd-flex gap-2 mb-2 align-items-center color-row';
  div.innerHTML = `
            <input type="color" class="form-control form-control-color w-100" value="#000000" title="Choose your color">
            <button type="button" class="btn btn-outline-danger remove-color-btn">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
  colorContainer.appendChild(div);

  div.querySelector('.remove-color-btn').addEventListener('click', function () {
    div.remove();
  });
});

document.querySelectorAll('.remove-color-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    this.closest('.color-row').remove();
  });
});



// ================================================================
//             SAVE PRODUCT TO SUPABASE (Final Logic)
// ================================================================

const saveBtn = document.getElementById("saveProductBtn");

if (saveBtn) {
    saveBtn.addEventListener("click", async function() {
        
        // --- 1. Get Values from HTML ---
        const title = document.getElementById("inp-title").value.trim();
        const category = document.getElementById("inp-cat").value;
        const price = document.getElementById("inp-price").value;
        const desc = document.getElementById("inp-desc").value.trim();
        const stock = document.getElementById("inp-stock").value;
        const imageFile = document.getElementById("prodImgInput").files[0];

        // Colors collect karna
        const colorInputs = document.querySelectorAll(".form-control-color");
        const colors = [];
        colorInputs.forEach(input => colors.push(input.value));

        // --- 2. Validation (Check Empty) ---
        if (!title || !category || !price || !desc || !stock || !imageFile) {
            Swal.fire({
                title: "Missing Details!",
                text: "Please fill all fields and select an image.",
                icon: "warning",
                confirmButtonColor: "#4f46e5"
            });
            return;
        }

        // --- 3. Start Loading ---
        Swal.fire({
            title: 'Saving Product...',
            text: 'Please wait while we upload image and data.',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            // --- A. Image Upload Karna ---
            // Note: Supabase mein "product-images" naam ka bucket hona chahiye
            const fileName = `prod_${Date.now()}_${imageFile.name.replace(/\s/g, '')}`;
            
            const { data: uploadData, error: uploadError } = await supabase
                .storage
                .from('product-images') // Make sure ye Bucket bana ho
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            // --- B. Public URL Lena ---
            const { data: urlData } = supabase
                .storage
                .from('product-images')
                .getPublicUrl(fileName);

            const publicImageURL = urlData.publicUrl;

            // --- C. Database mein Insert Karna ---
            // Note: Table columns check kar lena (maine tumhari image se match kiye hain)
            const { error: dbError } = await supabase
                .from('products')
                .insert({
                    product_title: title,      // Column Name: product_title
                    category: category,        // Column Name: category
                    price: Number(price),      // Column Name: price
                    description: desc,         // Column Name: description
                    stock: Number(stock),      // Column Name: stock
                    colors: colors,            // Column Name: colors (Array)
                    image_url: publicImageURL, // Column Name: image_url
                    status: 'Active'           // Default status
                });

            if (dbError) throw dbError;

            // --- D. Success! ---
            await Swal.fire({
                title: "Product Saved!",
                text: "Your product is now live on the store.",
                icon: "success",
                confirmButtonColor: "#4f46e5"
            });

            // Modal band karo aur form clear karo
            location.reload(); // Page refresh taake naya data dikhe

        } catch (error) {
            console.error("Error:", error);
            Swal.fire({
                title: "Error!",
                text: error.message,
                icon: "error",
                confirmButtonColor: "#d33"
            });
        }
    });
}