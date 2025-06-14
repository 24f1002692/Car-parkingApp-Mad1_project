async function openSpotDetails(spotId) {
    const panel = document.getElementById("spot-detail-panel");
    const overlay = document.getElementById("overlay-blur");
    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    const resp = await fetch(`/TruLotParking/role/adminDashboard/parking-lot-details/spot?spot_id=${spotId}`);
    const json_resp = await resp.json();
    const spot = json_resp.spot;
    loader.style.display = 'none';

    if(json_resp.success){
        document.getElementById('spot-id').textContent = `Spot id : ${spot.spot_id}`;
        document.getElementById('spot-status').textContent = `Status : ${spot.status}`;
        document.getElementById('reserved-by').textContent = `Reserved By : ${spot.Reserved_by || 'N/A'}`;
        document.getElementById('reserved-email').textContent = `Email : ${spot.Reserved_user_email || 'N/A'}`;
        document.getElementById('parking-time').textContent = `From : ${spot.Parking_time || 'N/A'}`;
        document.getElementById('leaving-time').textContent = `To : ${spot.leaving_time || 'N/A'}`;
        document.getElementById('lot-name').textContent = `Lot : ${spot.lot_name}`;
        document.getElementById('lot-location').textContent = `Location : ${spot.lot_location}`;

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
