let walks = JSON.parse(localStorage.getItem("walks")) || [];

function save() {
  localStorage.setItem("walks", JSON.stringify(walks));
}

window.addWalk = function () {
  const title    = document.getElementById("title").value;
  const amount   = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!title || !amount) { alert("Заповни всі поля"); return; }

  walks.push({ id: Date.now(), title, amount, category, date: new Date().toLocaleString() });
  save();
  render();
  document.getElementById("title").value  = "";
  document.getElementById("amount").value = "";
};

window.deleteWalk = function (id) {
  walks = walks.filter(w => w.id !== id);
  save();
  render();
};

function render() {
  const list = document.getElementById("list");
  let total  = 0;
  list.innerHTML = "";

  if (!walks.length) {
    list.innerHTML = "<div style='text-align:center;padding:32px;color:var(--muted);font-size:14px'>Ще немає записів 🌿</div>";
    document.getElementById("total").innerText = "0";
    localStorage.setItem("walksTotal", 0);
    return;
  }

  [...walks].reverse().forEach(w => {
    total += w.amount;
    const div = document.createElement("div");
    div.className = "walk-card";
    div.innerHTML = `
      <div>
        <div class="w-cat">${w.category}</div>
        <div class="w-name">${w.title} · <span style="color:var(--muted);font-size:11px">${w.date}</span></div>
      </div>
      <div style="display:flex;align-items:center;gap:10px">
        <span class="w-amt">${w.amount} грн</span>
        <button class="w-del" onclick="deleteWalk(${w.id})">🗑</button>
      </div>`;
    list.appendChild(div);
  });

  document.getElementById("total").innerText = total;
  localStorage.setItem("walksTotal", total); // ✅ синхронізація з головною
}

function goBack() { window.location.href = "index.html"; } // ✅ виправлено

render();

  document.getElementById("total").innerText = total;
}

function goBack() {
  window.history.back();
}
render();