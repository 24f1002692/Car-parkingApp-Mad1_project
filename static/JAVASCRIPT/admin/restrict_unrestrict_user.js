document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.toggle-user-status').forEach(icon => {
        icon.addEventListener('click', async () => {
            const userId = icon.dataset.userId;
            const isRestricted = icon.dataset.restricted === 'true';

            const url = isRestricted ? `/TruLotParking/role/adminDashboard/unrestrict-user/${userId}` : `/TruLotParking/role/adminDashboard/restrict-user/${userId}`;
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                const data = await res.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    alert('Operation failed: ' + data.message || 'Unknown error');
                }
            } catch (err) {
                console.error('Error:', err);
                alert('Request failed.');
            }
        });
    });
});