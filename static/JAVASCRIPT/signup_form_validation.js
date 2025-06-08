import { enableOtpSectionFeatures } from "./OtpPageFeatures.js";

document.addEventListener('DOMContentLoaded', () => {
    setupTogglePassword();
});


function setupTogglePassword() {
    console.log('togglePassword-called')
    const passwordInput = document.getElementById('signup-input-password');
    const icon = document.getElementById('eye-icon');
    
    icon.addEventListener('click', () => {
        if(passwordInput.type == 'password'){
            passwordInput.type = 'text';
        }else {
            passwordInput.type = 'password';
        }

        icon.classList.toggle('fa-eye');        // initially i set the class to slash(hide) in my html icon, now as user clicks, the toggle will add fa-eye and remove fa-eye-slash....and on again click event things revert and so on
        icon.classList.toggle('fa-eye-slash');
    });
};

//------------------------------------------------------------------------------------------

async function unique_user_check(email) {
    const email_error_div = document.getElementById('email-error-div');
    const emailInput = document.getElementById('signup-input-email');

    // sending a separate post request to check whether the user with this email already exists ?
    try {
        if (email) {
            const response = await fetch('/TruLotParking/signup/check_user_exists', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email }) 
            })
    
            const data = await response.json();  // parsing response to readable format (json format)

            if(data.error){
                email_error_div.innerHTML = 'Internal Server Error';
                return false;
            }
            
            if (data.user_exists) {
                email_error_div.innerHTML = 'User with this email already exists.';
                emailInput.style.border = '0.6px solid red';
                return false;
            }
            return true;
        }
    }catch(e){
        console.log('unique check failed - ',e);
        email_error_div.innerHTML = 'Server error !';
        return false;
    }
}


async function validate_phoneNumber(phone) {
    const phone_error_div = document.getElementById('phone-error-div');
    const phone_input = document.getElementById('signup-input-phone');

    // sending a separate post request to check whether the user with this email already exists ?
    try {
        if (phone) {
            const response = await fetch('/TruLotParking/signup/validate-phone', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ phone: phone }) 
            })
    
            const data = await response.json();    // parsing resp to json(human readable)

            if(!data.success){
                phone_error_div.innerHTML = 'Invalid Phone number in India.';
                phone_input.style.border = '0.6px solid red';
                return false;
            }
            return true;
        }
    }catch(e){
        console.log(e);
        phone_error_div.innerHTML = 'Server error !';
        return false;
    }
}


