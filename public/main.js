const API_BASE = 'http://localhost:3000';

const form = document.getElementById('product-form');
const tableBody = document.querySelector('#product-table tbody');
const editModal = document.getElementById('edit-modal');
const closeModalButton = document.querySelector('#edit-modal .close-button');
const editForm = document.getElementById('edit-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');

const searchModal = document.getElementById('search-modal');
const closeSearchButton = document.getElementById('close-search');

const statusModal = document.getElementById('status-modal');
const statusModalContent = document.getElementById('status-modal-content');
const closeStatusButton = document.getElementById('close-status');

// Load products from backend
async function loadProducts() {
  const res = await fetch(`${API_BASE}/api/products`);
  const products = await res.json();
  renderTable(products);
}

// Render product table
function renderTable(products) {
  tableBody.innerHTML = '';
  products.forEach(product => {
    const isSoldOut = product.quantity === 0;
    tableBody.innerHTML += `
      <tr style="background-color: ${isSoldOut ? '#ffe5e5' : 'white'};">
        <td>${product.id}</td>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>${product.price}</td>
        <td>${product.category}</td>
        <td>${product.description}</td>
        <td>
          <button class="action-btn" onclick='openEditModal(${JSON.stringify(product)})'>Edit</button>
          <button class="action-btn" onclick='openStatusModal(${JSON.stringify(product)})'>Status</button>
          <button class="action-btn delete" onclick="deleteProduct(${product.id})">Delete</button>
        </td>
      </tr>
    `;
  });
}

// Add product
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const product = {
    name: document.getElementById('name').value,
    quantity: document.getElementById('quantity').value,
    price: document.getElementById('price').value,
    category: document.getElementById('category').value,
    description: document.getElementById('description').value,
  };

  await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product)
  });

  form.reset();
  loadProducts();
});

// Delete product
async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this shoe?')) {
    await fetch(`${API_BASE}/api/products/${id}`, { method: 'DELETE' });
    loadProducts();
  }
}

// Open edit modal
function openEditModal(product) {
  document.getElementById('edit-id').value = product.id;
  document.getElementById('edit-name').value = product.name;
  document.getElementById('edit-quantity').value = product.quantity;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-category').value = product.category;
  document.getElementById('edit-description').value = product.description;
  editModal.style.display = 'block';
}

// Close modals
closeModalButton.onclick = () => editModal.style.display = 'none';
closeSearchButton.onclick = () => searchModal.style.display = 'none';
closeStatusButton.onclick = () => statusModal.style.display = 'none';

window.onclick = (e) => {
  if (e.target === editModal) editModal.style.display = 'none';
  if (e.target === searchModal) searchModal.style.display = 'none';
  if (e.target === statusModal) statusModal.style.display = 'none';
};

// Update product
editForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = document.getElementById('edit-id').value;
  const updatedProduct = {
    name: document.getElementById('edit-name').value,
    quantity: document.getElementById('edit-quantity').value,
    price: document.getElementById('edit-price').value,
    category: document.getElementById('edit-category').value,
    description: document.getElementById('edit-description').value,
  };

  await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedProduct)
  });

  editModal.style.display = 'none';
  loadProducts();
});

// Search Result Modal
async function showSearchResult(query) {
  if (!query) return;
  try {
    const res = await fetch(`${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const products = await res.json();

    const container = document.getElementById('search-results-container');
    container.innerHTML = '';

    if (products.length > 0) {
      products.forEach(p => {
        container.innerHTML += `
          <div style="border-bottom: 1px solid #ccc; padding: 10px 0;">
            <p><strong>Model Name:</strong> ${p.name}</p>
            <p><strong>Stock:</strong> ${p.quantity}</p>
            <p><strong>Price:</strong> $${p.price}</p>
            <p><strong>Category:</strong> ${p.category}</p>
            <p><strong>Description:</strong> ${p.description}</p>
            <button onclick='openStatusModal(${JSON.stringify(p)})'>Edit Status</button>
          </div>
        `;
      });
      searchModal.style.display = 'block';
    } else {
      alert('No product found.');
    }
  } catch (error) {
    console.error('Error fetching search results:', error);
    alert('An error occurred while searching for products. Please try again.');
  }
}

// Search triggers
searchInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    const query = searchInput.value.trim();
    showSearchResult(query);
  }
});

searchButton.addEventListener('click', function () {
  const query = searchInput.value.trim();
  showSearchResult(query);
});

// Open status modal
function openStatusModal(product) {
  statusModalContent.innerHTML = `
    <h2>Edit Stock Status for ${product.name}</h2>
    <label>Stock Status:</label>
    <select id="new-status">
      <option value="1" ${product.quantity > 0 ? 'selected' : ''}>Available</option>
      <option value="0" ${product.quantity === 0 ? 'selected' : ''}>Sold Out</option>
    </select>
    <br><br>
    <button onclick="updateStatus(${product.id})">Update</button>
  `;
  statusModal.style.display = 'block';
}
function updateStatus(id) {
  const newStatusValue = document.getElementById('new-status').value;
  const newQuantity = parseInt(newStatusValue, 10);
  updateProductStatus(id, newQuantity); // This calls the actual API handler
  statusModal.style.display = 'none';   // Close the modal
  loadProducts();                       // Refresh the table
}


// Update status handler
async function updateProductStatus(id) {
  const status = document.getElementById('new-status').value;
  const quantity = parseInt(status, 10); // Ensure the quantity is an integer (either 0 or 1)

  try {
    const res = await fetch(`http://localhost:3000/api/products/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity })
    });

    const result = await res.json();
    if (res.ok) {
      alert(result.message); // Success message
    } else {
      alert(result.message); // Error message
    }
  } catch (error) {
    console.error('Error updating product status:', error);
    alert('Failed to update status');
  }
}


// Initial load
loadProducts();
