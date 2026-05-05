let walks = JSON.parse(localStorage.getItem("walks")) || [];

function save() {
  localStorage.setItem("walks", JSON.stringify(walks));
}

function addWalk() {
  const title = document.getElementById("title").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;

  if (!title || !amount) {
    alert("Заповни всі поля");
    return;
  }

  walks.push({
    id: Date.now(),
    title,
    amount,
    category,
    date: new Date().toLocaleString()
  });

  save();
  render();

  document.getElementById("title").value = "";
  document.getElementById("amount").value = "";
}

function deleteWalk(id) {
  walks = walks.filter(w => w.id !== id);
  save();
  render();
}

function render() {
  const list = document.getElementById("list");
  let total = 0;

  list.innerHTML = "";

  walks.reverse().forEach(w => {
    total += w.amount;

    list.innerHTML += `
      <div class="card">
        <div class="left">
          <div class="category">${w.category} ${w.title}</div>
          <small>${w.date}</small>
        </div>
        <div>
          <span class="amount">${w.amount} грн</span>
          <span class="delete" onclick="deleteWalk(${w.id})">✖</span>
        </div>
      </div>
    `;
  });

  document.getElementById("total").innerText = total;
}

function goBack() {
  window.history.back();
}
render();