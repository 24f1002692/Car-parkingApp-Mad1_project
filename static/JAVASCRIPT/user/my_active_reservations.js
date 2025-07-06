Array.from(document.getElementsByClassName('release-spot')).forEach(btn => {
  btn.addEventListener('click', async () => {
    const loader = document.getElementById('loader');
    const reservedSpotId = btn.getAttribute('data-reserved-id');

    try {
        const result = await customPrompt({
            heading: `Please type 'RELEASE SPOT' to release Spot ID: ${reservedSpotId}`,
            placeholder: "Type 'RELEASE SPOT'",
            confirmText: "Release",
            cancelText: "Cancel",
            validator: (val) => val.trim().toLowerCase() === 'release spot',
            isUserDashboard: true
        });

        if(!result) return;

        loader.style.display = 'flex';
        await new Promise(resolve => setTimeout(resolve, 100));
        const url = `/TruLotParking/role/userDashboard/my-active-reservations/releaseSpot?reserved_spotId=${reservedSpotId}`;
        const res = await fetch(url);
        const resp = await res.json();

        loader.style.display = 'none';

        if (resp.success) {
            await customAlert(resp.message);
            window.location.href = `${resp.path}?reserved_spot_id=${resp.reserved_spot_id}`;
        } else {
            await customAlert(resp.message);
        }

    } catch (err) {
        console.log("Prompt cancelled or failed validation");
    }
  });
});
