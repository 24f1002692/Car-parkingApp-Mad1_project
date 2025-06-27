function formatDateTime(isoString) {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true            // a.m or p.m
    });
}


async function openSpotDetails(spotId) {
    const panel = document.getElementById("spot-detail-panel");
    const overlay = document.getElementById("overlay-blur");
    const loader = document.getElementById('loader');
    const link = document.getElementById('view-parked-vehicle-details');
    loader.style.display = 'flex';
    
    await new Promise(r => setTimeout(r, 200)); 
    const resp = await fetch(`/TruLotParking/role/adminDashboard/parking-lot-details/spot?spot_id=${spotId}`);
    const json_resp = await resp.json();
    const spot = json_resp.spot;
    loader.style.display = 'none';

    if(json_resp.success){
        document.getElementById('spot-id').textContent = `${spot.spot_id}`;

        const spotStatusEl = document.getElementById('spot-status');
        let statusText = `Status: Spot is ${spot.status} at the moment`;

        let background_color;
        switch (spot.status.toLowerCase()) {
            case 'available':
                background_color = '#228B22';
                link.style.visibility = 'hidden';
                break;
            case 'occupied':
                background_color = 'red';
                link.style.visibility = 'visible';
                break;
            case 'under_maintenance':
                background_color = 'orange';
                link.style.visibility = 'hidden';
                break;
            default:
                background_color = 'black';    // use black as fallback color
        }

        spotStatusEl.textContent = statusText;
        spotStatusEl.style.backgroundColor = background_color;
        spotStatusEl.style.color = 'white';
        spotStatusEl.style.padding = '0.6rem 2rem'; 
        spotStatusEl.style.borderRadius = '0.375rem';

        document.getElementById('reserved-by').textContent = spot.Reserved_by ? `Reserved By : Recent Reservation for this spot is made by ${spot.Reserved_by}` : `Reserved By : No Reservation Made for this spot`;
        document.getElementById('reserved-email').textContent = spot.Reserved_user_email ? `Reserved User Email : Email Id of the user is ${spot.Reserved_user_email}` : `Reserved User Email : N/A`;
        document.getElementById('parking-time').textContent = spot.Parking_time ? `Vehicle Parking Time : Vehicle Parked on this spot at : ${formatDateTime(spot.Parking_time)}` : `Vehicle Parking Time : N/A`;
        document.getElementById('lot-name').textContent = `Parking Lot Name : ${spot.lot_name}`;
        document.getElementById('lot-location').textContent = `Location of the parking Lot : ${spot.lot_location}`;

        panel.style.display = "block";
        document.body.classList.add("no-scroll");

        setTimeout(() => {
            panel.classList.add("active");
            overlay.classList.add("blurred");
        }, 10);
    }else{
        alert(json_resp.message);
    }   
}

function closeSpotDetails() {
    const panel = document.getElementById("spot-detail-panel");
    const overlay = document.getElementById("overlay-blur");

    panel.classList.remove("active");
    overlay.classList.remove("blurred");
    document.body.classList.remove("no-scroll");

    setTimeout(() => {
        panel.style.display = "none";   // delay to see transition
    }, 400);
}



//--------------------------------------------------------------------------------------------------

document.getElementById('view-icon').addEventListener('click', async() => {
    const lotPanel = document.getElementById('lot-detail-panel');
    const overlay = document.getElementById("overlay-blur");
    const loader = document.getElementById('loader');
    
    loader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 400));
    loader.style.display = 'none';

    lotPanel.style.display = "block";
    document.body.classList.add("no-scroll");

    setTimeout(() => {
        lotPanel.classList.add("active");
        overlay.classList.add("blurred");
    }, 10);
});


document.getElementById('lot-close-btn').addEventListener('click', () => {
    const lotPanel = document.getElementById('lot-detail-panel');
    const overlay = document.getElementById("overlay-blur");    

    lotPanel.classList.remove("active");
    overlay.classList.remove("blurred");
    document.body.classList.remove("no-scroll");

    setTimeout(() => {
        lotPanel.style.display = "none";
    }, 300);
});


Array.from(document.getElementsByClassName('spot')).forEach(spot => {
    spot.addEventListener('contextmenu', async(e) => {
        e.preventDefault();      // prevent browser menu
        const spotId = spot.dataset.name;

        if (spot.classList.contains('maintenance')) {
            const confirmRemoval = prompt('This spot is already under maintenance.\nType "REMOVE" to remove it from maintenance status.');
            if (confirmRemoval && confirmRemoval.toUpperCase() === 'REMOVE') {
                const loader = document.getElementById('loader');
                loader.style.display = 'flex';
                await new Promise(r => setTimeout(r, 400)); 
                const res = await fetch(`/TruLotParking/role/adminDashboard/parking-lot-details/remove-spot-under-maintenance?spot_id=${spotId}`);
                const json_res = await res.json();
                if(json_res.success){
                    spot.style.backgroundColor = 'rgb(100, 205, 100)';
                    spot.classList.remove('maintenance');
                    spot.classList.add('available');
                    await customAlert(json_res.message);
                }else{
                    await customAlert(json_res.message);
                }
                loader.style.display = 'none';
            } else {
                await customAlert('Action cancelled or denied');
            }

        } else if (spot.classList.contains('available')) {
            const confirmAdd = prompt('Mark this spot as under maintenance ? Type "YES" to confirm.');
            if (confirmAdd && confirmAdd.toUpperCase() === 'YES') {
                const loader = document.getElementById('loader');
                loader.style.display = 'flex';
                await new Promise(r => setTimeout(r, 400)); 
                const res = await fetch(`/TruLotParking/role/adminDashboard/parking-lot-details/put-spot-under-maintenance?spot_id=${spotId}`);
                const json_res = await res.json();
                if(json_res.success){
                    spot.style.backgroundColor = '#FFB347';
                    spot.classList.remove('available');
                    spot.classList.add('maintenance');
                    await customAlert(json_res.message);
                }else{
                    await customAlert(json_res.message);
                }
                loader.style.display = 'none';
            } else {
                await customAlert('Action cancelled or denied');
            }
        } else {
            return;
        }
    })
});