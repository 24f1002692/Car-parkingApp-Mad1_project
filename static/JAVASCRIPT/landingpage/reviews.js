let allReviews = [];
let currentReviewIndex = 0;

const reviewBox = document.querySelector(".review-box");

// Fetch reviews on DOM load
window.addEventListener("DOMContentLoaded", async () => {
    const res = await fetch("/TruLotParking/role/userDashboard/14-randomRating");
    const jsonData = await res.json();
    allReviews = jsonData.result_array;

    console.log(allReviews)

    renderCurrentReviews();
});

function renderStars(rating) {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
        stars.push('<i class="fas fa-star star" style="color: gold;"></i>');
    }
    if (hasHalf) {
        stars.push('<i class="fas fa-star-half-alt star" style="color: gold;"></i>');
    }
    return stars.join("");
}

function renderCurrentReviews() {
    const reviewsToShow = allReviews.slice(currentReviewIndex, currentReviewIndex + 2);
    if(reviewsToShow){
        const descriptions = reviewBox.querySelectorAll(".review-description");

        reviewsToShow.forEach((data, i) => {
            const container = descriptions[i];

            if (!container) return;

            const img = container.querySelector("img.user-image");
            const email = container.querySelector("p.email");
            const gender = container.querySelector("p.gender span");
            const para = container.querySelector(".review-para");
            const stars = container.querySelector(".stars");

            img.src = data.image;
            email.textContent = data.email;
            gender.innerHTML = data.gender === "female" ? "&#9792;" : "&#9794;";
            para.textContent = data.review;
            stars.innerHTML = renderStars(data.rating);
        });
    }else{
        return;
    }
}


document.querySelector(".gallery-controls").addEventListener("click", (e) => {
    if (allReviews.length <= 2) return;

    const isNext = e.target.closest(".gallery-controls-next");
    const isPrev = e.target.closest(".gallery-controls-previous");

    if (isNext) {
        if (currentReviewIndex + 2 < allReviews.length) {
            currentReviewIndex += 2;
            renderCurrentReviews();
        }
    } else if (isPrev) {
        if (currentReviewIndex - 2 >= 0) {
            currentReviewIndex -= 2;
            renderCurrentReviews();
        }
    }
});

