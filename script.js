import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  getDocs,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCfpBkCjYYkvTI1bMrXeEKtvcqWQx9yX80",
  authDomain: "home-finance-c6bb8.firebaseapp.com",
  projectId: "home-finance-c6bb8",
  storageBucket: "home-finance-c6bb8.firebasestorage.app",
  messagingSenderId: "781971004293",
  appId: "1:781971004293:web:4d597584a0834f2ab182ec"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let total = 0;
let spent = 0;

let categories = {
  products: 0,
  walks: 0,
  home: 0,
  bills: 0
};

const budgetRef = doc(db, "budget", "main");

// LIVE оновлення
onSnapshot(budgetRef, (snap) => {
  if (snap.exists()) {
    const data = snap.data();

    total = data.total || 0;
    spentValue = data.spent || 0;

    categories.products = data.products || 0;
    categories.walks = data.walks || 0;
    categories.home = data.home || 0;
    categories.bills = data.bills || 0;
  }

  updateUI();
});

// Зберегти бюджет
window.setTotal = async function () {
  const value = Number(document.getElementById("totalInput").value);

  if (!value) return alert("Введи бюджет");

  total = value;
  await saveBudget();
};

// ДОДАТИ ВИТРАТУ (🔴 головне тут)
window.addExpense = async function () {
  const amountInput = document.getElementById("amount");
  const typeSelect = document.getElementById("expenseType");

  if (!amountInput || !typeSelect) {
    alert("Помилка: немає полів");
    return;
  }

  const amount = Number(amountInput.value);
  const type = typeSelect.value;

  if (!amount || amount <= 0) {
    alert("Введи правильну суму");
    return;
  }

  spentValue += amount;
  categories[type] += amount;

  await saveBudget();

  amountInput.value = "";
};

// збереження
async function saveBudget() {
  await setDoc(budgetRef, {
    total,
    spent: spentValue,
    products: categories.products,
    walks: categories.walks,
    home: categories.home,
    bills: categories.bills
  });
}

// UI
function updateUI() {
  document.getElementById("left").innerText = total - spentValue;
  document.getElementById("spent").innerText = spentValue;

  document.getElementById("productsTotal").innerText = categories.products + " грн";
  document.getElementById("walksTotal").innerText = categories.walks + " грн";
  document.getElementById("homeTotal").innerText = categories.home + " грн";
  document.getElementById("billsTotal").innerText = categories.bills + " грн";
}

// 🔄 ОБНУЛЕННЯ
window.resetMonth = async function () {
  if (!confirm("Обнулити витрати?")) return;

  const now = new Date();
  const month = now.getMonth() + "-" + now.getFullYear();

 await addDoc(collection(db, "history"), {
  total,
  spent: spentValue,
  ...categories,
  date: new Date().toLocaleString(),
  month: now.getMonth() + 1,
  year: now.getFullYear()
});

  spentValue = 0;
  categories = { products: 0, walks: 0, home: 0, bills: 0 };

  await saveBudget();
};

// 🔔 НАГАДУВАННЯ
window.addReminder = async function () {
  const text = document.getElementById("text").value;
  const date = document.getElementById("date").value;

  if (!text || !date) return alert("Заповни поля");

  await addDoc(collection(db, "reminders"), { text, date });

  document.getElementById("text").value = "";
  document.getElementById("date").value = "";
};

onSnapshot(collection(db, "reminders"), (snapshot) => {
  const container = document.getElementById("result");
  container.innerHTML = "";

  snapshot.forEach((docItem) => {
    const item = docItem.data();

    const p = document.createElement("p");
    p.innerText = "📌 " + item.text + " — " + item.date;

    p.onclick = () => deleteDoc(doc(db, "reminders", docItem.id));

    container.appendChild(p);
  });
});

