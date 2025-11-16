/* =========================================================
   Sinyor Motor – FINAL VERSION (LIST MODE + EDIT)
   ========================================================= */

const APP_KEY = "sinyor_app_v1";

/* =========================================================
   STORAGE
   ========================================================= */
function loadData() {
  let raw = localStorage.getItem(APP_KEY);
  return raw ? JSON.parse(raw) : { products: [] };
}

function saveData(state) {
  localStorage.setItem(APP_KEY, JSON.stringify(state));
}

/* =========================================================
   AUTH
   ========================================================= */
function isLoggedIn() {
  return sessionStorage.getItem("sinyor_logged") === "1";
}

function requireLogin() {
  if (!isLoggedIn()) {
    window.location.href = "login.html";
  }
}

/* =========================================================
   PAGE ROUTER
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.id;

  if (page === "page-login") setupLogin();
  if (page === "page-dashboard") setupDashboard();
  if (page === "page-produk") setupProductsList(); // LIST MODE
});

/* =========================================================
   LOGIN PAGE
   ========================================================= */
function setupLogin() {
  const form = document.getElementById("loginForm");
  const email = document.getElementById("email");
  const pass = document.getElementById("password");
  const err = document.getElementById("loginError");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const em = email.value.trim();
    const pw = pass.value.trim();

    if (!em || !pw) {
      err.textContent = "Email & password wajib diisi.";
      err.classList.remove("hidden");
      return;
    }

    sessionStorage.setItem("sinyor_logged", "1");
    window.location.href = "dashboard.html";
  });
}

/* =========================================================
   DASHBOARD PAGE
   ========================================================= */
function setupDashboard() {
  console.log(">>> DASHBOARD LOADED <<<");

  // tombol logout harus diinisialisasi dulu sebelum dipakai
  const logoutBtn = document.querySelector("#logoutBtn");
  console.log("logoutBtn =", logoutBtn);

  requireLogin();

  // tombol melihat produk
  document.getElementById("lihatProdukBtn").addEventListener("click", () => {
    window.location.href = "products.html";
  });

  // daftar event logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log(">>> LOGOUT CLICKED <<<");
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }

  // HITUNG DATA
  const state = loadData();
  document.getElementById("totalProducts").textContent = state.products.length;
  document.getElementById("totalSales").textContent = state.products.length * 2;
  document.getElementById("totalRevenue").textContent =
    "Rp " + state.products.reduce((t, p) => t + p.price, 0).toLocaleString();

  // DARK MODE
  document.getElementById("toggleDark")?.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("darkmode", document.body.classList.contains("dark"));
  });

  if (localStorage.getItem("darkmode") === "true") {
    document.body.classList.add("dark");
  }
}


/* =========================================================
   PRODUCTS PAGE — LIST MODE + EDIT
   ========================================================= */
function setupProductsList() {
  requireLogin();

  const list = document.getElementById("productList");
  const form = document.getElementById("produkForm");

  const idInput = document.getElementById("prdId"); // <== DITAMBAHKAN UNTUK EDIT
  const nameInput = document.getElementById("prdName");
  const priceInput = document.getElementById("prdPrice");

  const errorBox = document.getElementById("produkError");
  const emptyNote = document.getElementById("emptyNote");
  const resetBtn = document.getElementById("resetForm");
  const dashBtn = document.getElementById("toDashboard");
  const logoutBtn = document.getElementById("logoutBtn2");

  let state = loadData();

  // Seed data kalau kosong
  if (state.products.length === 0) {
    state.products = [
      { id: 1, name: "Oli Mesin", price: 35000 },
      { id: 2, name: "Kampas Rem", price: 45000 },
      { id: 3, name: "Busi Motor", price: 25000 },
    ];
    saveData(state);
  }

  /* =====================================================
      RENDER LIST PRODUK
  ===================================================== */
  function render() {
    list.innerHTML = "";

    if (state.products.length === 0) {
      emptyNote.style.display = "block";
      return;
    }

    emptyNote.style.display = "none";

    state.products.forEach((p) => {
      const li = document.createElement("li");
      li.className = "product-item";

      li.innerHTML = `
        <div>
          <strong>${p.name}</strong><br>
          Harga: Rp ${p.price.toLocaleString()}
        </div>

        <div class="aksi">
          <button class="btn btn-primary" data-edit="${p.id}">Edit</button>
          <button class="btn btn-outline" data-del="${p.id}">Hapus</button>
        </div>
      `;

      list.appendChild(li);
    });
  }

  /* =====================================================
      SUBMIT FORM (TAMBAH + UPDATE)
  ===================================================== */
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nm = nameInput.value.trim();
    const pr = priceInput.value.trim();
    const editId = idInput.value; // <== cek mode edit

    if (!nm || !pr) {
      errorBox.textContent = "Nama produk & harga wajib diisi.";
      errorBox.classList.remove("hidden");
      return;
    }

    errorBox.classList.add("hidden");

    if (editId) {
      // =======================
      // UPDATE PRODUK
      // =======================
      let p = state.products.find((x) => x.id == editId);
      p.name = nm;
      p.price = parseInt(pr);

      saveData(state);
      form.reset();
      idInput.value = ""; // keluar dari mode edit
      render();
      return;
    }

    // =======================
    // TAMBAH PRODUK BARU
    // =======================
    const newProduct = {
      id: Date.now(),
      name: nm,
      price: parseInt(pr),
    };

    state.products.push(newProduct);
    saveData(state);

    form.reset();
    render();
  });

  /* =====================================================
      EDIT + DELETE HANDLER
  ===================================================== */
  list.addEventListener("click", (e) => {
    const del = e.target.dataset.del;
    const edit = e.target.dataset.edit;

    // Hapus
    if (del) {
      if (confirm("Yakin hapus produk ini?")) {
        state.products = state.products.filter((p) => p.id != del);
        saveData(state);
        render();
      }
    }

    // Edit
    if (edit) {
      let p = state.products.find((x) => x.id == edit);

      idInput.value = p.id;
      nameInput.value = p.name;
      priceInput.value = p.price;

      errorBox.classList.add("hidden");
    }
  });

  /* =====================================================
      RESET
  ===================================================== */
  resetBtn.addEventListener("click", () => {
    form.reset();
    idInput.value = ""; // keluar mode edit
    errorBox.classList.add("hidden");
  });

  /* =====================================================
      NAVIGATION
  ===================================================== */
  dashBtn.addEventListener("click", () => {
    window.location.href = "dashboard.html";
  });

  // daftar event logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log(">>> LOGOUT CLICKED <<<");
      sessionStorage.clear();
      window.location.href = "index.html";
    });
  }
}

/* =========================================================
   LOGOUT
   ========================================================= */
function doLogout() {
  sessionStorage.clear();
  window.location.href = "login.html";
}