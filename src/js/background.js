chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === 'saveValues') {
        const { tz_nk, tz_koordinat } = message;
        // Сохраняем значения в локальном кэше браузера.
        chrome.storage.local.set({ tz_nk: tz_nk, tz_koordinat: tz_koordinat }, function () {
            sendResponse();
        });
        console.log(`Сохраняем в кэш новые значение ТЗ: ${tz_nk}, ${tz_koordinat}`);
        return true;
    }
});
