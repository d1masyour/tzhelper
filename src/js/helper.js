function logWork(worker, timeSpentMinutes, originTaskId, buttonLabel) {
  const jiraBaseUrl = 'https://jira.nexign.com';
  const tempoAPIVersion = '4';
  const worklogsEndpoint = `/rest/tempo-timesheets/${tempoAPIVersion}/worklogs`;

  if (!originTaskId) {
    console.error('Не удалось получить ID текущей таски.');
    return;
  }

  const started = new Date().toISOString().split('T')[0]; // Получаем сегодняшнюю дату в формате 'YYYY-MM-DD'.
  const comment = "Списание трудозатрат за " + buttonLabel;

  let localVarTz = 'tz_nk'; // Устанавливаем значение 'tz_nk' по умолчанию.

  if (buttonLabel === 'НК') {
    localVarTz = 'tz_nk';
  }
  else if (buttonLabel === 'Координация') {
    localVarTz = 'tz_koordinat';
  }

  // Получаем значение из кэша в зависимости от buttonLabel.
  chrome.storage.local.get([localVarTz], function (result) {
    const tz_Value = result[localVarTz];
    console.log(`Значение ${localVarTz} из кэша:`, tz_Value);

    // Создаем объект worklogData с учетом полученного значения tz_nk.
    const worklogData = {
      attributes: {},
      billableSeconds: "",
      worker: worker,
      comment: comment,
      started: started,
      timeSpentSeconds: tz_Value * 60,
      originTaskId: originTaskId,
      remainingEstimate: null,
      endDate: null,
      includeNonWorkingDays: false
    };

    const request = new XMLHttpRequest();
    request.open('POST', jiraBaseUrl + worklogsEndpoint, true);
    request.setRequestHeader('Content-Type', 'application/json');

    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          console.log('Трудозатраты списаны успешно.');
          console.log(request.responseText);
        } else {
          console.error('Ошибка при списании трудозатрат.');
          console.error('Status:', request.status);
          console.error('Response:', request.responseText);
        }
      }
    };

    request.send(JSON.stringify(worklogData));
  });
}

function getMyself(timeSpentMinutes, buttonLabel) {
  const jiraBaseUrl = 'https://jira.nexign.com';
  const myselfEndpoint = '/rest/api/2/myself';

  const request = new XMLHttpRequest();
  request.open('GET', jiraBaseUrl + myselfEndpoint, true);
  request.setRequestHeader('Content-Type', 'application/json');

  request.onreadystatechange = function () {
    if (request.readyState === XMLHttpRequest.DONE) {
      if (request.status === 200) {
        const response = JSON.parse(request.responseText);
        const worker = response.key;

        // После получения имени пользователя (worker) переходим к функции списания (передав все нужные аргументы)
        const originTaskId = document.getElementById('key-val').rel;
        logWork(worker, timeSpentMinutes, originTaskId, buttonLabel); // Здесь timeSpentMinutes - списываемое время в минутах.
      } else {
        console.error('Ошибка при получении информации о текущем пользователе.');
        console.error('Status:', request.status);
        console.error('Response:', request.responseText);
      }
    }
  };

  request.send();
}

function addButton(buttonLabel, timeSpentMinutes) {
  const assignIssueButton = document.createElement("button");
  assignIssueButton.setAttribute("id", "assign-issue");
  assignIssueButton.setAttribute("title", `Отметить ТЗ за ${buttonLabel}`);
  assignIssueButton.setAttribute("class", "aui-button toolbar-trigger resolved");

  const spanLabel = document.createElement("span");
  spanLabel.setAttribute("class", "trigger-label");
  spanLabel.innerText = buttonLabel;

  assignIssueButton.appendChild(spanLabel);

  const opsbarTransitions = document.getElementById("opsbar-opsbar-transitions");
  if (opsbarTransitions) {
    opsbarTransitions.appendChild(assignIssueButton);
  }

  // Добавляем обработчик события при клике на кнопку.
  assignIssueButton.addEventListener("click", function () {
    // Передаём ТЗ и название кнопки дальше
    getMyself(timeSpentMinutes, buttonLabel);
  });
}

// Пример вызова функции для создания кнопки "НК" со списанием 5 минут.
addButton("НК");

// Пример вызова функции для создания другой кнопки "Координация" со списанием 10 минут.
addButton("Координация");