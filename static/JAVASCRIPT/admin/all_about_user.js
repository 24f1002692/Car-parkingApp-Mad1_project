const navbar = document.getElementById('navbar');
const pageBody = document.getElementById('page-body');
const detailPanel = document.querySelector('.user-detail-panel');
const overlay = document.querySelector('.user-detail-overlay');

Array.from(document.getElementsByClassName('view-user')).forEach((button) => {
    button.addEventListener('click', async(e) => {
        e.preventDefault();
        const loader = document.getElementById('loader');
        const img = detailPanel.querySelector('img');
        const nameEmail = detailPanel.querySelector('.user-name-email');
        const address = detailPanel.querySelector('.user-address');
        const phoneNumbers = detailPanel.querySelector('.top-three-phone-numbers');
        const reservedSpots = detailPanel.querySelector('.all-active-reservations');

        loader.style.display = 'flex';
        await new Promise(r => setTimeout(r, 400));
        const user_id = e.target.getAttribute('data-user-id');
        const url = `/TruLotParking/role/adminDashboard/registered-users/view-user?user_id=${user_id}`;

        const response = await fetch(url);
        const data = await response.json();   // json_data

        loader.style.display = 'none';

        img.src = data.user.image_url || '';
        nameEmail.innerHTML = `${data.user.name} &nbsp; (${data.user.email})`;
        address.textContent = data.user.address || '';
        phoneNumbers.innerHTML = data.user.phone_numbers?.join(', ') || 'No phone numbers<br>(No reservation has been made)';

        reservedSpots.innerHTML = '';
        (data.user.reserved_spots || []).forEach((spot) => {
            const p = document.createElement('p');
            p.textContent = `${spot.reserved_spot_id}`;
            reservedSpots.appendChild(p);
        });

        detailPanel.classList.add('active');
        overlay.classList.add('active');
        navbar.classList.add('pointer-events-none');
        pageBody.classList.add('no-scroll');

    });
});


document.getElementById('cross-btn').addEventListener('click', () => {
    detailPanel.classList.remove('active');
    overlay.classList.remove('active');
    pageBody.classList.remove('no-scroll');

    setTimeout(() => {
        navbar.classList.remove('pointer-events-none');
    }, 400);
});