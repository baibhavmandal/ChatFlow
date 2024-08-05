const socket = io();
const ChatForm = document.getElementById("chat-form");
const chatMessage = document.querySelector(".chat-messages");

// Get username and room from URL
const url = new URL(window.location.href);
const params = new URLSearchParams(url.search);

const username = params.get("username");
const room = params.get("room");

// Join room
socket.emit("joinRoom", { username, room });

// Get room users
socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message from server
socket.on("message", (message) => {
  outputMessage(message);
});

ChatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get message text
  const msg = e.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  // Scroll down
  chatMessage.scrollTop = chatMessage.scrollHeight;

  // Clear input
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
});

// Output message DOM
function outputMessage(msg) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
            <p class="text">
              ${msg.text}
            </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  document.getElementById("room-name").innerHTML = room;
}

// Add users to DOM
function outputUsers(users) {
  document.getElementById("users").innerHTML = `${users
    .map((user) => `<li>${user.username}</li>`)
    .join("")}`;
}
