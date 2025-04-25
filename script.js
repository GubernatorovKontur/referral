// Глобальные переменные
let scenarios = []; // Массив сценариев из JSON
let currentStage = 0; // Текущий этап сценария
let logEntries = []; // Журнал действий (комментарии)
let history = []; // История этапов для кнопки "Назад"
let choiceHistory = []; // История выборов пользователя

// Загрузка сценариев из JSON
async function loadScenarios() {
  try {
    const response = await fetch('scenarios.json');
    if (!response.ok) {
      throw new Error('Не удалось загрузить scenarios.json');
    }
    scenarios = await response.json();
    displayStage(0); // Отображаем первый этап
  } catch (error) {
    document.getElementById("stage-text").innerText = `Ошибка загрузки: ${error.message}`;
  }
}

// Отображение этапа сценария
function displayStage(stageId) {
  const stage = scenarios.find(s => s.id === stageId);
  if (!stage) {
    document.getElementById("stage-text").innerText = "Этап не найден";
    return;
  }

  // Сохраняем текущий этап в историю
  history.push(currentStage);
  currentStage = stageId;

  // Обновляем текст этапа
  document.getElementById("stage-text").innerText = stage.text;

  // Формируем кнопки вариантов ответа
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  stage.options.forEach(option => {
    const btn = document.createElement("button");
    btn.innerText = option.text;
    btn.onclick = () => {
      logEntries.push(option.log); // Добавляем действие в журнал
      choiceHistory.push({ stageId: currentStage, choice: option.text, next: option.next });
      updateLog();
      updateHistory();
      displayStage(option.next); // Переходим к следующему этапу
    };
    optionsDiv.appendChild(btn);
  });

  // Показываем/скрываем кнопку "Назад"
  const backBtn = document.getElementById("back-btn");
  backBtn.style.display = history.length > 0 ? "block" : "none";
}

// Обновление журнала
function updateLog() {
  document.getElementById("log").value = logEntries.join("\n");
}

// Обновление истории выборов
function updateHistory() {
  const historyList = document.getElementById("history-list");
  historyList.innerHTML = "";
  choiceHistory.forEach((entry, index) => {
    const li = document.createElement("li");
    li.innerText = `${entry.choice} (Этап ${entry.stageId})`;
    li.style.cursor = "pointer";
    li.onclick = () => {
      currentStage = entry.next;
      logEntries = logEntries.slice(0, index + 1); // Обрезаем журнал
      history = history.slice(0, index + 1); // Обрезаем историю этапов
      choiceHistory = choiceHistory.slice(0, index + 1); // Обрезаем историю выборов
      displayStage(currentStage);
      updateLog();
      updateHistory();
    };
    historyList.appendChild(li);
  });
}

// Возврат на предыдущий этап
function goBack() {
  if (history.length > 0) {
    currentStage = history.pop();
    choiceHistory.pop();
    logEntries.pop(); // Удаляем последнее действие из журнала
    displayStage(currentStage);
    updateLog();
    updateHistory();
  }
}

// Обработчик кнопки "Назад"
document.getElementById("back-btn").onclick = goBack;

// Копирование журнала
document.getElementById("copy-log-btn").onclick = () => {
  const logText = document.getElementById("log");
  logText.select();
  document.execCommand("copy");
  alert("Журнал скопирован!");
};

// Очистка журнала и истории
document.getElementById("clear-log-btn").onclick = () => {
  logEntries = [];
  choiceHistory = [];
  history = [];
  updateLog();
  updateHistory();
  alert("Журнал и история очищены!");
};

// Сохранение данных клиента
document.getElementById("save-client-data").onclick = () => {
  // Получаем значения полей
  const lprName = document.getElementById("lpr-name").value.trim();
  const companyName = document.getElementById("company-name").value.trim();
  const managerName = document.getElementById("manager-name").value.trim();

  // Формируем комментарий только с заполненными полями
  const clientData = [];
  if (lprName || companyName || managerName) {
    clientData.push("--- Данные клиента ---");
    if (lprName) clientData.push(`Имя ЛПР: ${lprName}`);
    if (companyName) clientData.push(`Название компании: ${companyName}`);
    if (managerName) clientData.push(`Имя менеджера: ${managerName}`);
  } else {
    alert("Заполните хотя бы одно поле!");
    return;
  }

  // Добавляем данные в начало журнала
  logEntries.unshift(...clientData);
  updateLog();

  // Очищаем поля
  document.getElementById("lpr-name").value = "";
  document.getElementById("company-name").value = "";
  document.getElementById("manager-name").value = "";

  alert("Данные клиента сохранены в журнал!");
};

// Копирование текста письма для реферальной программы
document.getElementById("copy-email-btn").onclick = () => {
  const lprName = document.getElementById("lpr-name").value.trim() || "[Имя ЛПР]";
  const companyName = document.getElementById("company-name").value.trim() || "[Название организации]";

  const emailText = `Добрый день, ${lprName}!

Мы ценим, что Вы являетесь клиентом Контура, и хотим предложить отличную возможность получать дополнительный доход без лишних усилий благодаря программе реферального партнерства!

Как это работает?
1. Регистрируетесь в нашей партнерской программе.
2. Приглашаете друзей, коллег или клиентов через Вашу уникальную ссылку.
3. Зарабатываете вознаграждение за каждого привлеченного партнера или покупателя.

В реферальной программе вам требуется выбрать вид партнерства:
Физическое лицо
· Из вознаграждения вычитается НДФЛ — 13 %.
· Вывод вознаграждения в пару кликов
Юридическое лицо/ИП
· Мы не будем вычитать налог на доходы физических лиц — 13 %.
· Если у вас нет электронной подписи для обмена документами, вам нужно будет ее приобрести.
· Для перечисления вознаграждения у вас должен быть открыт счет в банке на указанное Юридическое лицо/ИП.

Если вы готовы стать реферальным партнером, то я могу помочь вам зарегистрироваться в личном кабинете и отправить с вами первую заявку или создать реферальную ссылку.

Полезные видео:
• Основные правила: https://vimeo.com/783628694
• Как стать участником: https://vimeo.com/782887441
• Обзор кабинета партнера: https://vimeo.com/233288377

Если будут вопросы — звоните или пишите мне.

Надеюсь на взаимовыгодное сотрудничество!`;

  // Копирование текста в буфер обмена
  navigator.clipboard.writeText(emailText).then(() => {
    alert("Текст письма скопирован!");
  }).catch(() => {
    alert("Не удалось скопировать текст. Пожалуйста, скопируйте вручную.");
  });
};

// Запускаем загрузку сценариев
loadScenarios();
