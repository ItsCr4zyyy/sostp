const searchInput = document.getElementById('searchInput');
const resultsDiv = document.getElementById('results');

window.onload = () => {
  fetchItems('');
};

searchInput.addEventListener('input', () => {
  const query = searchInput.value;
  fetchItems(query);
});

function fetchItems(query) {
  fetch(`/api/items?q=${encodeURIComponent(query)}`)
    .then(response => response.json())
    .then(renderResults)
    .catch(err => console.error("Chyba při načítání položek:", err));
}

function renderResults(items) {
  resultsDiv.innerHTML = '';

  if (items.length === 0) {
    resultsDiv.innerHTML = '<p>Žádné položky nebyly nalezeny.</p>';
    return;
  }

  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-group-item';

    const status = item.is_checked_out
      ? `Vypůjčeno do: ${new Date(item.checked_out_until).toLocaleDateString()}`
      : 'Dostupné';

    itemDiv.innerHTML = `
      <h5>${item.name}</h5>
      <p><strong>Autor:</strong> ${item.author || 'Nenalezeno'}<br>
         <strong>Typ:</strong> ${item.type || 'Nenalezeno'}<br>
         <strong>Stav:</strong> ${status || 'Nenalezeno'}</p>
      ${!item.is_checked_out
        ? `<button class="btn btn-success" onclick="checkoutItem(${item.id}, '${item.type}')">Vypůjčit</button>`
        : `<button class="btn btn-danger" onclick="returnItem(${item.id})">Vrátit</button>`
      }
    `;

    resultsDiv.appendChild(itemDiv);
  });
}

function checkoutItem(id, type) {
  const now = new Date();
  const dueDate = new Date(now);

  if (type === 'Kniha') {
    dueDate.setMonth(dueDate.getMonth() + 1);
  } else {
    dueDate.setDate(dueDate.getDate() + 7);
  }

  fetch(`/api/checkout/${id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dueDate: dueDate.toISOString() })
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    fetchItems(searchInput.value);
  })
  .catch(err => console.error("Chyba při vypůjčování:", err));
}

function returnItem(id) {
  fetch(`/api/return/${id}`, {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => {
    alert(data.message);
    fetchItems(searchInput.value);
  })
  .catch(err => console.error("Chyba při vrácení:", err));
}
