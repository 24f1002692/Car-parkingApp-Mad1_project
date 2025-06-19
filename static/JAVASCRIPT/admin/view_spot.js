async function openSpotDetails(spotId) {
    const panel = document.getElementById("spot-detail-panel");
    const overlay = document.getElementById("overlay-blur");
    const loader = document.getElementById('loader');
    const anchor = document.getElementById('check-parked-vehicle-details');
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

        if(spot.status.toLowerCase() == 'occupied'){
            anchor.style.visibility = 'visible';
        }else{
            anchor.style.visibility = 'hidden';
        }

        document.getElementById('spot-status').textContent = `Status : Spot is ${spot.status} at the moment`;
        document.getElementById('reserved-by').textContent = spot.Reserved_by ? `Reserved By : Recent Reservation for this spot is made by ${spot.Reserved_by}` : `Reserved By : No Reservation Made for this spot`;
        document.getElementById('reserved-email').textContent = spot.Reserved_user_email ? `Reserved User Email : Email Id of the user is ${spot.Reserved_user_email}` : `Reserved User Email : N/A`;
        document.getElementById('parking-time').textContent = spot.Parking_time ? `Vehicle Parking Time : Vehicle Parked on this spot at : ${spot.Parking_time}` : `Vehicle Parking Time : N/A`;
        document.getElementById('leaving-time').textContent = spot.leaving_time ? `Vehicle Departed Time : Vehicle Departed from this Spot at : ${spot.leaving_time}` : `Vehicle Departed Time : N/A`;
        document.getElementById('lot-name').textContent = `Parking Lot Name : ${spot.lot_name}`;
        document.getElementById('lot-location').textContent = `Location of the parking Lot : ${spot.lot_location}`;

        panel.style.display = "block";
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
    setTimeout(() => {
        panel.style.display = "none";   // delay to see transition
    }, 400);
}
