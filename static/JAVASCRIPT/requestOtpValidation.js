let submitOtp = 0;

import { verifyOtp } from "./verifyOtp.js";
import { enableOtpSectionFeatures } from "./OtpPageFeatures.js";

const loader = document.getElementById('loader');

const requestOtp_btn = document.getElementById('requestOtp_btn');
const subform = document.getElementById('subform');
const emailInput = document.getElementById('otp-input-email');
const email_error_div = document.getElementById('email-error-div');
const messages_div = document.getElementById('messages-div');
const otp_section = document.getElementById('otp-section');


emailInput.addEventListener('focus', () => {
    email_error_div.innerHTML = '';
});

let otpRequested = false;  

requestOtp_btn.addEventListener('click', async (e) => {
    e.preventDefault();
    loader.style.display = 'flex';

    requestOtp_btn.disabled = true;        // to avoid in between a request already made....
    messages_div.innerHTML = '';
    email_error_div.innerHTML = '';

    const email = emailInput.value.trim();

    // Validate email
    if (email === '') {
        email_error_div.innerHTML = 'Email field is required';
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        return;
    } else if (email.length > 40 || email.length < 11) {
        email_error_div.innerHTML = 'Email must be between 11 and 40 characters';
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        return;
    }else if((!/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|ds\.study\.iitm\.ac\.in)$/.test(email))){     // from frontend only supporting three types of email.
        email_error_div.innerHTML = 'Email must be a valid @gmail.com address';
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        return;
    }

    // If OTP already requested already...
    if (otpRequested) {
        submitOtp++;

        const url = await verifyOtp(email, requestOtp_btn, messages_div, emailInput, otp_section);
        if(url){
            setTimeout(() => {
                loader.style.display = 'none';
                window.location.href = url;    // artificial delay so that, above message will appear to user...
            }, 500);
        }else{
            loader.style.display = 'none';
            requestOtp_btn.disabled = false;
            messages_div.innerHTML = 'Verification Failed, Invalid Otp...Try Again !'
            requestOtp_btn.innerHTML = 'Submit Otp';
            if(submitOtp > 2) {
                // document.getElementById('requestOtpAgain_btn').style.display = 'block';
                const wrapperDiv = document.createElement('div');
                wrapperDiv.classList.add('requestAgainOtpBtn-div');

                const requestAgainOtpBtn = document.createElement("button");
                requestAgainOtpBtn.id = "requestAgainOtp_btn";
                requestAgainOtpBtn.classList.add('requestAgainOtpBtn');

                requestAgainOtpBtn.type = "button";
                requestAgainOtpBtn.textContent = "Request OTP Again";

                const form = document.getElementById("requestOtp_form");
                wrapperDiv.appendChild(requestAgainOtpBtn);
                form.appendChild(wrapperDiv);

                requestAgainOtpBtn.addEventListener("click", () => {
                    window.location.href = "/otpForm/requestOtp";
                });
            }
        }
        return
    }

    // Request OTP if not requested yet...
    try {
        await new Promise(resolve => setTimeout(resolve, 200));      // sleep the code, setTimeout stops itself for a while, but sleep stops everything..... to show loader

        const response = await fetch('http://localhost:5000/otpForm/requestOtp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email : email })
        });

        const result = await response.json();

        if (response.ok && result.success) {
            loader.style.display = 'none';
            otpRequested = true;
            messages_div.innerHTML = result.message;
            requestOtp_btn.innerHTML = 'Submit OTP';
            requestOtp_btn.disabled = false;
            subform.style.display = 'none';
            otp_section.style.display = 'block';       // Do otp-section display - block or an optimise way => to create inputs dynamically and present to user....
            enableOtpSectionFeatures();
        } else {
            loader.style.display = 'none';
            messages_div.innerHTML = result.error || 'Server ERROR, Failed to send OTP. Try again Later....';
        }

        requestOtp_btn.disabled = false;
        
    } catch (err) {
        console.error(err);
        loader.style.display = 'none';
        requestOtp_btn.disabled = false;
        messages_div.innerHTML = 'Sending OTP service is on cooldown, will refresh after 24 hours.....';
    }

});

