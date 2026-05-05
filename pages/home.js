let items = JSON.parse(localStorage.getItem("homeItems")) || [];

// 💾 ЗБЕРЕЖЕННЯ
function save() {
  localStorage.setItem("homeItems", JSON.stringify(items));
}

// 📊 СТАТУС
function getStatus(amount) {
  if (amount > 2) return { text: "Є", class: "green" };
  if (amount > 0) return { text: "Закінчується", class: "orange" };
  return { text: "Купити", class: "red" };
}

// ➕ ДОДАТИ
window.addItem = function () {
  const name = document.getElementById("name").value;
  const amount = Number(document.getElementById("amount").value);
  const unit = document.getElementById("unit").value;
  const category = document.getElementById("category").value;
  const desc = document.getElementById("desc").value;
  const image = document.getElementById("image").value;

  if (!name || isNaN(amount)) {
    alert("Заповни поля");
    return;
  }

  items.push({
    id: Date.now(),
    name,
    amount,
    unit,
    category,
    desc,
    image
  });

  save();
  render();
};

// ❗ ЗАКІНЧИЛОСЬ
window.markEmpty = function(id) {
  items = items.map(i => i.id === id ? {...i, amount: 0} : i);
  save();
  render();
};

// ❗ КУПИТИ НАЗАД
window.buyBack = function(id) {
  items = items.map(i => i.id === id ? {...i, amount: 1} : i);
  save();
  render();
};

// ❗ ВИДАЛИТИ
window.deleteItem = function(id) {
  if (!confirm("Точно видалити?")) return;

  items = items.filter(i => i.id !== id);
  save();
  render();
};

// 🎨 РЕНДЕР
function render() {
  const sections = document.getElementById("sections");
  const emptyList = document.getElementById("emptyList");

  if (!sections || !emptyList) return;

  sections.innerHTML = "";
  emptyList.innerHTML = "";

  const categories = [
    "Кухня",
    "Ванна",
    "Прання",
    "Підлога",
    "Вікна",
    "Гігієна"
  ];

  // 🟢 КАТЕГОРІЇ
  categories.forEach(cat => {
    const filtered = items.filter(i => i.category === cat && i.amount > 0);

    if (filtered.length === 0) return;

    let html = `<div class="section"><h2>${cat}</h2><div class="scroll">`;

    filtered.forEach(i => {
      const status = getStatus(i.amount);

      html += `
        <div class="card">
          <img src="${i.image || 'https://via.placeholder.com/200'}">

          <div class="card-body">
            <h3>${i.name}</h3>

            <div>${i.amount} ${i.unit}</div>

            <div class="status ${status.class}">
              ${status.text}
            </div>

            <button onclick="markEmpty(${i.id})">
              Закінчилось
            </button>
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
    sections.innerHTML += html;
  });

  // 🔴 ЗАКІНЧИЛОСЬ
  const empty = items.filter(i => i.amount === 0);

  empty.forEach(i => {
    emptyList.innerHTML += `
      <div class="card">
        <img src="${i.image || 'https://via.placeholder.com/200'}">

        <div class="card-body">
          <h3>${i.name}</h3>

          <button onclick="buyBack(${i.id})">
            Купити
          </button>

          <button onclick="deleteItem(${i.id})" style="background:red">
            Видалити
          </button>
        </div>
      </div>
    `;
  });

  // якщо нічого немає
  if (empty.length === 0) {
    emptyList.innerHTML = "<p>Все є 👍</p>";
  }
}
function goBack() {
  window.history.back();
}
// 🚀 СТАРТ
render();