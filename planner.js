let plans = JSON.parse(localStorage.getItem("plans")) || [];

function save() {
  localStorage.setItem("plans", JSON.stringify(plans));
}

window.addPlan = function () {
  const date = document.getElementById("date").value;
  const text = document.getElementById("plan").value;
  if (!date || !text) { alert("Заповни все"); return; }
  plans.push({ id: Date.now(), date, text });
  save();
  render();
  document.getElementById("plan").value = "";
};

window.deletePlan = function (id) {
  plans = plans.filter(p => p.id !== id);
  save();
  render();
};

function render() {
  const container = document.getElementById("plans");
  if (plans.length === 0) {
    container.innerHTML = "<div style='text-align:center;padding:32px;color:var(--muted);font-size:14px'>Немає планів 🌿</div>";
    return;
  }

  plans.sort((a, b) => new Date(a.date) - new Date(b.date));
  const today = new Date().toISOString().split("T")[0];
  container.innerHTML = "";

  plans.forEach(p => {
    const isToday = p.date === today;
    const isPast  = p.date < today;
    const div = document.createElement("div");
    div.className = "plan-card" + (isPast ? " past" : "");
    div.innerHTML = `
      <div>
        <div class="pc-text">${p.text}${isToday ? " 🔥" : ""}</div>
        <div class="pc-date">📅 ${p.date}</div>
      </div>
      <button class="pc-del" onclick="deletePlan(${p.id})">🗑</button>`;
    container.appendChild(div);
  });
}

function goBack() { window.location.href = "index.html"; } // ✅ виправлено

render();