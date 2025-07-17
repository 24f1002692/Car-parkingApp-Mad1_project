const navbar = document.getElementById('navbar');
const overlay = document.querySelector('.user-detail-overlay');
const loader = document.getElementById('loader');
const pageBody = document.getElementById('page-body');

const detailPanel = document.querySelector('.user-detail-panel');
const img = detailPanel.querySelector('img');
const nameEmail = detailPanel.querySelector('.user-name-email');
const address = detailPanel.querySelector('.user-address');
const phoneNumbers = detailPanel.querySelector('.top-three-phone-numbers');
const reservedSpots = detailPanel.querySelector('.all-active-reservations');
const pastSpots = detailPanel.querySelector('.all-past-reservations');
const heading = document.getElementById('reservation-heading');
const toggleBtn = document.getElementById('toggle-reservation-btn');

reservedSpots.classList.remove('hidden');
pastSpots.classList.add('hidden');

Array.from(document.getElementsByClassName('view-user')).forEach((button) => {      //collect view user detail link, present on each card
    button.addEventListener('click', async(e) => {
        e.preventDefault();
        
        try{
            loader.style.display = 'flex';
            await new Promise(r => setTimeout(r, 400));
            const user_id = e.target.getAttribute('data-user-id');
            const url = `/TruLotParking/role/adminDashboard/registered-users/view-user?user_id=${user_id}`;

            const response = await fetch(url);
            const data = await response.json();   // json_data

            if(!data.success){
                loader.style.display = 'none';
                await customAlert(data.msg);
            }

            img.src = data.user.image_url || '';
            nameEmail.innerHTML = `${data.user.name} &nbsp; (${data.user.email})`;
            address.textContent = data.user.address || '';
            phoneNumbers.innerHTML = '';
            phoneNumbers.innerHTML = data.user.phone && data.user.phone.length ? data.user.phone?.slice(0,3).join(', ') : 'No phone numbers<br>(No reservation has been made)';

            reservedSpots.innerHTML = '';
            (data.active_reservations || []).forEach((spot) => {
                const p = document.createElement('p');
                p.textContent = `${spot.reserved_spot_id}`;
                reservedSpots.appendChild(p);
            });

            pastSpots.innerHTML = '';
            (data.past_reservations || []).forEach((spot) => {
                const p = document.createElement('p');
                p.textContent = `${spot.reserved_spot_id}`;
                pastSpots.appendChild(p);
            });
        
            reservedSpots.classList.remove('hidden');
            pastSpots.classList.add('hidden');
            heading.textContent = 'Active Reservations';
            toggleBtn.textContent = 'Past Reservations';

            detailPanel.classList.add('active');
            overlay.classList.add('active');
            navbar.classList.add('pointer-events-none');
            pageBody.classList.add('no-scroll');

        }catch(err){
            console.log(err);
            loader.style.display = 'none';
            await customAlert('Internal Server Error');
        }finally{
            loader.style.display = 'none';
        }
    });
});


toggleBtn.addEventListener('click', () => {
    const isReservedSpotsActive = !reservedSpots.classList.contains('hidden');
    if (isReservedSpotsActive) {
        reservedSpots.classList.add('hidden');    // add/remove hidden class, because we set the all-active/past-reservations to flex, now if set style style to block then para are not aligned in rows 
        pastSpots.classList.remove('hidden');
        heading.textContent = 'Past Reservations';
        toggleBtn.textContent = 'Active Reservations';
    } else {
        pastSpots.classList.add('hidden');
        reservedSpots.classList.remove('hidden');
        heading.textContent = 'Active Reservations';
        toggleBtn.textContent = 'Past Reservations';
    }
});

document.getElementById('cross-btn').addEventListener('click', () => {
    detailPanel.classList.remove('active');
    overlay.classList.remove('active');
    pageBody.classList.remove('no-scroll');

    setTimeout(() => {
        navbar.classList.remove('pointer-events-none');
    }, 400);
});

