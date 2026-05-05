import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  serverTimestamp
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

let goals = [];
let currentModalId = null;
let currentModalType = null;

const goalsRef = collection(db, "savingsGoals");

window.goHome = function () {
  window.location.href = "../index.html";
};

window.addGoal = async function () {
  const name = document.getElementById("name").value.trim();
  const goal = Number(document.getElementById("goal").value);
  const currency = document.getElementById("currency").value;

  if (!name || !goal || goal <= 0) {
    alert("Заповни назву і правильну суму цілі");
    return;
  }

  await addDoc(goalsRef, {
    name,
    goal,
    current: 0,
    currency,
    history: [],
    createdAt: serverTimestamp()
  });

  document.getElementById("name").value = "";
  document.getElementById("goal").value = "";
};

window.openModal = function (id, type) {
  currentModalId = id;
  currentModalType = type;

  document.getElementById("modalAmount").value = "";

  const goal = goals.find(g => g.id === id);
  if (goal) {
    document.getElementById("modalCurrency").value = goal.currency || "грн";
  }

  document.getElementById("modalTitle").innerText =
    type === "add" ? "➕ Додати гроші" : "➖ Зняти гроші";

  document.getElementById("modal").style.display = "block";
};

window.closeModal = function () {
  document.getElementById("modal").style.display = "none";
  currentModalId = null;
  currentModalType = null;
};

window.confirmAction = async function () {
  const amount = Number(document.getElementById("modalAmount").value);
  const currency = document.getElementById("modalCurrency").value;

  if (!amount || amount <= 0) {
    alert("Введи правильну суму");
    return;
  }

  const goal = goals.find(g => g.id === currentModalId);
  if (!goal) return;

  let newCurrent = Number(goal.current || 0);

  if (currentModalType === "add") {
    newCurrent += amount;
  }

  if (currentModalType === "remove") {
    newCurrent -= amount;
  }

  if (newCurrent < 0) newCurrent = 0;

  const operation = {
    type: currentModalType,
    amount,
    currency,
    date: new Date().toLocaleString()
  };

  const newHistory = [...(goal.history || []), operation];

  await updateDoc(doc(db, "savingsGoals", currentModalId), {
    current: newCurrent,
    history: newHistory
  });

  closeModal();
};

window.deleteGoal = async function (id) {
  if (!confirm("Видалити ціль?")) return;
  await deleteDoc(doc(db, "savingsGoals", id));
};

function render() {
  const container = document.getElementById("list");
  container.innerHTML = "";

  if (goals.length === 0) {
    container.innerHTML = "<p>Немає цілей 😢</p>";
    renderChart();
    return;
  }

  goals.forEach(g => {
    const current = Number(g.current || 0);
    const goal = Number(g.goal || 0);
    const progress = goal > 0 ? Math.min(100, (current / goal) * 100) : 0;
    const remaining = Math.max(0, goal - current);
    const done = current >= goal;

    container.innerHTML += `
      <div class="card ${done ? "done" : ""}">
        <h3>${done ? "🎉" : "💰"} ${g.name}</h3>

        <div class="money-row">
          <span>Ціль:</span>
          <b>${goal} ${g.currency}</b>
        </div>

        <div class="money-row">
          <span>Відкладено:</span>
          <b>${current} ${g.currency}</b>
        </div>

        <div class="remaining">
          ${done ? "Ціль досягнута 🎉" : `Залишилось: ${remaining} ${g.currency}`}
        </div>

        <div class="progress">
          <div class="bar" style="width:${progress}%"></div>
        </div>

        <div class="actions">
          <button onclick="openModal('${g.id}', 'add')">➕ Додати</button>
          <button onclick="openModal('${g.id}', 'remove')">➖ Зняти</button>
          <button onclick="deleteGoal('${g.id}')" style="background:red">❌</button>
        </div>

        <div class="history">
          <b>Історія:</b><br>
          ${
            (g.history || []).length === 0
              ? "Операцій ще немає"
              : (g.history || []).slice().reverse().slice(0, 6).map(h => `
                <div>
                  ${h.type === "add" ? "🟢 +" : "🔴 -"}
                  ${h.amount} ${h.currency}
                  <br><small>${h.date}</small>
                </div>
              `).join("<hr>")
          }
        </div>
      </div>
    `;
  });

  renderChart();
}

function renderChart() {
  const chart = document.getElementById("summaryChart");
  if (!chart) return;

  if (goals.length === 0) {
    chart.innerHTML = "Немає даних";
    return;
  }

  const maxGoal = Math.max(...goals.map(g => Number(g.goal || 0)), 1);

  chart.innerHTML = goals.map(g => {
    const height = Math.max(8, (Number(g.current || 0) / maxGoal) * 110);

    return `
      <div class="chart-bar" style="height:${height}px">
        <span>${g.name.slice(0, 6)}</span>
      </div>
    `;
  }).join("");
}

onSnapshot(goalsRef, (snapshot) => {
  goals = [];

  snapshot.forEach(docItem => {
    goals.push({
      id: docItem.id,
      ...docItem.data()
    });
  });

  render();
});