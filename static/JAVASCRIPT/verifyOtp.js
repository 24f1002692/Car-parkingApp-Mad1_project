export async function verifyOtp(email, requestOtp_btn, messages_div){
    const otpInputs = document.querySelectorAll('.otp-value');
    const enteredOtp = Array.from(otpInputs).map(input => input.value.trim()).join('');    // join array values with no space

    const loader = document.getElementById('loader');
    loader.style.display = 'flex';
    await new Promise(resolve => setTimeout(resolve, 400));           // sleep the code, setTimeout stops itself for a while, but sleep stops everything..


    // checking that the otp entered by user has exactly four digits or not.
    if (!/^\d{4}$/.test(enteredOtp)) {
        messages_div.innerHTML = 'Enter a valid 4-digit OTP....';
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        return;
    }
    
    // if the otp is valid then send a verification request...
    try {
        const response = await fetch('http://localhost:5000/otpForm/requestOtp/verifyOtp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email : email, otp: enteredOtp })
        });

        const result = await response.json();
        console.log(result.url);

        if (response.ok && result.success) {
            loader.style.display = 'none';
            messages_div.innerHTML = 'OTP verified successfully. Redirecting to your Dashboard...';
            requestOtp_btn.disabled = false;
            return result.url;
            
        } else {            
            loader.style.display = 'none';
            requestOtp_btn.disabled = false;
            return null;
        }
    } catch (err) {
        console.error(err);
        messages_div.innerHTML = 'Error verifying OTP, please try again....';
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        return null;
    }
}
