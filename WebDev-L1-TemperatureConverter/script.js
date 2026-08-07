document.addEventListener('DOMContentLoaded', function () {
    const tempInput = document.getElementById('temp-input');
    const convertBtn = document.getElementById('convert-btn');
    const errorBox = document.getElementById('error-box');
    const celsiusVal = document.getElementById('celsius-val');
    const fahrenheitVal = document.getElementById('fahrenheit-val');
    const kelvinVal = document.getElementById('kelvin-val');
    const radioButtons = document.querySelectorAll('input[name="input-unit"]');

    function showError(msg) {
        errorBox.textContent = msg;
        errorBox.style.display = 'block';
        celsiusVal.textContent = '-- °C';
        fahrenheitVal.textContent = '-- °F';
        kelvinVal.textContent = '-- K';
    }

    function hideError() {
        errorBox.style.display = 'none';
        errorBox.textContent = '';
    }

    function formatNum(num) {
        if (Number.isInteger(num)) {
            return num.toString();
        }
        return num.toFixed(2);
    }

    function convertTemperature() {
        const rawInput = tempInput.value.trim();

        if (rawInput === '') {
            showError('Please enter a numeric temperature value.');
            return;
        }

        const numVal = Number(rawInput);

        if (isNaN(numVal)) {
            showError('Invalid input! Please enter a valid number.');
            return;
        }

        let selectedUnit = 'celsius';
        for (let radio of radioButtons) {
            if (radio.checked) {
                selectedUnit = radio.value;
                break;
            }
        }

        let c, f, k;

        if (selectedUnit === 'celsius') {
            if (numVal < -273.15) {
                showError('Absolute zero violation! Temperature cannot be below -273.15°C.');
                return;
            }
            c = numVal;
            f = (numVal * 9 / 5) + 32;
            k = numVal + 273.15;
        } else if (selectedUnit === 'fahrenheit') {
            if (numVal < -459.67) {
                showError('Absolute zero violation! Temperature cannot be below -459.67°F.');
                return;
            }
            c = (numVal - 32) * 5 / 9;
            f = numVal;
            k = c + 273.15;
        } else if (selectedUnit === 'kelvin') {
            if (numVal < 0) {
                showError('Absolute zero violation! Temperature cannot be below 0 K.');
                return;
            }
            k = numVal;
            c = numVal - 273.15;
            f = (c * 9 / 5) + 32;
        }

        hideError();
        celsiusVal.textContent = formatNum(c) + ' °C';
        fahrenheitVal.textContent = formatNum(f) + ' °F';
        kelvinVal.textContent = formatNum(k) + ' K';
    }

    convertBtn.addEventListener('click', convertTemperature);

    tempInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            convertTemperature();
        }
    });

    radioButtons.forEach(function (radio) {
        radio.addEventListener('change', function () {
            if (tempInput.value.trim() !== '') {
                convertTemperature();
            }
        });
    });
});
