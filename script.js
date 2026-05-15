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
let spentValue = 0; // ✅ ВИПРАВЛЕНО: було оголошено як "spent" але використовувалось як "spentValue"

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
    categories.walks    = data.walks    || 0;
    categories.home     = data.home     || 0;
    categories.bills    = data.bills    || 0;
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

// Додати витрату
window.addExpense = async function () {
  const amountInput = document.getElementById("amount");
  const typeSelect  = document.getElementById("expenseType");

  if (!amountInput || !typeSelect) {
    alert("Помилка: немає полів");
    return;
  }

  const amount = Number(amountInput.value);
  const type   = typeSelect.value;

  if (!amount || amount <= 0) {
    alert("Введи правильну суму");
    return;
  }

  spentValue += amount;
  categories[type] += amount;

  await saveBudget();
  amountInput.value = "";
};

// Збереження
async function saveBudget() {
  await setDoc(budgetRef, {
    total,
    spent:    spentValue,
    products: categories.products,
    walks:    categories.walks,
    home:     categories.home,
    bills:    categories.bills
  });
}

// UI
function updateUI() {
  const leftEl  = document.getElementById("left");
  const spentEl = document.getElementById("spent");
  if (leftEl)  leftEl.innerText  = (total - spentValue) + " грн";
  if (spentEl) spentEl.innerText = spentValue + " грн";

  const pt = document.getElementById("productsTotal");
  const wt = document.getElementById("walksTotal");
  const ht = document.getElementById("homeTotal");
  const bt = document.getElementById("billsTotal");
  if (pt) pt.innerText = categories.products + " грн";
  if (wt) wt.innerText = categories.walks    + " грн";
  if (ht) ht.innerText = categories.home     + " грн";
  if (bt) bt.innerText = categories.bills    + " грн";

  // прогрес-бар
  const fill    = document.getElementById("progressFill");
  const pctEl   = document.getElementById("progressPct");
  if (fill && pctEl) {
    const pct = total > 0 ? Math.min(100, (spentValue / total) * 100) : 0;
    fill.style.width = pct + "%";
    pctEl.textContent = Math.round(pct) + "%";
    if (pct > 85)      fill.style.background = "linear-gradient(90deg,#c00,#ff5e6c)";
    else if (pct > 60) fill.style.background = "linear-gradient(90deg,#c06000,#ffc94d)";
    else               fill.style.background = "linear-gradient(90deg,#2aab56,#3ecf6e)";
  }
}

// Обнулення
window.resetMonth = async function () {
  if (!confirm("Обнулити витрати?")) return;

  const now = new Date();

  await addDoc(collection(db, "history"), {
    total,
    spent: spentValue,
    ...categories,
    date:  new Date().toLocaleString(),
    month: now.getMonth() + 1,
    year:  now.getFullYear()
  });

  spentValue   = 0;
  categories   = { products: 0, walks: 0, home: 0, bills: 0 };

  await saveBudget();
};

// Нагадування (Firebase)
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
  if (!container) return;
  container.innerHTML = "";
  snapshot.forEach((docItem) => {
    const item = docItem.data();
    const p = document.createElement("p");
    p.style.cssText =
      "background:var(--surface2);padding:10px 14px;border-radius:10px;" +
      "font-size:13px;margin:6px 0;border-left:3px solid var(--accent);" +
      "cursor:pointer;color:var(--text)";
    p.innerText = "📌 " + item.text + " — " + item.date;
    p.onclick = () => deleteDoc(doc(db, "reminders", docItem.id));
    container.appendChild(p);
  });
});

// Історія
window.loadHistory = async function () {
  const container     = document.getElementById("history");
  const selectedMonth = Number(document.getElementById("monthFilter").value);
  const selectedYear  = Number(document.getElementById("yearFilter").value);

  container.innerHTML = "";

  if (!selectedMonth || !selectedYear) {
    container.innerHTML = "<p style='color:var(--muted);font-size:13px'>Оберіть місяць і рік</p>";
    return;
  }

  const snap = await getDocs(collection(db, "history"));
  let found = false;

  snap.forEach((docItem) => {
    const d = docItem.data();
    let itemMonth = d.month;
    let itemYear  = d.year;

    if (!itemMonth || !itemYear) {
      const parts = String(d.date).split(",")[0].split(".");
      itemMonth = Number(parts[1]);
      itemYear  = Number(parts[2]);
    }

    if (Number(itemMonth) === selectedMonth && Number(itemYear) === selectedYear) {
      found = true;
      const block = document.createElement("div");
      block.style.cssText =
        "background:var(--surface2);border-radius:12px;padding:14px;" +
        "margin:8px 0;border-left:3px solid var(--accent);" +
        "font-size:13px;line-height:1.9;color:var(--text)";
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
    container.innerHTML = "<p style='color:var(--muted);font-size:13px'>Немає даних за цей місяць і рік</p>";
  }
};

// ✅ ВИПРАВЛЕНО: прибрано "pages/" — всі файли в одній папці
window.goTo = function (page) {
  window.location.href = page;
};

// Плани (превʼю)
function renderPlansPreview() {
  const plans     = JSON.parse(localStorage.getItem("plans")) || [];
  const container = document.getElementById("plansPreview");
  if (!container) return;

  if (plans.length === 0) {
    container.innerHTML = "<p style='color:var(--muted);font-size:13px'>Немає планів 😢</p>";
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  plans.sort((a, b) => new Date(a.date) - new Date(b.date));
  container.innerHTML = "";

  plans.slice(0, 5).forEach(p => {
    const badge = p.date === today ? " 🔥 Сьогодні" : "";
    container.innerHTML += `
      <div style="background:var(--surface2);border-radius:10px;padding:10px 14px;
                  margin:6px 0;border-left:3px solid var(--yellow);font-size:13px">
        <b style="color:var(--yellow)">${p.date}</b>${badge}<br>
        ${p.text}
      </div>`;
  });
}

// Календар
function renderCalendar() {
  const container = document.getElementById("calendar");
  if (!container) return;

  const now   = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today       = now.getDate();

  const monthNames = [
    "Січень","Лютий","Березень","Квітень","Травень","Червень",
    "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
  ];

  const title = document.getElementById("monthTitle");
  if (title) title.innerText = `${monthNames[month]} ${year}`;

  let html = "<div class='cal-grid'>";

  ["Пн","Вт","Ср","Чт","Пт","Сб","Нд"].forEach(d => {
    html += `<div class="cal-dn">${d}</div>`;
  });

  // зміщення: getDay() повертає 0=нд, тому коригуємо на Пн
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  for (let i = 0; i < offset; i++) html += "<div></div>";

  const saved = JSON.parse(localStorage.getItem("selectedDays")) || [];

  for (let d = 1; d <= daysInMonth; d++) {
    let cls = "cal-day";
    if (d === today)              cls += " cal-today";
    if (saved.includes(String(d))) cls += " cal-selected";
    html += `<div class="${cls}" onclick="selectDate(this)">${d}</div>`;
  }

  html += "</div>";
  container.innerHTML = html;
}

window.selectDate = function (el) {
  el.classList.toggle("cal-selected");
  let selected = JSON.parse(localStorage.getItem("selectedDays")) || [];
  const day = el.innerText;
  if (selected.includes(day)) {
    selected = selected.filter(d => d !== day);
  } else {
    selected.push(day);
  }
  localStorage.setItem("selectedDays", JSON.stringify(selected));
};

// Запуск
renderPlansPreview();
renderCalendar();