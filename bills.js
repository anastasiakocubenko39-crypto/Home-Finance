const services = [
  "Газ (розподіл 1)", "Газ (розподіл 2)", "Газ старий", "Газ постачання",
  "Сміття", "Електроенергія", "Абонплата тепло", "Тепло", "Гаряча вода",
  "Абонплата навантаження", "Водовідведення", "Вода",
  "Великогабаритні відходи", "Управління багатоквартирним будинком", "Квартплата"
];

let bills   = JSON.parse(localStorage.getItem("bills"))        || [];
let history = JSON.parse(localStorage.getItem("billsHistory")) || [];
let meters  = JSON.parse(localStorage.getItem("meters"))       || [
  { name: "Газ", value: "" }, { name: "Вода", value: "" }, { name: "Світло", value: "" }
];

function save() {
  localStorage.setItem("bills",        JSON.stringify(bills));
  localStorage.setItem("billsHistory", JSON.stringify(history));
  localStorage.setItem("meters",       JSON.stringify(meters));
}

if (bills.length === 0) {
  bills = services.map(name => ({ name, amount: 0, paid: false }));
}

function render() {
  const container = document.getElementById("billsList");
  const totalDiv  = document.getElementById("total");
  container.innerHTML = "";
  let total = 0;

  bills.forEach((b, index) => {
    total += Number(b.amount);
    const div = document.createElement("div");
    div.className = "bill-card";
    div.innerHTML = `
      <h3>${b.name}</h3>
      <input type="number" placeholder="Сума (грн)" value="${b.amount}"
        style="width:100%;margin:8px 0 6px" onchange="updateAmount(${index}, this.value)">
      <div class="bill-status ${b.paid ? 'paid' : 'unpaid'}">
        ${b.paid ? "🟢 Оплачено" : "🔴 Не оплачено"}
      </div>
      <button class="btn sm" style="width:100%;margin-top:10px" onclick="pay(${index})">Оплатити</button>`;
    container.appendChild(div);
  });

  totalDiv.innerText = total + " грн";
  localStorage.setItem("billsTotal", total);
}

window.updateAmount = function (index, value) { bills[index].amount = Number(value); save(); render(); };

window.pay = function (index) {
  const bill = bills[index];
  if (!bill.amount) { alert("Введи суму"); return; }
  bill.paid = true;
  history.push({ name: bill.name, amount: bill.amount, date: new Date().toLocaleString() });
  save(); render();
};

function renderMeters() {
  const container = document.getElementById("meters");
  container.innerHTML = "";
  meters.forEach((m, index) => {
    const div = document.createElement("div");
    div.className = "bill-card";
    div.innerHTML = `
      <h3>📟 ${m.name}</h3>
      <input type="number" placeholder="Показник" value="${m.value}"
        style="width:100%;margin-top:8px" onchange="updateMeter(${index}, this.value)">`;
    container.appendChild(div);
  });
}

window.updateMeter = function (index, value) { meters[index].value = value; save(); };

window.openHistory = function () {
  const modal = document.getElementById("historyModal");
  const list  = document.getElementById("historyList");
  modal.classList.add("open");
  list.innerHTML = "";
  if (!history.length) { list.innerHTML = "<p style='color:var(--muted);font-size:13px'>Ще немає оплат</p>"; return; }
  history.slice().reverse().forEach(h => {
    const div = document.createElement("div");
    div.style.cssText = "background:var(--surface2);border-radius:10px;padding:12px 14px;margin:8px 0;border-left:3px solid var(--accent);font-size:13px;line-height:1.7";
    div.innerHTML = `<b>${h.name}</b><br>${h.amount} грн<br><small style="color:var(--muted)">${h.date}</small>`;
    list.appendChild(div);
  });
};

window.closeHistory = function () { document.getElementById("historyModal").classList.remove("open"); };

function goHome() { window.location.href = "index.html"; } // ✅ виправлено з "../index.html"

render();
renderMeters();