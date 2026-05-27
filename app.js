const STORAGE_KEY = "password-wallet-data";
const LEGACY_KEY = "password-wallet-credentials";

const services = {
  google: { name: "Google", icon: "./assets/google.jpg" },
  gmail: { name: "Gmail", icon: "./assets/gmail.png" },
  microsoft: { name: "Microsoft", icon: "./assets/microsoft.png" },
  github: { name: "GitHub", icon: "./assets/github.png" },
  netflix: { name: "Netflix", icon: "./assets/netflix.png" },
  prime: { name: "Prime Video", icon: "./assets/prime.jpg" },
  steam: { name: "Steam", icon: "./assets/steam.jpg" },
  crunchyroll: { name: "Crunchyroll", icon: "./assets/crunchyroll.png" },
  leetcode: { name: "LeetCode", icon: "./assets/leetcode.png" },
  pc: { name: "PC / Local", icon: "./assets/pc.png" },
  facebook: { name: "Facebook", icon: "./assets/facebook.png" },
  instagram: { name: "Instagram", icon: "./assets/instagram.png" },
  rockstar: { name: "Rockstar", icon: "./assets/rockstar.png" },
  snapchat: { name: "Snapchat", icon: "./assets/snapchat.png" },
  flipkart: { name: "Flipkart", icon: "./assets/flipkart.png" },
  valorant: { name: "Valorant", icon: "./assets/valorant.png" },
};

const cards = document.querySelectorAll(".service-card");
const userSelect = document.getElementById("user-select");
const addUserBtn = document.getElementById("add-user-btn");
const manageUsersBtn = document.getElementById("manage-users-btn");
const modal = document.getElementById("credential-modal");
const usersModal = document.getElementById("users-modal");
const userList = document.getElementById("user-list");
const closeUsersModalBtn = document.getElementById("close-users-modal");
const form = document.getElementById("credential-form");
const modalIcon = document.getElementById("modal-icon");
const modalTitle = document.getElementById("modal-title");
const modalUserLabel = document.getElementById("modal-user-label");
const usernameInput = document.getElementById("credential-username");
const passwordInput = document.getElementById("credential-password");
const notesInput = document.getElementById("credential-notes");
const togglePasswordBtn = document.getElementById("toggle-password");
const deleteBtn = document.getElementById("delete-credential");
const cancelBtn = document.getElementById("cancel-modal");

let activeServiceId = null;

function createUserId() {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createDefaultStore() {
  const id = createUserId();
  return {
    activeUserId: id,
    users: [{ id, name: "User 1" }],
    credentials: { [id]: {} },
  };
}

function loadStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data.users && data.credentials) {
        return normalizeStore(data);
      }
    }

    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const legacyCreds = JSON.parse(legacyRaw);
      const id = createUserId();
      const store = {
        activeUserId: id,
        users: [{ id, name: "User 1" }],
        credentials: { [id]: legacyCreds },
      };
      persistStore(store);
      localStorage.removeItem(LEGACY_KEY);
      return store;
    }
  } catch {
    /* fall through */
  }

  const store = createDefaultStore();
  persistStore(store);
  return store;
}

function normalizeStore(data) {
  const users = data.users.filter((u) => u.id && u.name);
  if (users.length === 0) {
    return createDefaultStore();
  }

  let activeUserId = data.activeUserId;
  if (!users.some((u) => u.id === activeUserId)) {
    activeUserId = users[0].id;
  }

  const credentials = {};
  users.forEach((u) => {
    credentials[u.id] = data.credentials[u.id] ?? {};
  });

  return { activeUserId, users, credentials };
}

function persistStore(store) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

let store = loadStore();

function getActiveUser() {
  return store.users.find((u) => u.id === store.activeUserId) ?? store.users[0];
}

function getActiveCredentials() {
  const user = getActiveUser();
  if (!store.credentials[user.id]) {
    store.credentials[user.id] = {};
  }
  return store.credentials[user.id];
}

function hasCredentialEntry(entry) {
  if (!entry) return false;
  return Boolean(
    (entry.username && entry.username.trim()) ||
      entry.password ||
      (entry.notes && entry.notes.trim())
  );
}

function updateSavedIndicators() {
  const credentials = getActiveCredentials();
  cards.forEach((card) => {
    const id = card.dataset.serviceId;
    card.classList.toggle("service-card--saved", hasCredentialEntry(credentials[id]));
  });
}

function renderUserSelect() {
  userSelect.replaceChildren(
    ...store.users.map((user) => {
      const option = document.createElement("option");
      option.value = user.id;
      option.textContent = user.name;
      return option;
    })
  );
  userSelect.value = store.activeUserId;
  if (!userSelect.value && store.users[0]) {
    userSelect.value = store.users[0].id;
  }
}

function switchUser(userId) {
  if (!store.users.some((u) => u.id === userId)) return;
  store.activeUserId = userId;
  persistStore(store);
  updateSavedIndicators();
  if (modal.open) {
    const service = activeServiceId ? getService(activeServiceId) : null;
    if (service) {
      refreshModalFields();
    }
  }
}

function promptUserName(defaultName = "") {
  const name = window.prompt("Enter user name:", defaultName);
  if (name === null) return null;
  const trimmed = name.trim();
  if (!trimmed) {
    window.alert("Name cannot be empty.");
    return promptUserName(defaultName);
  }
  return trimmed;
}

