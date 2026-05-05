let plans = JSON.parse(localStorage.getItem("plans")) || [];

function save() {
  localStorage.setItem("plans", JSON.stringify(plans));
}

function addPlan() {
  const date = document.getElementById("date").value;
  const text = document.getElementById("plan").value;

  if (!date || !text) {
    alert("Заповни все");
    return;
  }

  plans.push({
    id: Date.now(),
    date,
    text
  });

  save();
  render();

  document.getElementById("plan").value = "";
}

function deletePlan(id) {
  plans = plans.filter(p => p.id !== id);
  save();
  render();
}

function render() {
  const container = document.getElementById("plans");

  if (plans.length === 0) {
    container.innerHTML = "Немає планів 😢";
    return;
  }

  // сортуємо по даті
  plans.sort((a, b) => new Date(a.date) - new Date(b.date));

  container.innerHTML = "";

  const today = new Date().toISOString().split("T")[0];

  plans.forEach(p => {
    let badge = "";

    if (p.date === today) {
      badge = "🔥 СЬОГОДНІ";
    }

    container.innerHTML += `
      <div class="card">
        <span class="delete" onclick="deletePlan(${p.id})">✖</span>
        <div class="date">${p.date} ${badge}</div>
        <div class="text">${p.text}</div>
      </div>
    `;
  });
}
function goBack() {
  window.history.back();
}
render();