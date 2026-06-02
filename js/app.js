/**
 * Stokbar Umatis — Shared UI utilities & layout
 */

function showToast(message, type = "success") {
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.3s";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function renderSidebar(activePage) {
  const session = getSession();
  if (!session) return;

  const initials = session.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const navBySection = {};
  NAV_ITEMS.filter((n) => n.roles.includes(session.role)).forEach((item) => {
    if (!navBySection[item.section]) navBySection[item.section] = [];
    navBySection[item.section].push(item);
  });

  let navHtml = "";
  Object.entries(navBySection).forEach(([section, items]) => {
    navHtml += `<div class="nav-section-label">${section}</div>`;
    items.forEach((item) => {
      const active = activePage === item.href ? "active" : "";
      navHtml += `<a href="${item.href}" class="nav-link ${active}">
        <span class="nav-icon">${item.icon}</span>
        <span>${item.label}</span>
      </a>`;
    });
  });

  const sidebar = document.getElementById("sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="sidebar-brand">
      <div class="logo">
        <img src="assets/logo.png" alt="Umatis Resto & Venue" class="logo-img" width="48" height="48" />
        <div>
          <div class="logo-text">Stokbar Umatis</div>
          <div class="logo-sub">Umatis Resto &amp; Venue</div>
        </div>
      </div>
    </div>
    <nav class="sidebar-nav">${navHtml}</nav>
    <div class="sidebar-footer">
      <div class="user-chip">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <div class="user-name">${escapeHtml(session.name)}</div>
          <div class="user-role"><span class="badge ${roleBadgeClass(session.role)}">${ROLE_LABELS[session.role]}</span></div>
        </div>
      </div>
      <button type="button" class="btn btn-ghost btn-sm btn-block" style="margin-top:0.75rem" id="btnLogout">Keluar</button>
    </div>
  `;

  document.getElementById("btnLogout")?.addEventListener("click", logout);
}

async function showDbStatusBanner() {
  if (!USE_SUPABASE && (typeof USE_API === "undefined" || !USE_API)) return;
  let el = document.getElementById("dbStatusBanner");
  if (!el) {
    el = document.createElement("div");
    el.id = "dbStatusBanner";
    el.style.cssText =
      "padding:0.5rem 1rem;font-size:0.8rem;font-weight:600;text-align:center;border-bottom:1px solid var(--color-border)";
    const header = document.querySelector(".top-header");
    if (header) header.after(el);
  }
  try {
    if (USE_SUPABASE) {
      await testSupabaseConnection();
      el.style.background = "var(--color-success-bg)";
      el.style.color = "#166534";
      el.textContent = "Terhubung ke Supabase Cloud";
    } else {
      await apiGet("ping");
      el.style.background = "var(--color-success-bg)";
      el.style.color = "#166534";
      el.textContent = "Terhubung ke MySQL (XAMPP)";
    }
  } catch {
    el.style.background = "var(--color-danger-bg)";
    el.style.color = "#991b1b";
    el.textContent = USE_SUPABASE
      ? "Supabase belum dikonfigurasi — isi js/supabase-config.js"
      : "Database tidak terhubung — cek XAMPP / SYNC-KE-XAMPP.bat";
  }
}

function initLayout(activePage, pageTitle) {
  const session = requireAuth();
  if (!session) return null;

  renderSidebar(activePage);
  showDbStatusBanner();

  const titleEl = document.getElementById("pageTitle");
  if (titleEl) titleEl.textContent = pageTitle;

  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  menuToggle?.addEventListener("click", () => {
    sidebar?.classList.toggle("open");
    overlay?.classList.toggle("active");
  });

  overlay?.addEventListener("click", () => {
    sidebar?.classList.remove("open");
    overlay?.classList.remove("active");
  });

  if (isReadOnly()) {
    const content = document.querySelector(".page-content");
    if (content && !document.querySelector(".readonly-banner")) {
      const banner = document.createElement("div");
      banner.className = "readonly-banner";
      banner.innerHTML = "👁️ Mode Owner — Anda hanya dapat melihat data (read-only).";
      content.prepend(banner);
    }
  }

  return session;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso) {
  return new Date(iso).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function waLink(phone, message) {
  const num = phone.replace(/\D/g, "");
  const text = encodeURIComponent(message || "Halo, saya ingin menanyakan ketersediaan stok.");
  return `https://wa.me/${num}?text=${text}`;
}

/**
 * Dropdown + daftar klik untuk pilih barang (transaksi masuk/keluar)
 */
function setupTransactionItemPicker({ pickerId, selectId, hiddenId, hintId, onSelect }) {
  let selectedId = null;
  const pickerEl = document.getElementById(pickerId);
  const selectEl = document.getElementById(selectId);
  const hiddenEl = document.getElementById(hiddenId);
  const hintEl = hintId ? document.getElementById(hintId) : null;

  function setSelected(id, unit) {
    selectedId = id;
    if (hiddenEl) hiddenEl.value = id || "";
    if (selectEl && id) selectEl.value = id;
    if (hintEl && unit) hintEl.textContent = `Satuan: ${unit}`;
    if (pickerEl) {
      pickerEl.querySelectorAll(".item-option").forEach((o) => {
        o.classList.toggle("selected", o.dataset.id === id);
      });
    }
    if (onSelect) onSelect(id, unit);
  }

  function render() {
    const items = getInventory();
    if (selectEl) {
      selectEl.innerHTML =
        '<option value="">— Pilih barang —</option>' +
        items
          .map(
            (i) =>
              `<option value="${escapeHtml(i.id)}">${escapeHtml(i.name)} (${formatStock(i.stock, i.unit)})</option>`
          )
          .join("");
      if (selectedId) selectEl.value = selectedId;
    }
    if (pickerEl) {
      if (!items.length) {
        pickerEl.innerHTML =
          '<p style="color:var(--color-text-muted);font-size:0.875rem;padding:0.5rem">Belum ada barang. Admin: tambah di Katalog Barang dulu.</p>';
        return;
      }
      pickerEl.innerHTML = items
        .map(
          (i) => `
        <div class="item-option ${selectedId === i.id ? "selected" : ""}" data-id="${escapeHtml(i.id)}" data-unit="${escapeHtml(i.unit)}">
          <span><strong>${escapeHtml(i.name)}</strong><br><small>${escapeHtml(i.category)}</small></span>
          <span class="stock-qty">Stok: ${formatStock(i.stock, i.unit)}</span>
        </div>`
        )
        .join("");
      pickerEl.querySelectorAll(".item-option").forEach((el) => {
        el.addEventListener("click", () => setSelected(el.dataset.id, el.dataset.unit));
      });
    }
  }

  if (selectEl) {
    selectEl.addEventListener("change", () => {
      const opt = selectEl.options[selectEl.selectedIndex];
      if (!selectEl.value) {
        setSelected("", "");
        return;
      }
      const item = getItemById(selectEl.value);
      setSelected(selectEl.value, item?.unit || "");
    });
  }

  render();
  return {
    render,
    getSelectedId: () => selectedId || hiddenEl?.value || "",
    clearSelection: () => setSelected("", ""),
  };
}

function openModal(id) {
  document.getElementById(id)?.classList.add("active");
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active");
  }
  if (e.target.dataset?.closeModal) {
    closeModal(e.target.dataset.closeModal);
  }
});