function addUser() {
  const name = promptUserName(`User ${store.users.length + 1}`);
  if (!name) return;

  const id = createUserId();
  store.users.push({ id, name });
  store.credentials[id] = {};
  store.activeUserId = id;
  persistStore(store);
  renderUserSelect();
  updateSavedIndicators();
  renderUserList();
}

function renameUser(userId) {
  const user = store.users.find((u) => u.id === userId);
  if (!user) return;

  const name = promptUserName(user.name);
  if (!name) return;

  user.name = name;
  persistStore(store);
  renderUserSelect();
  renderUserList();
  if (modal.open && store.activeUserId === userId) {
    modalUserLabel.textContent = `Saving for ${name}`;
  }
}

function deleteUser(userId) {
  if (store.users.length <= 1) {
    window.alert("You need at least one user.");
    return;
  }

  const user = store.users.find((u) => u.id === userId);
  if (!user) return;

  const creds = store.credentials[userId] ?? {};
  const savedCount = Object.values(creds).filter(hasCredentialEntry).length;
  const message =
    savedCount > 0
      ? `Delete "${user.name}" and their ${savedCount} saved credential(s)?`
      : `Delete "${user.name}"?`;

  if (!window.confirm(message)) return;

  store.users = store.users.filter((u) => u.id !== userId);
  delete store.credentials[userId];

  if (store.activeUserId === userId) {
    store.activeUserId = store.users[0].id;
  }

  persistStore(store);
  renderUserSelect();
  updateSavedIndicators();
  renderUserList();
}

function renderUserList() {
  userList.replaceChildren(
    ...store.users.map((user) => {
      const li = document.createElement("li");
      li.className = "user-list__item";
      li.setAttribute("role", "listitem");

      const name = document.createElement("span");
      name.className = "user-list__name";
      name.textContent = user.name;
      if (user.id === store.activeUserId) {
        const badge = document.createElement("span");
        badge.className = "user-list__active";
        badge.textContent = "Active";
        name.append(document.createTextNode(" "), badge);
      }

      const actions = document.createElement("div");
      actions.className = "user-list__actions";

      const renameBtn = document.createElement("button");
      renameBtn.type = "button";
      renameBtn.className = "btn btn--ghost btn--sm";
      renameBtn.textContent = "Rename";
      renameBtn.addEventListener("click", () => renameUser(user.id));

      const deleteBtnUser = document.createElement("button");
      deleteBtnUser.type = "button";
      deleteBtnUser.className = "btn btn--ghost btn--sm btn--danger";
      deleteBtnUser.textContent = "Delete";
      deleteBtnUser.disabled = store.users.length <= 1;
      deleteBtnUser.addEventListener("click", () => deleteUser(user.id));

      actions.append(renameBtn, deleteBtnUser);
      li.append(name, actions);
      return li;
    })
  );
}

function getService(id) {
  return services[id];
}

function refreshModalFields() {
  const service = getService(activeServiceId);
  const user = getActiveUser();
  if (!service || !user) return;

  const credentials = getActiveCredentials();
  const entry = credentials[activeServiceId] ?? {};

  modalUserLabel.textContent = `Saving for ${user.name}`;
  usernameInput.value = entry.username ?? "";
  passwordInput.value = entry.password ?? "";
  notesInput.value = entry.notes ?? "";
}

function openModal(serviceId) {
  const service = getService(serviceId);
  if (!service) return;

  activeServiceId = serviceId;

  modalIcon.src = service.icon;
  modalIcon.alt = `${service.name} logo`;
  modalTitle.textContent = service.name;
  passwordInput.type = "password";
  togglePasswordBtn.textContent = "Show";
  togglePasswordBtn.setAttribute("aria-label", "Show password");

  refreshModalFields();
  modal.showModal();
  usernameInput.focus();
}

function closeModal() {
  modal.close();
  activeServiceId = null;
}

function openUsersModal() {
  renderUserList();
  usersModal.showModal();
}

userSelect.addEventListener("change", () => {
  switchUser(userSelect.value);
});

addUserBtn.addEventListener("click", addUser);
manageUsersBtn.addEventListener("click", openUsersModal);
closeUsersModalBtn.addEventListener("click", () => usersModal.close());

cards.forEach((card) => {
  card.addEventListener("click", () => openModal(card.dataset.serviceId));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!activeServiceId) return;

  const credentials = getActiveCredentials();
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const notes = notesInput.value.trim();

  if (!username && !password && !notes) {
    delete credentials[activeServiceId];
  } else {
    credentials[activeServiceId] = { username, password, notes };
  }

  persistStore(store);
  closeModal();
  updateSavedIndicators();
});

deleteBtn.addEventListener("click", () => {
  if (!activeServiceId) return;
  const credentials = getActiveCredentials();
  delete credentials[activeServiceId];
  persistStore(store);
  closeModal();
  updateSavedIndicators();
});

cancelBtn.addEventListener("click", closeModal);

togglePasswordBtn.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePasswordBtn.textContent = showing ? "Show" : "Hide";
  togglePasswordBtn.setAttribute(
    "aria-label",
    showing ? "Show password" : "Hide password"
  );
});

modal.addEventListener("cancel", () => {
  activeServiceId = null;
});

renderUserSelect();
updateSavedIndicators();