// 📊 ІСТОРІЯ
window.loadHistory = async function () {
  const container = document.getElementById("history");
  const selectedMonth = Number(document.getElementById("monthFilter").value);
  const selectedYear = Number(document.getElementById("yearFilter").value);

  container.innerHTML = "";

  if (!selectedMonth || !selectedYear) {
    container.innerHTML = "<p>Оберіть місяць і рік</p>";
    return;
  }

  const snap = await getDocs(collection(db, "history"));
  let found = false;

  snap.forEach((docItem) => {
    const d = docItem.data();

    let itemMonth = d.month;
    let itemYear = d.year;

    // якщо старий запис без month/year — беремо з date
    if (!itemMonth || !itemYear) {
      const parts = String(d.date).split(",")[0].split(".");
      itemMonth = Number(parts[1]);
      itemYear = Number(parts[2]);
    }

    if (Number(itemMonth) === selectedMonth && Number(itemYear) === selectedYear) {
      found = true;

      const block = document.createElement("div");
      block.className = "history-card";

      block.innerHTML = `
        <b>📅 ${d.date}</b><br>
        💰 Бюджет: ${d.total || 0} грн<br>
        💸 Витрати: ${d.spent || 0} грн<br>
        🛒 Продукти: ${d.products || 0} грн<br>
        🚶 Прогулянки: ${d.walks || 0} грн<br>
        🧴 Побут: ${d.home || 0} грн<br>
        💡 Комуналка: ${d.bills || 0} грн
      `;

      container.appendChild(block);
    }
  });

  if (!found) {
    container.innerHTML = "<p>Немає даних за цей місяць і рік</p>";
  }
};
// 🔗 ПЕРЕХІД МІЖ СТОРІНКАМИ
window.goTo = function(page) {
  window.location.href = "pages/" + page;
};
// 📅 ПЛАНИ (ПРЕВʼЮ)
function renderPlansPreview() {
  const plans = JSON.parse(localStorage.getItem("plans")) || [];
  const container = document.getElementById("plansPreview");

  if (!container) return;

  if (plans.length === 0) {
    container.innerHTML = "<p>Немає планів 😢</p>";
    return;
  }

  const today = new Date().toISOString().split("T")[0];

  plans.sort((a, b) => new Date(a.date) - new Date(b.date));

  container.innerHTML = "";

  plans.slice(0, 5).forEach(p => {
    let badge = "";

    if (p.date === today) {
      badge = "🔥 Сьогодні";
    }

    container.innerHTML += `
      <div class="plan-card">
        <div><b>${p.date}</b> ${badge}</div>
        <div>${p.text}</div>
      </div>
    `;
  });
}

// 📅 КАЛЕНДАР
function renderCalendar() {


  const container = document.getElementById("calendar");
  if (!container) return;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date().getDate();

  let html = "<div class='calendar'>";

  // дні тижня
  const days = ["Нд","Пн","Вт","Ср","Чт","Пт","Сб"];
  days.forEach(day => {
    html += `<div class="day-name">${day}</div>`;
  });

  // пусті клітинки
  for (let i = 0; i < firstDay; i++) {
    html += "<div></div>";
  }

  // дні місяця
  for (let d = 1; d <= daysInMonth; d++) {
    let className = "date";
    if (d === today) className += " today";

html += `<div class="${className}" onclick="selectDate(this)">${d}</div>`;
  }

  html += "</div>";

container.innerHTML = html;

// 🔥 ОСЬ СЮДИ ВСТАВ
const saved = JSON.parse(localStorage.getItem("selectedDays")) || [];

document.querySelectorAll(".date").forEach(d => {
  if (saved.includes(d.innerText)) {
    d.classList.add("selected");
  }
});

  // назва місяця
  const monthNames = [
    "Січень","Лютий","Березень","Квітень","Травень","Червень",
    "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
  ];

  const title = document.getElementById("monthTitle");
  if (title) {
    title.innerText = `${monthNames[month]} ${year}`;
  }
}

// 🚀 ЗАПУСК
renderPlansPreview();
renderCalendar();

window.selectDate = function(el) {
  el.classList.toggle("selected");

  let selected = JSON.parse(localStorage.getItem("selectedDays")) || [];

  const day = el.innerText;

  if (selected.includes(day)) {
    selected = selected.filter(d => d !== day);
  } else {
    selected.push(day);
  }

  localStorage.setItem("selectedDays", JSON.stringify(selected));
};