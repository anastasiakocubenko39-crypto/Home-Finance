// 🔥 14 ПОСЛУГ (як у тебе)
const services = [
  "Газ (розподіл 1)",
  "Газ (розподіл 2)",
  "Газ старий",
  "Газ постачання",
  "Сміття",
  "Електроенергія",
  "Абонплата тепло",
  "Тепло",
  "Гаряча вода",
  "Абонплата навантаження",
  "Водовідведення",
  "Вода",
  "Великогабаритні відходи",
  "Управління багатоквартирним будинком",
  "Квартплата"
];
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let history = JSON.parse(localStorage.getItem("billsHistory")) || [];
let meters = JSON.parse(localStorage.getItem("meters")) || [
  { name: "Газ", value: "" },
  { name: "Вода", value: "" },
  { name: "Світло", value: "" }
];

function save() {
  localStorage.setItem("bills", JSON.stringify(bills));
  localStorage.setItem("billsHistory", JSON.stringify(history));
  localStorage.setItem("meters", JSON.stringify(meters));
}

// створення якщо пусто
if (bills.length === 0) {
  bills = services.map(name => ({
    name,
    amount: 0,
    paid: false
  }));
}

// 🔥 РЕНДЕР ПЛАТЕЖІВ
function render() {
  const container = document.getElementById("billsList");
  const totalDiv = document.getElementById("total");

  container.innerHTML = "";
  let total = 0;

  bills.forEach((b, index) => {
    total += Number(b.amount);

    container.innerHTML += `
      <div class="card">
        <h3>${b.name}</h3>

        <input type="number"
          placeholder="Сума"
          value="${b.amount}"
          onchange="updateAmount(${index}, this.value)">

        <div class="status ${b.paid ? 'green' : 'red'}">
          ${b.paid ? "🟢 Оплачено" : "🔴 Не оплачено"}
        </div>

        <button onclick="pay(${index})">
          Оплатити
        </button>
      </div>
    `;
  });

  totalDiv.innerText = total;
}

// 💰 ОНОВИТИ СУМУ
window.updateAmount = function(index, value) {
  bills[index].amount = Number(value);
  save();
};

// 💸 ОПЛАТА
window.pay = function(index) {
  const bill = bills[index];

  if (!bill.amount) {
    alert("Введи суму");
    return;
  }

  bill.paid = true;

  history.push({
    name: bill.name,
    amount: bill.amount,
    date: new Date().toLocaleString()
  });

  save();
  render();
};

// 📟 ЛІЧИЛЬНИКИ
function renderMeters() {
  const container = document.getElementById("meters");
  container.innerHTML = "";

  meters.forEach((m, index) => {
    container.innerHTML += `
      <div class="card">
        <h3>${m.name}</h3>

        <input type="number"
          placeholder="Показник"
          value="${m.value}"
          onchange="updateMeter(${index}, this.value)">
      </div>
    `;
  });
}

window.updateMeter = function(index, value) {
  meters[index].value = value;
  save();
};

// 📜 ІСТОРІЯ
window.openHistory = function() {
  const modal = document.getElementById("historyModal");
  const list = document.getElementById("historyList");

  modal.style.display = "block";
  list.innerHTML = "";

  history.forEach(h => {
    list.innerHTML += `
      <div>
        <b>${h.name}</b><br>
        ${h.amount} грн<br>
        <small>${h.date}</small>
        <hr>
      </div>
    `;
  });
};

window.closeHistory = function() {
  document.getElementById("historyModal").style.display = "none";
};

function goHome() {
  window.location.href = "../index.html";
}

// 🚀 СТАРТ
render();
renderMeters();