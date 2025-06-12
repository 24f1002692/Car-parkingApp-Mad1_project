function validateField({ value, input, min, max, errorDiv, loader, requiredMsg, rangeMsg }) {
    if (value.trim() === '') {
        errorDiv.innerHTML = requiredMsg;
        input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    } else if (value.length < min || value.length > max) {
        errorDiv.innerHTML = rangeMsg;
        input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    } else {
        errorDiv.innerHTML = '';
        input.style.border = '';
        return true;
    }
}

function validateNumberField({ value, input, min, max, errorDiv, loader, requiredMsg, rangeMsg }) {
    if (value.trim() === '') {
        errorDiv.innerHTML = requiredMsg;
        input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < min || numValue > max) {
        errorDiv.innerHTML = rangeMsg;
        input.style.border = '0.6px solid red';
        loader.style.display = 'none';
        return false;
    }

    errorDiv.innerHTML = '';
    input.style.border = '';
    return true;
}

async function validateParkingLot(event){
    event.preventDefault();       
    const loader = document.getElementById('loader');
    const loaderBox = document.querySelector('.loader-box');
    loaderBox.style.visibility = 'visible';
    loader.style.display = 'flex';

    const lot_name_input = document.getElementById('lot_name');
    const description_input = document.getElementById('description');
    const price_per_hr_input = document.getElementById('price');
    const timing_input = document.getElementById('timing');
    const capacity_input = document.getElementById('capacity');
    const location_input = document.getElementById('location');
    const state_input = document.getElementById('state');
    const country_input = document.getElementById('country');

    const lot_name = lot_name_input.value.trim();
    const description = description_input.value.trim();
    const price_per_hr = price_per_hr_input.value.trim();
    const timing = timing_input.value.trim();
    const capacity = capacity_input.value.trim();
    const location = location_input.value.trim();
    const state = state_input.value.trim();
    const country = country_input.value.trim();
    
    const lot_name_errorDiv = document.getElementById('lot_name_errorDiv');
    const description_errorDiv = document.getElementById('description_errorDiv');
    const price_per_hr_errorDiv = document.getElementById('price_errorDiv');
    const timing_errorDiv = document.getElementById('timing_errorDiv');
    const capacity_errorDiv = document.getElementById('capacity_errorDiv');
    const location_errorDiv = document.getElementById('location_errorDiv');
    const state_errorDiv = document.getElementById('state_errorDiv');
    const country_errorDiv = document.getElementById('country_errorDiv');

    const inputErrorPairs = [
        { input: lot_name_input, errorDiv: lot_name_errorDiv },
        { input: description_input, errorDiv: description_errorDiv },
        { input: price_per_hr_input, errorDiv: price_per_hr_errorDiv },
        { input: capacity_input, errorDiv: capacity_errorDiv },
        { input: location_input, errorDiv: location_errorDiv },
        { input: state_input, errorDiv: state_errorDiv },
        { input: country_input, errorDiv: country_errorDiv },
        { input: timing_input, errorDiv: timing_errorDiv}
    ];

    inputErrorPairs.forEach(({ input, errorDiv }) => {
        input.addEventListener('focus', () => {
            errorDiv.innerHTML = '';
            input.style.border = '';
        });
    });

    const fields = [
        {
            value: lot_name,
            input: lot_name_input,
            min: 10,
            max: 40,
            errorDiv: lot_name_errorDiv,
            loader: loader,
            requiredMsg: 'Name for parking lot is required',
            rangeMsg: 'Lot name must be between 8 and 30 characters.',
            validator: validateField
        },

        {
            value: description,
            input : description_input,
            min: 50,
            max: 200,
            errorDiv: description_errorDiv,
            loader: loader,
            requiredMsg: 'Description for parking lot is required',
            rangeMsg: 'Description must be between 50 and 200 characters.',
            validator: validateField
        },

        {
            value: price_per_hr,
            input: price_per_hr_input,
            min: 99,
            max: 299,
            errorDiv: price_per_hr_errorDiv,
            loader: loader,
            requiredMsg: 'Price for parking lot is required',
            rangeMsg: 'Price must be between 99 and 299 INR.',
            validator: validateNumberField
        },

        {
            value: timing,
            input: timing_input,
            min: 18,
            max: 80,
            errorDiv: timing_errorDiv,
            loader: loader,
            requiredMsg: 'Timing for parking lot is required',
            rangeMsg: 'length of this input should be between 18-80 chars',
            validator: validateField
        },

        {
            value: capacity,
            input: capacity_input,
            min: 80,
            max: 400,
            errorDiv: capacity_errorDiv,
            loader: loader,
            requiredMsg: 'Capacity for parking lot is required',
            rangeMsg: 'Capacity of Parking Lot must be between 80 and 400.',
            validator: validateNumberField
        },

        {
            value: location,
            input : location_input,
            min: 10,
            max: 150,
            errorDiv: location_errorDiv,
            loader: loader,
            requiredMsg: 'Location for parking lot is required',
            rangeMsg: 'Location of Parking Lot must be between 20 and 200.',
            validator: validateField
        },

        {
            value: state,
            input: state_input,
            min: 4,
            max: 40,
            errorDiv: state_errorDiv,
            loader: loader,
            requiredMsg: 'State Where parking lot located is required',
            rangeMsg: 'State Name of Parking Lot must be between 4 and 40.',
            validator: validateField

        },

        {
            value: country,
            input: country_input,
            min: 1,
            max: 40,
            errorDiv: country_errorDiv,
            loader: loader,
            requiredMsg: 'Country Name Where parking lot located is required',
            rangeMsg: 'Country Name of Parking Lot must be between 1 and 40.',
            validator: validateField

        }
    ];


    for (const field of fields) {
        const isValid = field.validator({
            value: field.value,
            input: field.input,
            min: field.min,
            max: field.max,
            errorDiv: field.errorDiv,
            loader: loader,
            requiredMsg: field.requiredMsg,
            rangeMsg: field.rangeMsg
        });

        if (!isValid) {
            return false;       // Stop at first invalid field
        }
    }

    // everything is fine : submit form manually
    document.getElementById('parkingLot').submit();  
}