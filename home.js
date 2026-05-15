let items = JSON.parse(localStorage.getItem("homeItems")) || [];

function save() {
  localStorage.setItem("homeItems", JSON.stringify(items));
  // sync кількість до головної (загальна кількість одиниць)
  const total = items.reduce((s, i) => s + Number(i.amount || 0), 0);
  localStorage.setItem("homeTotal", total);
}

function getStatus(amount) {
  if (amount > 2) return { text: "✅ Є",            cls: "green" };
  if (amount > 0) return { text: "⚠️ Закінчується", cls: "orange" };
  return              { text: "❌ Купити",           cls: "red" };
}

window.addItem = function () {
  const name     = document.getElementById("name").value;
  const amount   = Number(document.getElementById("amount").value);
  const unit     = document.getElementById("unit").value;
  const category = document.getElementById("category").value;
  const desc     = document.getElementById("desc").value;
  const image    = document.getElementById("image").value;

  if (!name || isNaN(amount)) { alert("Заповни поля"); return; }

  items.push({ id: Date.now(), name, amount, unit, category, desc, image });
  save();
  render();
  document.getElementById("name").value   = "";
  document.getElementById("amount").value = "";
  document.getElementById("desc").value   = "";
  document.getElementById("image").value  = "";
};

window.markEmpty = function (id) {
  items = items.map(i => i.id === id ? { ...i, amount: 0 } : i);
  save(); render();
};

window.buyBack = function (id) {
  items = items.map(i => i.id === id ? { ...i, amount: 1 } : i);
  save(); render();
};

window.deleteItem = function (id) {
  if (!confirm("Точно видалити?")) return;
  items = items.filter(i => i.id !== id);
  save(); render();
};

function render() {
  const sections  = document.getElementById("sections");
  const emptyList = document.getElementById("emptyList");
  if (!sections || !emptyList) return;
  sections.innerHTML  = "";
  emptyList.innerHTML = "";

  const cats = ["Кухня","Ванна","Прання","Підлога","Вікна","Гігієна"];

  cats.forEach(cat => {
    const filtered = items.filter(i => i.category === cat && i.amount > 0);
    if (!filtered.length) return;

    const wrap   = document.createElement("div");
    const title  = document.createElement("div");
    title.style.cssText = "font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:1px;color:var(--muted);padding:12px 0 6px";
    title.textContent   = cat;
    wrap.appendChild(title);

    const scroll = document.createElement("div");
    scroll.className = "home-scroll";

    filtered.forEach(i => {
      const s    = getStatus(i.amount);
      const card = document.createElement("div");
      card.className = "home-item-card";
      card.innerHTML = `
        <img src="${i.image || 'https://via.placeholder.com/200x90/1a2535/3ecf6e?text=🧴'}"
             alt="${i.name}"
             onerror="this.src='https://via.placeholder.com/200x90/1a2535/3ecf6e?text=🧴'">
        <div class="home-item-body">
          <h3>${i.name}</h3>
          <div style="font-size:12px;color:var(--muted)">${i.amount} ${i.unit}${i.desc ? ' · ' + i.desc : ''}</div>
          <div class="home-item-status ${s.cls}" style="margin:4px 0">${s.text}</div>
          <button class="btn sm" style="width:100%;margin-top:6px" onclick="markEmpty(${i.id})">Закінчилось</button>
        </div>`;
      scroll.appendChild(card);
    });
    wrap.appendChild(scroll);
    sections.appendChild(wrap);
  });

  const empty = items.filter(i => i.amount === 0);
  if (!empty.length) {
    emptyList.innerHTML = "<div style='text-align:center;padding:24px;color:var(--muted);font-size:14px'>Все є 👍</div>";
    return;
  }
  const emptyScroll = document.createElement("div");
  emptyScroll.className = "home-scroll";
  empty.forEach(i => {
    const card = document.createElement("div");
    card.className = "home-item-card";
    card.innerHTML = `
      <img src="${i.image || 'https://via.placeholder.com/200x90/1a2535/ff5e6c?text=🛒'}"
           alt="${i.name}"
           onerror="this.src='https://via.placeholder.com/200x90/1a2535/ff5e6c?text=🛒'">
      <div class="home-item-body">
        <h3>${i.name}</h3>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button class="btn sm" style="flex:1" onclick="buyBack(${i.id})">Купити</button>
          <button class="btn sm danger" onclick="deleteItem(${i.id})">🗑</button>
        </div>
      </div>`;
    emptyScroll.appendChild(card);
  });
  emptyList.appendChild(emptyScroll);
}

function goBack() { window.location.href = "index.html"; } // ✅ виправлено

render();