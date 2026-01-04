import supabase from "./config.js";

const contentArea = document.getElementById("blog-content-area");

async function loadPostDetails() {
    // 1. URL se ID nikalo
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        Swal.fire("Error", "No Post ID found!", "error").then(() => window.location.href = "home.html");
        return;
    }

    try {
        // 2. Supabase se Post ka data lao
        const { data: post, error } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();

        if (error) throw error;

        // 3. Date Formatting
        const date = new Date(post.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // 4. User Name Logic (Email se nikalo)
        const authorName = post.user_email ? post.user_email.split('@')[0] : "Unknown Author";

        // 5. HTML Inject Karo (Better Styling)
        contentArea.innerHTML = `
            <a href="home.html" class="back-btn">
                <i class="fa-solid fa-arrow-left"></i> Back to Feed
            </a>

            <h1 class="post-title">${post.title}</h1>

            <div class="post-meta">
                <img src="https://ui-avatars.com/api/?name=${authorName}&background=random" alt="Author">
                <div>
                    <strong class="d-block text-dark">${authorName}</strong>
                    <small>Published on ${date}</small>
                </div>
            </div>

            <div class="post-image-container">
                <img src="${post.image_url}" alt="Post Cover">
            </div>

            <div class="post-content">
                ${post.content}
            </div>
        `;

    } catch (error) {
        console.error(error);
        contentArea.innerHTML = `<div class="text-center text-danger py-5">
            <h3>Oops! Post not found.</h3>
            <p>${error.message}</p>
            <a href="home.html" class="btn btn-primary mt-3">Go Back</a>
        </div>`;
    }
}

// Call function
loadPostDetails();