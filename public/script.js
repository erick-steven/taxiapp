const form = document.getElementById('reviewForm');
const reviewsContainer = document.getElementById('reviews');

// Fetch and display existing reviews
async function fetchReviews() {
    const response = await fetch('/api/reviews');
    const reviews = await response.json();
    reviews.forEach(review => {
        displayReview(review);
    });
}

// Display a single review
function displayReview(review) {
    const reviewCard = document.createElement('div');
    reviewCard.classList.add('review-card');
    reviewCard.innerHTML = `<h3>${review.name}</h3><p>“${review.review}”</p>`;
    reviewsContainer.appendChild(reviewCard);
}

// Handle form submission
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        review: formData.get('review'),
    };

    // Send review to the server
    await fetch('/api/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    // Reset the form
    form.reset();

    // Fetch and display updated reviews
    fetchReviews();
});

// Initial fetch of reviews
fetchReviews();
