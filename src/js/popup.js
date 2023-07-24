document.addEventListener('DOMContentLoaded', function () {
    const tz_nkInput = document.getElementById('tz_nk');
    const tz_koordinatInput = document.getElementById('tz_koordinat');
    const saveButton = document.getElementById('saveButton');
    const messageElement = document.getElementById('message');

    // Load the values from the cache and set them in the input fields.
    chrome.storage.local.get(['tz_nk', 'tz_koordinat'], function (result) {
        if (typeof result.tz_nk === 'number') {
            tz_nkInput.value = result.tz_nk;
        } else {
            tz_nkInput.value = 5; // Default value of 5 if 'a' is not present in the cache.
        }

        if (typeof result.tz_koordinat === 'number') {
            tz_koordinatInput.value = result.tz_koordinat;
        } else {
            tz_koordinatInput.value = 10; // Default value of 10 if 'b' is not present in the cache.
        }
    });

    // Обработчик нажатия на кнопку "Сохранить".
    saveButton.addEventListener('click', function () {
        const tz_nk = parseInt(tz_nkInput.value);
        const tz_koordinat = parseInt(tz_koordinatInput.value);

        // Сохраняем значения в локальном кэше браузера через background script.
        chrome.runtime.sendMessage({ action: 'saveValues', tz_nk: tz_nk, tz_koordinat: tz_koordinat }, function () {
            // Update the message on the page when values are saved.
            messageElement.textContent = 'Значения ТЗ: НК, Координация сохранены!';
            setTimeout(function () {
                messageElement.textContent = ''; // Clear the message after a few seconds.
            }, 3000); // Display the message for 3 seconds.
        });
    });
});