const verifyBtn = document.getElementById('verify-email-btn');
verifyBtn.addEventListener('click', async (event) => {
    if(event.target.type == 'submit'){
        return true;
    }
    const username_input = document.getElementById('signup-input-username');
    const email_input = document.getElementById('signup-input-email');
    const phone_input = document.getElementById('signup-input-phone');
    const password_input = document.getElementById('signup-input-password');

    const username = username_input.value;
    const password = password_input.value;
    const email = email_input.value;
    const phone = phone_input.value;
    
    const email_error_div = document.getElementById('email-error-div');
    const password_error_div = document.getElementById('password-error-div');
    const phone_error_div = document.getElementById('phone-error-div');
    const username_error_div = document.getElementById('username-error-div');

    const loader = document.getElementById('loader');
    loader.style.display = 'flex';

    if(username == ''){
        username_error_div.innerHTML = 'Username field is required';
        username_input = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(username < 3 || username > 25){
        username_error_div.innerHTML = 'Username should be within 3-25 characters';
        username_input = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        username_error_div.innerHTML = '';
    }


    if (password == ''){
        password_error_div.innerHTML = 'password field is required';
        password_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(password.length < 5 || password.length > 15){
        password_error_div.innerHTML = 'password should be of 6-15 characters.';
        password_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(!(/[!@#$%^&*(),.?":{}|<>]/.test(password) && /[A-Z]/.test(password))){
        password_error_div.innerHTML = 'Incorrect password Format.';
        password_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        password_error_div.innerHTML = '';
    }


    if(email == ''){
        email_error_div.innerHTML = 'email field is required';
        email_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(email.length > 40 || email.length < 11){
        email_error_div.innerHTML = 'email format is incorrect';
        email_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if((!/^[a-zA-Z0-9._%+-]+@(gmail\.com|yahoo\.com|ds\.study\.iitm\.ac\.in)$/.test(email))){
        email_error_div.innerHTML = 'format of email is invalid, check it.';
        email_input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else{
        email_error_div.innerHTML = '';
    }


    if(phone == ''){
        phone_error_div.innerHTML = 'Your phone number is required';
        phone_input = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }else if(!/^\d{10}$/.test(phone)){
        phone_error_div.innerHTML = 'Your phone number is required';
        phone_input = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    const resp = await unique_user_check(email);
    if(!resp){
        loader.style.display = 'none';
        return false;
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
    const resp2 = await validate_phoneNumber(phone);     // doing frontend check => to avoid page reload if validate it using server hitting directly, cause otp logic to run again.
    if(!resp2){
        loader.style.display = 'none';
        return false;
    }

    const payload = { username, email, phone, password };

    const res = await fetch('/signup/emailVerification/requestOtp', {              // request OTP
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    const data = await res.json();
    if (data.success) {
        sessionStorage.setItem('otpFailCount', '0');
        sessionStorage.setItem('formData', JSON.stringify(payload));
        loader.style.display = 'none';
        alert(data.message);

        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('requestOtp_form').style.display = 'block';
        enableOtpSectionFeatures();
    } else {
        loader.style.display = 'none';
        alert(data.message);
    }
});


// requestOtp form
const requestOtp_btn = document.getElementById('requestOtp_btn');

requestOtp_btn.addEventListener('click', async () => {
    requestOtp_btn.disabled = true;

    const otpInputs = document.querySelectorAll('.otp-value');
    const otp = Array.from(otpInputs).map(i => i.value).join('');

    if (!/^\d{4}$/.test(otp)) {
        alert('Enter a valid 4-digit OTP....');
        requestOtp_btn.disabled = false;
        loader.style.display = 'none';
        return false;
    }

    const formData = JSON.parse(sessionStorage.getItem('formData'));
    const email = formData.email;

    const res = await fetch('/signup/emailVerification/verifyOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
    });
    await new Promise(resolve => setTimeout(resolve, 500));     // sleep the code, setTimeout stops itself for a while, but sleep stops everything..

    const data = await res.json();
    if (data.success) {
        alert(data.message);
        document.getElementById('signup-input-username').value = formData.username;
        document.getElementById('signup-input-email').value = formData.email;
        document.getElementById('signup-input-password').value = formData.password;
        document.getElementById('signup-input-phone').value = formData.phone;

        verifyBtn.innerText = "Create Account";
        verifyBtn.type = "submit";

        sessionStorage.removeItem('formData');
        document.getElementById('signup-form').style.display = 'block';
        document.getElementById('requestOtp_form').style.display = 'none';

        document.getElementById('success-toast').style.visibility = 'visible';
    } else {
        requestOtp_btn.disabled = false;
        let failedAttempts = Number(sessionStorage.getItem('otpFailCount') || '0');   // get curr count from localstorage and if it is first attempt then initialise to 0
        failedAttempts += 1;

        if(failedAttempts <= 2){
            alert(data.error);
        }
        sessionStorage.setItem('otpFailCount', failedAttempts);

        if (failedAttempts > 2) {
            alert('Email Validation Failed, please check your email...');
            document.getElementById('signup-input-username').value = formData.username;
            document.getElementById('signup-input-email').value = formData.email;
            document.getElementById('signup-input-password').value = formData.password;
            document.getElementById('signup-input-phone').value = formData.phone;
            otpInputs.forEach(input => input.value = '');

            sessionStorage.removeItem('formData');
            sessionStorage.removeItem('otpFailCount');
            document.getElementById('signup-form').style.display = 'block';
            document.getElementById('requestOtp_form').style.display = 'none';
        }
    }
});

