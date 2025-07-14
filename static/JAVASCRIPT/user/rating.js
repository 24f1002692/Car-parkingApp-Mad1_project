let selectedRating = 0;
let selectedLotId = null;
let userId = null

const stars = document.querySelectorAll('.star');
const submitBtn = document.getElementById('rating-submit-btn');
const overlay = document.getElementById('overlay-blur');
const ratingPanel = document.getElementById('rating-panel-id');
const crossBtn = document.getElementById('back-btn');

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value);

        stars.forEach(s => {
            const val = parseInt(s.dataset.value);
            if (val <= selectedRating) {
                s.classList.add('filled');
                s.classList.replace('bi-star', 'bi-star-fill');
            }else{
                s.classList.remove('filled');
                s.classList.replace('bi-star-fill', 'bi-star');
            }
        });
    });
});


submitBtn.addEventListener('click', async() => {
    const description = document.getElementById('rating-description').value.trim();
    const loader = document.getElementById('loader');

    if(selectedRating < 1 || selectedRating > 5){
        customAlert('Please provide a rating before submitting');
        return;
    }

    if(!description || description.length > 300){
        customAlert('Please provide a description within 40-45 words');
        return;
    }

    if(!selectedLotId || !userId){
        return;
    }
    
    loader.style.display = 'flex';
    try {
        const response = await fetch('/TruLotParking/role/userDashboard/ratingLot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                lotId: selectedLotId,
                rating_value: selectedRating,
                rating_description: description
            })
        });

        const result = await response.json();
        loader.style.display = 'none';

        if (response.ok && result.success) {
            customAlert('Thank you for your feedback!', () => {
                overlay.classList.remove("blurred");
                ratingPanel.classList.remove("active");
                document.getElementById('rating-description').value = '';
                document.body.classList.remove('rating-active');     // searchbox also inactive when rating box is displayed
                
                if (searchBox) {
                    searchBox.readOnly = false;
                    searchBox.style.pointerEvents = '';
                    searchBox.removeAttribute('tabindex');
                }

                // Restore navbar links
                document.querySelectorAll('.navbar a').forEach(link => {
                    link.style.pointerEvents = '';
                });

            });
        } else {
            customAlert(result.message || 'Failed to submit rating.');
        }

    } catch (error) {
        loader.style.display = 'none';
        console.error('Error submitting rating:', error);
        customAlert('An error occurred while submitting your rating. Please try again later.');
    }
});


const searchBox = document.getElementById('search-box');

document.querySelectorAll('.rating-icon').forEach(icon => {      // Each card has rating icon, so get all of them and add click event listener to each of them.
    icon.addEventListener('click', (event) => {
        selectedLotId = icon.getAttribute('data-lot-id');
        userId = icon.getAttribute('data-user-id');
        const lotName = icon.getAttribute('data-lot-name');
        const head = document.getElementById('head');

        // Disable search box
        if (searchBox) {
            searchBox.readOnly = true;
            searchBox.style.pointerEvents = 'none';
            searchBox.setAttribute('tabindex', '-1');
        }

        document.querySelectorAll('.navbar a').forEach(link => {
            link.style.pointerEvents = 'none';
        });


        selectedRating = 0;
        stars.forEach(s => {
            s.classList.remove('filled');
            s.classList.replace('bi-star-fill', 'bi-star');
        });
        document.getElementById('rating-description').value = '';

        head.innerText = `Want to Rate ${lotName} parking Lot`;
        overlay.classList.add("blurred");
        ratingPanel.classList.add("active");
        document.body.classList.add('rating-active');
    });
});


crossBtn.addEventListener('click', () => {
    ratingPanel.classList.add("closing");

    setTimeout(() => {
        overlay.classList.remove("blurred");
        ratingPanel.classList.remove("active");
        ratingPanel.classList.remove("closing");
        document.body.classList.remove('rating-active');     // searchbox also inactive when rating box is displayed

        if (searchBox) {
            searchBox.readOnly = false;
            searchBox.style.pointerEvents = '';
            searchBox.removeAttribute('tabindex');
        }

        document.querySelectorAll('.navbar a').forEach(link => {
            link.style.pointerEvents = '';
        });
    }, 300);
});
