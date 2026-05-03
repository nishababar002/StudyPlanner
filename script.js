// ================= USER SYSTEM =================
let users = JSON.parse(localStorage.getItem("users")) || [];

// CHECK LOGIN
if (window.location.pathname.includes("index.html")) {
  if (!localStorage.getItem("loggedInUser")) {
    window.location.href = "./login.html";
  }
}

// SIGNUP
function signup() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  if (username === "" || password === "") {
    alert("Fill all fields");
    return;
  }

  users.push({ username, password });
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup successful!");
}

// LOGIN
function login() {
  let username = document.getElementById("username").value;
  let password = document.getElementById("password").value;

  let user = users.find(
    u => u.username === username && u.password === password
  );

  if (user) {
    localStorage.setItem("loggedInUser", username);
    window.location.href = "./index.html";
  } else {
    alert("Invalid credentials");
  }
}

// LOGOUT
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "./login.html";
}

// ================= TASK SYSTEM =================
let currentUser = localStorage.getItem("loggedInUser");
let allTasks = JSON.parse(localStorage.getItem("tasks")) || {};
let tasks = allTasks[currentUser] || [];

function saveTasks() {
  allTasks[currentUser] = tasks;
  localStorage.setItem("tasks", JSON.stringify(allTasks));
}

function displayTasks(listToShow = tasks) {
  let list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  listToShow.forEach((task, index) => {
    let li = document.createElement("li");

    li.innerHTML = `
      <span onclick="toggleTask(${index})" class="${task.completed ? 'completed' : ''}">
        ${task.name} (${task.date} ${task.time})
      </span>
      <button onclick="deleteTask(${index})">❌</button>
    `;

    list.appendChild(li);
  });

  updateProgress();
}

function addTask() {
  let taskInput = document.getElementById("taskInput");
  let dateInput = document.getElementById("dateInput");
  let timeInput = document.getElementById("timeInput");

  if (taskInput.value === "") {
    alert("Enter task");
    return;
  }

  tasks.push({
    name: taskInput.value,
    date: dateInput.value,
    time: timeInput.value,
    completed: false,
    reminded: false
  });

  taskInput.value = "";
  dateInput.value = "";
  timeInput.value = "";

  saveTasks();
  displayTasks();
}

function deleteTask(index) {
  tasks.splice(index, 1);
  saveTasks();
  displayTasks();
}

function toggleTask(index) {
  tasks[index].completed = !tasks[index].completed;
  saveTasks();
  displayTasks();
}

// ================= FILTERS =================
function showAll() {
  displayTasks(tasks);
}

function showCompleted() {
  displayTasks(tasks.filter(t => t.completed));
}

function showPending() {
  displayTasks(tasks.filter(t => !t.completed));
}

// ================= PROGRESS =================
function updateProgress() {
  let bar = document.getElementById("progressBar");
  let text = document.getElementById("progressText");

  if (tasks.length === 0) {
    bar.style.width = "0%";
    text.innerText = "Progress: 0%";
    return;
  }

  let completed = tasks.filter(t => t.completed).length;
  let percent = Math.round((completed / tasks.length) * 100);

  bar.style.width = percent + "%";
  text.innerText = "Progress: " + percent + "%";
}

// ================= REMINDER =================
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

function checkReminders() {
  let now = new Date();

  tasks.forEach(task => {
    if (task.reminded || !task.time) return;

    let taskTime = new Date(task.date + "T" + task.time);

    if (now >= taskTime) {
      alert("Reminder: " + task.name);

      if (Notification.permission === "granted") {
        new Notification("Reminder", { body: task.name });
      }

      task.reminded = true;
      saveTasks();
    }
  });
}

setInterval(checkReminders, 30000);

displayTasks();