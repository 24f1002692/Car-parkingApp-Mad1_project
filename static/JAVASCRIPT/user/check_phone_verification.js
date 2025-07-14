import { enableOtpSectionFeatures } from "../OtpPageFeatures.js";

let pollingIntervalId = null;
const loader = document.getElementById('loader');

const otp_section = document.getElementById('otp-section-container');
const form_container = document.getElementById('form-container');
const phone_error_div = document.getElementById('phone-error-div');
const phone_input = document.getElementById('phone-input');
const alert_box = document.getElementById('alert-box');
const userId = document.getElementById("form-container").dataset.userId;
const lotId = document.getElementById("form-container").dataset.lotId;

localStorage.setItem('lotId', lotId);
localStorage.setItem('userId', userId);

async function check_phone_already_verified(phone){
    try{
        const res = await fetch(`/TruLotParking/role/userDashboard/bookOneSpot/check-phone-verification?phone=${encodeURIComponent(phone)}`);

        const data = await res.json();
        if(!data.success){
            await customAlert(data.message);
            if(data.message == 'user is not verified'){
                return data.success;
            }
            return null;
        }
        return data.success;
    }catch(err){
        console.log(err);
        await customAlert('Internal Server Error, Try again Later');
        return null;
    }
}


async function check_pending_bills(){
    try{
        const res = await fetch('/TruLotParking/role/userDashboard/bookOneSpot/check-pending-bills');
        const data = await res.json();

        if(!data.success){
            await customAlert(data.message);
            return data.success;
        }
        return data.success;
    }catch(err){
        console.log(err);
        await customAlert('Internal Server Error');
        return null;
    }
}

async function check_phone_verification(){
    const phone = phone_input.value.trim();
    const lotId_val = localStorage.getItem('lotId');
    const userId_val = localStorage.getItem('userId');

    phone_input.addEventListener('focus', () => {
        phone_input.style.border = '';
        phone_error_div.innerHTML = '';
    });

    if(!phone){
        phone_input.style.border = '1px solid red';
        phone_error_div.innerHTML = 'Phone number is required';
        return false;
    }else if(!(phone.startsWith("+") && phone.length >= 10 && /^\+\d{10,15}$/.test(phone))){
        phone_input.style.border = '1px solid red';
        phone_error_div.innerHTML = 'Your country code is also required along with your phone number';
        return false;
    }else{
        phone_error_div.innerHTML = '';
    }

    localStorage.setItem("user_phone", phone);
    loader.style.display = 'flex';

    const pendingBills = await check_pending_bills();
    if(!pendingBills){
        window.location.href = '/TruLotParking/role/userDashboard/my-pending-bills';
    }
    
    const res = await check_phone_already_verified(phone);
    if(res == null){
        window.location.href = '/TruLotParking/role/userDashboard';
    }

    if(res){
        await new Promise(r => setTimeout(r, 500)); 
        await customAlert('Your phone number is verified, Booking a parking spot for you, please wait...');
        if (!userId_val || !lotId_val) {
            loader.style.display = 'none';
            await customAlert("Missing user or lot information. Please try again.");
            return;
        }
        
        await new Promise(r => setTimeout(r, 100)); 
        const bookingRes = await fetch('/TruLotParking/role/userDashboard/bookOneSpot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId_val, lotId_val, phone_num: localStorage.getItem("user_phone") })
        });
        
        const json_booking_res = await bookingRes.json();
        if(json_booking_res.success){
            await customAlert(`Your Parking is Booked, your Spot id is ${json_booking_res.message}, Redirecting to your dashboard`);
            window.location.href = '/TruLotParking/role/userDashboard';
        }else{
            await customAlert(json_booking_res.message);
            if(json_booking_res.message == 'No available spot at the moment'){
                window.location.href = `/TruLotParking/role/userDashboard/bookOneSpot?lot_id=${lotId_val}`;
            }
            loader.style.display = 'none';
        }
    }else{
        await new Promise(r => setTimeout(r, 500));
        loader.style.display = 'none';
        form_container.style.display = 'none';
        alert_box.style.display = 'block';

        // polling my backend at an interval of 1s, does the otp sent ? if sent then change the UI for get the otp from user.
        if (pollingIntervalId) clearInterval(pollingIntervalId);

        pollingIntervalId = setInterval(async () => {
            try {
                const pollRes = await fetch(`/TruLotParking/role/userDashboard/bookOneSpot/check-otp-sent?phone=${encodeURIComponent(phone)}`);
                const pollData = await pollRes.json();

                if (pollData.success) {
                    clearInterval(pollingIntervalId);   // stop polling
                    
                    alert_box.style.display = 'none';
                    otp_section.style.display = 'block';  // show OTP input section
                    document.body.classList.add('otp-mode');
                    enableOtpSectionFeatures();
                    await customAlert('📩 OTP sent to your WhatsApp. Please enter it below.');
                }

            } catch (err) {
                clearInterval(pollingIntervalId);
                console.error('Error while polling for OTP:', err);
                await customAlert('⚠️ Internal Server Error while sending OTP. Please try again.');
            }
        }, 1000);
    }
}


const submitOtp_btn = document.getElementById('submitOtp_btn');   // submit otp button 

submitOtp_btn.addEventListener('click', async () => {
    const lotId_val = localStorage.getItem('lotId');
    const userId_val = localStorage.getItem('userId');
    const phone = localStorage.getItem("user_phone")
    loader.style.display = 'flex';
    
    const otpInputs = document.querySelectorAll('.otp-value');
    const otp = Array.from(otpInputs).map(i => i.value).join('');

    if (!/^\d{6}$/.test(otp)) {
        loader.style.display = 'none';
        await customAlert('Enter a valid 4-digit OTP....');
        return;
    }

    if(!phone){
        phone_input.style.border = '1px solid red';
        phone_error_div.innerHTML = 'Phone number is required';
        return;
    }else if(!(phone.startsWith("+") && phone.length >= 10 && /^\+\d{10,15}$/.test(phone))){
        phone_input.style.border = '1px solid red';
        phone_error_div.innerHTML = 'Your country code is also required along with your phone number';
        return;
    }else{
        phone_error_div.innerHTML = '';
    }
    
    await new Promise(r => setTimeout(r, 200)); 
    const res = await fetch('/TruLotParking/role/userDashboard/bookOneSpot/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_num: localStorage.getItem("user_phone"), otp, userId_val })
    });
    
    loader.style.display = 'none';
    const data = await res.json();
    if(data.success){
        await customAlert(data.message);
        loader.style.display = 'flex';

        if (!userId_val || !lotId_val) {
            loader.style.display = 'none';
            await customAlert("Missing user or lot information. Please try again.");
            return;
        }
        
        await new Promise(r => setTimeout(r, 200)); 
        const bookingRes = await fetch('/TruLotParking/role/userDashboard/bookOneSpot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId_val, lotId_val, phone_num: localStorage.getItem("user_phone") })
        });
        
        const json_booking_res = await bookingRes.json();
        if(json_booking_res.success){
            await new Promise(r => setTimeout(r, 200)); 
            await customAlert(`Your Parking is Booked, your Spot id is ${json_booking_res.message}, Redirecting to your dashboard`);
            setTimeout(() => {
                window.location.href = '/TruLotParking/role/userDashboard';
            }, 1000);
        }else{
            await customAlert(json_booking_res.message);
        }
    }else{
        await customAlert(data.message);
    }
});


window.addEventListener("beforeunload", () => {
    if (pollingIntervalId) {
        clearInterval(pollingIntervalId);
        pollingIntervalId = null;
    }
});

window.check_phone_verification = check_phone_verification;