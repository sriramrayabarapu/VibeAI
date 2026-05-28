// ==========================
// FORM SWITCHING
// ==========================

function showLogin() {

  document.getElementById("registerForm")
  .classList.remove("active");

  document.getElementById("loginForm")
  .classList.add("active");
}

function showRegister() {

  document.getElementById("loginForm")
  .classList.remove("active");

  document.getElementById("registerForm")
  .classList.add("active");
}

// ==========================
// REGISTER USER
// ==========================

function registerUser() {

  let name =
  document.getElementById("regName").value;

  let email =
  document.getElementById("regEmail").value;

  let password =
  document.getElementById("regPassword").value;

  if(name === "" || email === "" || password === "") {

    alert("Please fill all fields");

    return;
  }

  let user = {
    name,
    email,
    password
  };

  localStorage.setItem(
    "vibeUser",
    JSON.stringify(user)
  );

  alert("Registration Successful ✅");

  showLogin();
}

// ==========================
// LOGIN USER
// ==========================

function loginUser() {

  let email =
  document.getElementById("loginEmail").value;

  let password =
  document.getElementById("loginPassword").value;

  let storedUser =
  JSON.parse(
    localStorage.getItem("vibeUser")
  );

  if(!storedUser) {

    alert("Please register first");

    return;
  }

  if(
    email === storedUser.email &&
    password === storedUser.password
  ) {

    localStorage.setItem(
      "isLoggedIn",
      "true"
    );

    localStorage.setItem(
      "loggedInUser",
      storedUser.name
    );

    document.getElementById("authPage")
    .style.display = "none";

    document.getElementById("mainApp")
    .style.display = "block";

    loadUser();

    loadReels();
  }

  else {

    alert("Invalid Login");
  }
}

// ==========================
// LOAD USER
// ==========================

function loadUser() {

  let user =
  localStorage.getItem(
    "loggedInUser"
  ) || "Sriram";

  document.getElementById("welcomeUser")
  .innerHTML =
  "Hi, " + user;

  // Set Instagram profile details keyed by the active logged-in user
  let usernameEl = document.getElementById("profileUsername");
  if (usernameEl) {
    usernameEl.innerHTML = user.toLowerCase().replace(/\s+/g, "_") + "_vibe";
  }

  let fullNameEl = document.getElementById("profileFullName");
  if (fullNameEl) {
    let savedFullName = localStorage.getItem("profile_fullname_" + user);
    fullNameEl.innerHTML = savedFullName || user;
  }

  let bioEl = document.getElementById("profileBio");
  if (bioEl) {
    let savedBio = localStorage.getItem("profile_bio_" + user);
    bioEl.innerHTML = savedBio || "😃 Happy 😃<br>🤩 Enjoy 🤩<br>💖";
  }

  let avatarEl = document.getElementById("profileAvatar");
  if (avatarEl) {
    let savedAvatar = localStorage.getItem("profile_avatar_" + user);
    avatarEl.src = savedAvatar || "https://i.pravatar.cc/200?u=" + user;
  }

  // Populate posts grid in profile
  loadProfileGrid();
}

// ==========================
// CHECK LOGIN
// ==========================

window.onload = () => {
  initHardcodedReel();
  initMusic();

  let isLoggedIn =
  localStorage.getItem(
    "isLoggedIn"
  );

  if(isLoggedIn === "true") {

    document.getElementById("authPage")
    .style.display = "none";

    document.getElementById("mainApp")
    .style.display = "block";

    loadUser();

    loadReels();
  }

  else {

    document.getElementById("mainApp")
    .style.display = "none";
  }
};

// ==========================
// LOGOUT
// ==========================

function logoutUser() {

  localStorage.removeItem(
    "isLoggedIn"
  );

  location.reload();
}

// ==========================
// PAGE NAVIGATION
// ==========================

function showPage(pageId) {

  let pages =
  document.querySelectorAll(".page");

  pages.forEach(page => {

    page.classList.remove("active");
  });

  document.getElementById(pageId)
  .classList.add("active");

  // Manage neumorphic navbar active tab highlight
  let navItems = document.querySelectorAll(".nav-links li");
  navItems.forEach(item => {
    item.classList.remove("active-tab");
    item.style.color = ""; // Clear inline color overrides
    if (item.getAttribute("onclick") === `showPage('${pageId}')`) {
      item.classList.add("active-tab");
    }
  });

  // Show Spotify persistent bottom player bar ONLY when on the music page
  let player = document.getElementById("spotifyPlayer");
  if (player) {
    if (pageId === "music" && currentSongIndex !== -1) {
      player.style.display = "flex";
    } else {
      player.style.display = "none";
    }
  }
}

// ==========================
// GEMINI AI CHATBOT
// ==========================

async function sendMessage() {

  let input =
  document.getElementById("userInput");

  let message =
  input.value.trim();

  if(message === "") {
    return;
  }

  let chatBox =
  document.getElementById("chatBox");

  // USER MESSAGE

  let userDiv =
  document.createElement("div");

  userDiv.classList.add(
    "user-message"
  );

  userDiv.innerText =
  message;

  chatBox.appendChild(userDiv);

  // BOT LOADING MESSAGE

  let botDiv =
  document.createElement("div");

  botDiv.classList.add(
    "bot-message"
  );

  botDiv.innerText =
  "🤖 Thinking...";

  chatBox.appendChild(botDiv);

  chatBox.scrollTop =
  chatBox.scrollHeight;

  input.value = "";

  try {
    let response;
    let data;

    try {
      response = await fetch(
        "http://localhost:3000/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: message
          })
        }
      );
      data = await response.json();
    } catch (proxyError) {
      console.log("Local proxy server is down, falling back to direct API call...", proxyError);
      
      const fallbackResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSyA0ptZBz9Nhe5ASUVP1L_c370py4381jwQ`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: message
                  }
                ]
              }
            ]
          })
        }
      );
      
      data = await fallbackResponse.json();
    }

    console.log(data);

    // SUCCESS RESPONSE

    if(data.error) {
      botDiv.innerText = "❌ " + data.error.message;
    }
    else {
      let aiText = "";

      if(
        data.candidates &&
        data.candidates.length > 0
      ) {
        if(
          data.candidates[0].content &&
          data.candidates[0].content.parts &&
          data.candidates[0].content.parts.length > 0
        ) {
          aiText = data.candidates[0].content.parts[0].text;
        }
        else if(data.candidates[0].output) {
          aiText = data.candidates[0].output;
        }
      }

      if(aiText) {
        botDiv.innerText = aiText;
      }
      else {
        botDiv.innerText = "⚠️ No response from AI";
      }
    }

    chatBox.scrollTop =
    chatBox.scrollHeight;
  }

  catch(error) {

    console.log(error);

    botDiv.innerText =
    "❌ Connection Error";
  }
}

// ==========================
// ENTER KEY SUPPORT
// ==========================

document
.getElementById("userInput")
.addEventListener(
  "keypress",
  function(e) {

    if(e.key === "Enter") {

      sendMessage();
    }
  }
);

// ==========================
// OPEN MODAL
// ==========================

function openUploadModal() {

  document.getElementById("uploadModal")
  .style.display = "flex";
}

// ==========================
// CLOSE MODAL
// ==========================

function closeUploadModal() {

  document.getElementById("uploadModal")
  .style.display = "none";
}

// ==========================
// UPLOAD REEL
// ==========================

function uploadReel() {
  let videoInput = document.getElementById("reelVideo");
  let caption = document.getElementById("reelCaption").value;
  let file = videoInput.files[0];

  if(!file) {
    alert("Please select a video file.");
    return;
  }

  saveReel(file, caption);
}

// ==========================
// SAVE REEL
// ==========================

async function saveReel(file, caption) {
  let id = Date.now();
  
  // Create an object URL for instant local playing (plays instantly & runs immediately)
  const objectURL = URL.createObjectURL(file);

  let reelDataForUI = {
    id: id,
    video: objectURL, // Plays instantly in current session
    caption: caption,
    likes: 0,
    comments: []
  };

  let reelDataForStorage = {
    id: id,
    video: "stored-in-db", // Indicates video blob is inside IndexedDB
    caption: caption,
    likes: 0,
    comments: []
  };

  // 1. Store heavy video Blob directly in IndexedDB (huge quota, 0 localStorage space!)
  await saveVideoBlobToDB(id, file);

  // 2. Store small metadata in localStorage
  let reels = JSON.parse(localStorage.getItem("userReels")) || [];
  reels.unshift(reelDataForStorage);
  localStorage.setItem("userReels", JSON.stringify(reels));

  // Render the user's uploaded video immediately
  createReelUI(reelDataForUI);

  // Update profile posts grid instantly
  loadProfileGrid();

  document.getElementById("reelVideo").value = "";
  document.getElementById("reelCaption").value = "";
  closeUploadModal();

  alert("🎉 Reel Uploaded Successfully!");
}

// ==========================
// CREATE REEL UI
// ==========================

function createReelUI(reelData) {
  let user = localStorage.getItem("loggedInUser") || "Sriram";
  let userAvatar = localStorage.getItem("profile_avatar_" + user) || ("https://i.pravatar.cc/200?u=" + user);
  let userSlug = "@" + user.toLowerCase().replace(/\s+/g, "_");

  let reelsFeed = document.getElementById("reelsFeed");
  let reel = document.createElement("div");
  reel.classList.add("reel-box");

  let likedReels = JSON.parse(localStorage.getItem("likedReels")) || [];
  let isLiked = likedReels.includes(reelData.id.toString());
  let likedClass = isLiked ? " liked" : "";

  let comments = reelData.comments || [];

  reel.innerHTML = `
    <video
      src="${reelData.video}"
      autoplay
      muted
      loop
      controls
      playsinline
      ondblclick="doubleClickLike(${reelData.id}, this)"
    ></video>

    <div class="right-icons">

      <div class="icon-box${likedClass}" id="likeBtn-${reelData.id}" onclick="likeReel(${reelData.id})">
        ❤️
        <span id="likeCount-${reelData.id}">${formatCount(reelData.likes)}</span>
      </div>

      <div class="icon-box" onclick="openCommentsModal(${reelData.id})">
        💬
        <span id="commentCount-${reelData.id}">${comments.length}</span>
      </div>

      <div class="icon-box" onclick="openShareModal(${reelData.id})">
        📤
        <span>Share</span>
      </div>

      <div class="icon-box delete-icon" onclick="deleteDynamicReel(${reelData.id}, this)">
        🗑️
        <span>Delete</span>
      </div>

    </div>

    <div class="bottom-content">

      <div class="profile-row">

        <img src="${userAvatar}">

        <h3>${userSlug}</h3>

      </div>

      <p>${reelData.caption}</p>

    </div>
  `;

  reelsFeed.prepend(reel);
}

// ==========================
// LOAD REELS
// ==========================

async function loadReels() {
  let reels = JSON.parse(localStorage.getItem("userReels")) || [];
  for (let reel of reels) {
    let videoURL = "https://www.w3schools.com/html/mov_bbb.mp4"; // Fallback placeholder
    try {
      let blob = await getVideoBlobFromDB(reel.id);
      if (blob) {
        videoURL = URL.createObjectURL(blob);
      }
    } catch (e) {
      console.error("Failed to load video from DB for reel:", reel.id, e);
    }
    
    let reelData = {
      id: reel.id,
      video: videoURL,
      caption: reel.caption,
      likes: reel.likes || 0,
      comments: reel.comments || []
    };
    
    createReelUI(reelData);
  }
}

// ==========================
// DELETE REELS
// ==========================

function deleteHardcodedReel(btn) {
  if (confirm("Are you sure you want to delete this reel?")) {
    let reelBox = btn.closest(".reel-box");
    if (reelBox) {
      reelBox.classList.add("deleting");
      setTimeout(() => {
        reelBox.remove();
      }, 400);
    }
  }
}

async function deleteDynamicReel(id, btn) {
  if (confirm("Are you sure you want to delete this reel?")) {
    let reelBox = btn.closest(".reel-box");
    if (reelBox) {
      reelBox.classList.add("deleting");
      setTimeout(() => {
        reelBox.remove();
      }, 400);
    }
    let reels = JSON.parse(localStorage.getItem("userReels")) || [];
    reels = reels.filter(reel => reel.id.toString() !== id.toString());
    localStorage.setItem("userReels", JSON.stringify(reels));
    
    // Also delete video Blob from IndexedDB
    await deleteVideoBlobFromDB(id);
  }
}

// ==========================
// INTERACTIVE REEL FEATURES
// ==========================

let activeReelId = null;

function formatCount(num) {
  num = parseInt(num) || 0;
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num;
}

function initHardcodedReel() {
  let hardcodedLikes = localStorage.getItem("likes-hardcoded-1");
  if (hardcodedLikes === null) {
    localStorage.setItem("likes-hardcoded-1", "177000");
  }
  
  let hardcodedComments = localStorage.getItem("comments-hardcoded-1");
  if (hardcodedComments === null) {
    const defaultComments = [
      { username: "pavan___teja", text: "Keeping it real keeping it classy😍", time: "30 m", likes: 12 },
      { username: "name__is_rishi___", text: "Ewwwww 🔥 🔥 🔥", time: "24 m", likes: 1 },
      { username: "steven_nani_00", text: "❤️", time: "26 m", likes: 1 },
      { username: "heyy._munna._00", time: "16 m", text: "❤️ 🔥", likes: 1 },
      { username: "mohansai.25", text: "Big fannn 🙌", time: "1 m", likes: 1 }
    ];
    localStorage.setItem("comments-hardcoded-1", JSON.stringify(defaultComments));
  }

  let likes = parseInt(localStorage.getItem("likes-hardcoded-1"));
  let comments = JSON.parse(localStorage.getItem("comments-hardcoded-1")) || [];
  
  let likeCountSpan = document.getElementById("likeCount-hardcoded-1");
  if (likeCountSpan) {
    likeCountSpan.innerText = formatCount(likes);
  }
  
  let commentCountSpan = document.getElementById("commentCount-hardcoded-1");
  if (commentCountSpan) {
    commentCountSpan.innerText = comments.length;
  }

  let likedReels = JSON.parse(localStorage.getItem("likedReels")) || [];
  if (likedReels.includes("hardcoded-1")) {
    document.getElementById("likeBtn-hardcoded-1").classList.add("liked");
  }
}

function doubleClickLike(id, videoElement) {
  // Create big floating heart
  let container = videoElement.parentElement;
  let heart = document.createElement("div");
  heart.classList.add("big-heart");
  heart.innerHTML = "❤️";
  container.appendChild(heart);

  // Remove heart after animation
  setTimeout(() => {
    heart.remove();
  }, 800);

  // Trigger Like action if not already liked
  let likedReels = JSON.parse(localStorage.getItem("likedReels")) || [];
  if (!likedReels.includes(id.toString())) {
    likeReel(id);
  }
}

function likeReel(id) {
  let idStr = id.toString();
  let likedReels = JSON.parse(localStorage.getItem("likedReels")) || [];
  let isLiked = likedReels.includes(idStr);

  let likeBtn = document.getElementById(`likeBtn-${id}`);
  let likeCountSpan = document.getElementById(`likeCount-${id}`);

  let currentLikes = 0;
  
  if (idStr === "hardcoded-1") {
    currentLikes = parseInt(localStorage.getItem("likes-hardcoded-1")) || 177000;
  } else {
    let reels = JSON.parse(localStorage.getItem("userReels")) || [];
    let reel = reels.find(r => r.id.toString() === idStr);
    if (reel) currentLikes = reel.likes || 0;
  }

  if (isLiked) {
    // Unlike
    likedReels = likedReels.filter(item => item !== idStr);
    currentLikes--;
    if (likeBtn) likeBtn.classList.remove("liked");
  } else {
    // Like
    likedReels.push(idStr);
    currentLikes++;
    if (likeBtn) likeBtn.classList.add("liked");
  }

  localStorage.setItem("likedReels", JSON.stringify(likedReels));

  // Save updated likes to storage and update UI
  if (idStr === "hardcoded-1") {
    localStorage.setItem("likes-hardcoded-1", currentLikes.toString());
  } else {
    let reels = JSON.parse(localStorage.getItem("userReels")) || [];
    let reelIndex = reels.findIndex(r => r.id.toString() === idStr);
    if (reelIndex !== -1) {
      reels[reelIndex].likes = currentLikes;
      localStorage.setItem("userReels", JSON.stringify(reels));
    }
  }

  if (likeCountSpan) {
    likeCountSpan.innerText = formatCount(currentLikes);
  }
}

// COMMENTS LOGIC
function openCommentsModal(id) {
  activeReelId = id.toString();
  
  // Set creator info in header
  let avatarUrl = "https://i.pravatar.cc/200";
  let username = "@your_profile";
  
  if (activeReelId === "hardcoded-1") {
    avatarUrl = "https://i.pravatar.cc/150";
    username = "@sriram_ai";
  }
  
  document.getElementById("commentReelAvatar").src = avatarUrl;
  document.getElementById("commentReelUsername").innerText = username;
  
  // Load and render comments
  renderComments();
  
  document.getElementById("commentsModal").style.display = "flex";
}

function closeCommentsModal() {
  document.getElementById("commentsModal").style.display = "none";
  activeReelId = null;
}

function renderComments() {
  let commentsList = document.getElementById("commentsList");
  commentsList.innerHTML = "";
  
  let comments = [];
  if (activeReelId === "hardcoded-1") {
    comments = JSON.parse(localStorage.getItem("comments-hardcoded-1")) || [];
  } else {
    let reels = JSON.parse(localStorage.getItem("userReels")) || [];
    let reel = reels.find(r => r.id.toString() === activeReelId);
    if (reel) comments = reel.comments || [];
  }
  
  if (comments.length === 0) {
    commentsList.innerHTML = `<div style="text-align: center; color: #64748b; margin-top: 50px;">No comments yet. Be the first to comment!</div>`;
    return;
  }
  
  comments.forEach((comment, index) => {
    let commentDiv = document.createElement("div");
    commentDiv.classList.add("comment-item");
    
    // Avatar logic
    let commenterAvatar = `https://i.pravatar.cc/100?u=${comment.username}`;
    if (comment.username === "pavan___teja") commenterAvatar = "https://i.pravatar.cc/100";
    if (comment.username === "name__is_rishi___") commenterAvatar = "https://i.pravatar.cc/200?u=rishi";
    if (comment.username === "steven_nani_00") commenterAvatar = "https://i.pravatar.cc/200?u=nani";
    if (comment.username === "heyy._munna._00") commenterAvatar = "https://i.pravatar.cc/200?u=munna";
    if (comment.username === "mohansai.25") commenterAvatar = "https://i.pravatar.cc/200?u=mohan";
    
    commentDiv.innerHTML = `
      <img src="${commenterAvatar}" class="comment-avatar">
      <div class="comment-info">
        <div class="comment-user-row">
          <span class="comment-username">${comment.username}</span>
          <span class="comment-text">${comment.text}</span>
        </div>
        <div class="comment-meta">
          <span>${comment.time || "1s"}</span>
          <span>${comment.likes || 0} likes</span>
          <span>Reply</span>
          <button class="comment-like-btn" onclick="likeComment(${index})">❤️</button>
        </div>
      </div>
    `;
    
    commentsList.appendChild(commentDiv);
  });
}

function submitComment() {
  let input = document.getElementById("newCommentInput");
  let text = input.value.trim();
  if (text === "") return;
  
  let loggedInUser = localStorage.getItem("loggedInUser") || "guest_user";
  let newComment = {
    username: loggedInUser,
    text: text,
    time: "1s",
    likes: 0
  };
  
  let comments = [];
  if (activeReelId === "hardcoded-1") {
    comments = JSON.parse(localStorage.getItem("comments-hardcoded-1")) || [];
    comments.push(newComment);
    localStorage.setItem("comments-hardcoded-1", JSON.stringify(comments));
  } else {
    let reels = JSON.parse(localStorage.getItem("userReels")) || [];
    let reelIndex = reels.findIndex(r => r.id.toString() === activeReelId);
    if (reelIndex !== -1) {
      comments = reels[reelIndex].comments || [];
      comments.push(newComment);
      reels[reelIndex].comments = comments;
      localStorage.setItem("userReels", JSON.stringify(reels));
    }
  }
  
  // Update UI Counter
  let commentCountSpan = document.getElementById(`commentCount-${activeReelId}`);
  if (commentCountSpan) {
    commentCountSpan.innerText = comments.length;
  }
  
  input.value = "";
  renderComments();
  
  // Auto scroll to bottom
  let commentsList = document.getElementById("commentsList");
  commentsList.scrollTop = commentsList.scrollHeight;
}

function handleCommentKeyPress(event) {
  if (event.key === "Enter") {
    submitComment();
  }
}

function likeComment(index) {
  let comments = [];
  if (activeReelId === "hardcoded-1") {
    comments = JSON.parse(localStorage.getItem("comments-hardcoded-1")) || [];
    comments[index].likes = (comments[index].likes || 0) + 1;
    localStorage.setItem("comments-hardcoded-1", JSON.stringify(comments));
  } else {
    let reels = JSON.parse(localStorage.getItem("userReels")) || [];
    let reelIndex = reels.findIndex(r => r.id.toString() === activeReelId);
    if (reelIndex !== -1) {
      comments = reels[reelIndex].comments || [];
      comments[index].likes = (comments[index].likes || 0) + 1;
      reels[reelIndex].comments = comments;
      localStorage.setItem("userReels", JSON.stringify(reels));
    }
  }
  renderComments();
}

// SHARE LOGIC
function openShareModal(id) {
  activeReelId = id.toString();
  document.getElementById("shareModal").style.display = "flex";
}

function closeShareModal() {
  document.getElementById("shareModal").style.display = "none";
  activeReelId = null;
}

function shareToWhatsApp() {
  let text = `Check out this amazing reel on VibeAI! 🎬🍿\n${window.location.href}`;
  let whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  window.open(whatsappUrl, "_blank");
  closeShareModal();
}

function copyReelLink() {
  let dummy = document.createElement("input");
  document.body.appendChild(dummy);
  dummy.value = window.location.href;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
  
  closeShareModal();
  
  // Show toast notification
  let toast = document.getElementById("toast");
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ==========================
// INDEXEDDB FOR VIDEO STORAGE
// ==========================

const DB_NAME = "VibeAVideoDB";
const DB_VERSION = 1;
const STORE_NAME = "videoBlobs";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function saveVideoBlobToDB(id, fileBlob) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    store.put({ id: id.toString(), blob: fileBlob });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("IndexedDB Save Error:", error);
  }
}

async function getVideoBlobFromDB(id) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id.toString());
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result ? request.result.blob : null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("IndexedDB Retrieve Error:", error);
    return null;
  }
}

async function deleteVideoBlobFromDB(id) {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    store.delete(id.toString());
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("IndexedDB Delete Error:", error);
  }
}

// ==========================
// AI MUSIC DASHBOARD FEATURES
// ==========================

const PRESET_SONGS = [
  {
    id: "preset-1",
    title: "Levitating",
    artist: "Dua Lipa",
    mood: "enjoy",
    lang: "English",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/59/dc/4d/59dc4dda-93ff-8f1c-c536-f005f6ea6af5/mzaf_3066686759813252385.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/500x500bb.jpg"
  },
  {
    id: "preset-2",
    title: "Someone Like You",
    artist: "Adele",
    mood: "moodoff",
    lang: "English",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/ef/18/7b/ef187b7d-f487-e935-4ca1-af5748313710/mzaf_8455263230305249048.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/eb/ca/25/ebca2596-cd1e-b295-91a3-771c868d0a79/191404113868.png/500x500bb.jpg"
  },
  {
    id: "preset-3",
    title: "Perfect",
    artist: "Ed Sheeran",
    mood: "chill",
    lang: "English",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/c7/ba/bc/c7babc66-f598-aaa6-bcf6-307281795817/mzaf_16337361235117168274.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/15/e6/e8/15e6e8a4-4190-6a8b-86c3-ab4a51b88288/190295851286.jpg/500x500bb.jpg"
  },
  {
    id: "preset-4",
    title: "Blinding Lights",
    artist: "The Weeknd",
    mood: "vibe",
    lang: "English",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/17/b4/8f/17b48f9a-0b93-6bb8-fe1d-3a16623c2cfb/mzaf_9560252727299052414.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/a6/6e/bf/a66ebf79-5008-8948-b352-a790fc87446b/19UM1IM04638.rgb.jpg/500x500bb.jpg"
  },
  // Telugu Songs
  {
    id: "preset-telugu-1",
    title: "Naatu Naatu",
    artist: "M. M. Keeravani, Rahul Sipligunj",
    mood: "enjoy",
    lang: "Telugu",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/8e/dd/a4/8edda474-3fe1-3fe6-43d3-765db520a29b/mzaf_11740310005222997767.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/39/14/dd3914e5-a2f3-b355-51f3-9a1f0e3ca246/8903431853592_cover.jpg/500x500bb.jpg"
  },
  {
    id: "preset-telugu-2",
    title: "Samajavaragamana",
    artist: "Sid Sriram",
    mood: "chill",
    lang: "Telugu",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/94/15/98/941598ae-7248-357a-1e07-be7d50ea7b08/mzaf_11251795343892643096.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/53/98/c1/5398c1cf-7c16-24a6-bfa3-391dc6015376/cover.jpg/500x500bb.jpg"
  },
  {
    id: "preset-telugu-3",
    title: "Oosupodu",
    artist: "Hemachandra",
    mood: "moodoff",
    lang: "Telugu",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/82/46/b6/8246b693-1335-60a0-5d39-9faf9663a5a5/mzaf_17117990304818338977.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/9b/45/fb/9b45fb80-2a39-0f37-d5dc-7eafeafb276d/cover.jpg/500x500bb.jpg"
  },
  {
    id: "preset-telugu-4",
    title: "Butta Bomma",
    artist: "Armaan Malik",
    mood: "vibe",
    lang: "Telugu",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview112/v4/28/e0/d3/28e0d30a-2afe-66e4-ac03-69b6d779fecd/mzaf_7857615290499608693.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/46/aa/48/46aa4863-c1ec-4574-e98e-80b8c1f3ef69/cover.jpg/500x500bb.jpg"
  },
  // Hindi Songs
  {
    id: "preset-hindi-1",
    title: "Kesariya",
    artist: "Arijit Singh",
    mood: "vibe",
    lang: "Hindi",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/38/4c/5c/384c5c8f-3ff8-e457-b2f7-3158ce108649/mzaf_12389299033886433185.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/9f/13/ca/9f13ca3b-e533-03e0-f19a-f0aaa774581d/196589311191.jpg/500x500bb.jpg"
  },
  {
    id: "preset-hindi-2",
    title: "Apna Bana Le",
    artist: "Arijit Singh",
    mood: "chill",
    lang: "Hindi",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview122/v4/09/51/0d/09510dea-6579-5cd0-b13b-696abc2c520b/mzaf_10718921821360997069.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/2e/0b/c0/2e0bc070-112f-a827-6ad8-6bc64f7caaff/840214460180.png/500x500bb.jpg"
  },
  {
    id: "preset-hindi-3",
    title: "Channa Mereya",
    artist: "Arijit Singh",
    mood: "moodoff",
    lang: "Hindi",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/d5/f9/98/d5f998a7-0090-ee2d-03f8-557ad6c5bf65/mzaf_14251357991592637728.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/bc/6e/4d/bc6e4d0c-adec-b431-7b60-16f5689f9664/886446201597.jpg/500x500bb.jpg"
  },
  {
    id: "preset-hindi-4",
    title: "Badtameez Dil",
    artist: "Benny Dayal",
    mood: "enjoy",
    lang: "Hindi",
    audio: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/v4/88/e2/af/88e2af36-3b58-3f34-32c3-d94d3086c8d5/mzaf_15476348080733865142.plus.aac.p.m4a",
    cover: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/62/d6/74/62d67432-0670-631f-db6a-d4bac3adae4b/8902894353328_cover.jpg/500x500bb.jpg"
  }
];

let currentFilteredMood = "all";
let currentFilteredLang = "all";

function initMusic() {
  loadSongs();
}

async function loadSongs() {
  let musicGrid = document.getElementById("musicGrid");
  if (!musicGrid) return;
  musicGrid.innerHTML = "";

  // Update Welcome Title Sriram Rayabarapu
  let welcomeTitle = document.getElementById("spotifyWelcomeUser");
  if (welcomeTitle) {
    let loggedInUser = localStorage.getItem("loggedInUser") || "Sriram Rayabarapu";
    welcomeTitle.innerText = "Made For " + loggedInUser;
  }

  // 1. Gather Preset Songs
  let allSongs = [...PRESET_SONGS];

  // 2. Gather User-uploaded Songs from localStorage metadata
  let userSongsMetadata = JSON.parse(localStorage.getItem("userSongsMetadata")) || [];
  
  for (let metadata of userSongsMetadata) {
    let audioURL = "";
    let coverURL = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200&auto=format&fit=crop";
    
    try {
      let rawData = await getMusicBlobFromDB(metadata.id);
      if (rawData) {
        if (rawData.audioBlob) {
          audioURL = URL.createObjectURL(rawData.audioBlob);
        }
        if (rawData.coverBlob) {
          coverURL = URL.createObjectURL(rawData.coverBlob);
        }
      }
    } catch (e) {
      console.error("Error loading dynamic song Blobs from IndexedDB", e);
    }

    allSongs.push({
      id: metadata.id,
      title: metadata.title,
      artist: metadata.artist,
      mood: metadata.mood,
      lang: metadata.lang || "English",
      audio: audioURL,
      cover: coverURL,
      isUserUploaded: true
    });
  }

  // 3. Filter by current active mood and language
  let filteredSongs = allSongs;
  if (currentFilteredMood !== "all") {
    filteredSongs = allSongs.filter(song => song.mood === currentFilteredMood);
  }
  if (currentFilteredLang !== "all") {
    filteredSongs = filteredSongs.filter(song => (song.lang || "English").toLowerCase() === currentFilteredLang.toLowerCase());
  }

  // Sync current playlist array
  loadedSongsList = filteredSongs;

  // Render horizontal Quick Play capsule grid
  renderQuickPlayGrid(filteredSongs);

  // 4. Render cards
  if (filteredSongs.length === 0) {
    musicGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #64748b; margin-top: 50px;">No songs in this category yet. Upload one!</div>`;
    return;
  }

  filteredSongs.forEach((song, index) => {
    createMusicCard(song, index);
  });
}

function createMusicCard(song, index) {
  let musicGrid = document.getElementById("musicGrid");
  let card = document.createElement("div");
  card.classList.add("spotify-card");
  card.setAttribute("onclick", `playSongByIndex(${index})`);

  let deleteBtnHtml = "";
  if (song.isUserUploaded) {
    deleteBtnHtml = `
      <button onclick="event.stopPropagation(); deleteSong('${song.id}')" style="position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6); border: none; color: #ef4444; font-size: 13px; width: 26px; height: 26px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">🗑️</button>
    `;
  }

  let songLang = song.lang || "English";

  card.innerHTML = `
    <div class="spotify-card-cover">
      <img src="${song.cover}" alt="cover">
      <div class="spotify-play-btn">▶</div>
    </div>
    <h3>${song.title}</h3>
    <p>${song.artist}</p>
    <div class="card-tags-row">
      <span class="mood-tag">${song.mood}</span>
      <span class="lang-tag ${songLang.toLowerCase()}">${songLang}</span>
    </div>
    ${deleteBtnHtml}
  `;

  musicGrid.appendChild(card);
}

function filterMusic(mood, tabBtn) {
  currentFilteredMood = mood;
  
  let tabs = document.querySelectorAll(".mood-tab");
  tabs.forEach(tab => tab.classList.remove("active"));
  tabBtn.classList.add("active");
  
  loadSongs();
}

function filterLanguage(lang, tabBtn) {
  currentFilteredLang = lang;
  
  let tabs = document.querySelectorAll(".lang-tab");
  tabs.forEach(tab => tab.classList.remove("active"));
  tabBtn.classList.add("active");
  
  loadSongs();
}

function openMusicUploadModal() {
  document.getElementById("musicUploadModal").style.display = "flex";
}

function closeMusicUploadModal() {
  document.getElementById("musicUploadModal").style.display = "none";
}

async function uploadSong() {
  let audioInput = document.getElementById("musicFile");
  let titleInput = document.getElementById("musicTitle");
  let artistInput = document.getElementById("musicArtist");
  let moodInput = document.getElementById("musicMood");
  let langInput = document.getElementById("musicLang");
  let coverInput = document.getElementById("musicCover");

  let audioFile = audioInput.files[0];
  let title = titleInput.value.trim();
  let artist = artistInput.value.trim() || "Unknown Artist";
  let mood = moodInput.value;
  let lang = langInput ? langInput.value : "English";
  let coverFile = coverInput.files[0];

  if (!audioFile) {
    alert("Please select an audio file to upload.");
    return;
  }

  if (title === "") {
    alert("Please enter a song title.");
    return;
  }

  let id = Date.now().toString();

  // 1. Save files to IndexedDB (No LocalStorage limit crashes!)
  await saveMusicBlobToDB(id, audioFile, coverFile);

  // 2. Save metadata to localStorage
  let userSongsMetadata = JSON.parse(localStorage.getItem("userSongsMetadata")) || [];
  userSongsMetadata.unshift({
    id: id,
    title: title,
    artist: artist,
    mood: mood,
    lang: lang
  });
  localStorage.setItem("userSongsMetadata", JSON.stringify(userSongsMetadata));

  // Reset inputs & close modal
  audioInput.value = "";
  titleInput.value = "";
  artistInput.value = "";
  coverInput.value = "";
  closeMusicUploadModal();

  alert("🎉 Song Uploaded Successfully!");

  loadSongs();
}

async function deleteSong(id) {
  if (confirm("Are you sure you want to delete this song?")) {
    let userSongsMetadata = JSON.parse(localStorage.getItem("userSongsMetadata")) || [];
    userSongsMetadata = userSongsMetadata.filter(song => song.id.toString() !== id.toString());
    localStorage.setItem("userSongsMetadata", JSON.stringify(userSongsMetadata));

    await deleteMusicBlobFromDB(id);

    loadSongs();
  }
}

// ==========================
// INDEXEDDB FOR MUSIC STORAGE
// ==========================

const MUSIC_DB_NAME = "VibeAMusicDB";
const MUSIC_DB_VERSION = 1;
const MUSIC_STORE_NAME = "musicBlobs";

function openMusicDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(MUSIC_DB_NAME, MUSIC_DB_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(MUSIC_STORE_NAME)) {
        db.createObjectStore(MUSIC_STORE_NAME, { keyPath: "id" });
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

async function saveMusicBlobToDB(id, audioBlob, coverBlob) {
  try {
    const db = await openMusicDB();
    const transaction = db.transaction(MUSIC_STORE_NAME, "readwrite");
    const store = transaction.objectStore(MUSIC_STORE_NAME);
    
    store.put({ 
      id: id.toString(), 
      audioBlob: audioBlob, 
      coverBlob: coverBlob 
    });
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Music IndexedDB Save Error:", error);
  }
}

async function getMusicBlobFromDB(id) {
  try {
    const db = await openMusicDB();
    const transaction = db.transaction(MUSIC_STORE_NAME, "readonly");
    const store = transaction.objectStore(MUSIC_STORE_NAME);
    const request = store.get(id.toString());
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Music IndexedDB Retrieve Error:", error);
    return null;
  }
}

async function deleteMusicBlobFromDB(id) {
  try {
    const db = await openMusicDB();
    const transaction = db.transaction(MUSIC_STORE_NAME, "readwrite");
    const store = transaction.objectStore(MUSIC_STORE_NAME);
    store.delete(id.toString());
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Music IndexedDB Delete Error:", error);
  }
}

// ==========================
// SPOTIFY AUDIO PLAYER ENGINE
// ==========================

let loadedSongsList = [];
let currentSongIndex = -1;
let isPlaying = false;

function renderQuickPlayGrid(songs) {
  let quickGrid = document.getElementById("quickGrid");
  if (!quickGrid) return;
  quickGrid.innerHTML = "";

  // Show up to 8 featured songs
  let limitSongs = songs.slice(0, 8);
  
  limitSongs.forEach((song, index) => {
    let card = document.createElement("div");
    card.classList.add("quick-card");
    card.setAttribute("onclick", `playSongByIndex(${index})`);
    
    card.innerHTML = `
      <img src="${song.cover}">
      <span>${song.title}</span>
      <div class="quick-play-btn">▶</div>
    `;
    
    quickGrid.appendChild(card);
  });
}

function playSongByIndex(index) {
  if (index < 0 || index >= loadedSongsList.length) return;
  currentSongIndex = index;
  let song = loadedSongsList[index];
  
  let masterAudio = document.getElementById("masterAudio");
  let srcUrl = song.audio || song.video || "";
  
  masterAudio.src = srcUrl;
  masterAudio.play();
  isPlaying = true;
  
  // Update Player UI
  document.getElementById("playerCover").src = song.cover;
  document.getElementById("playerTitle").innerText = song.title;
  document.getElementById("playerArtist").innerText = song.artist;
  
  // Update Play Button Icon
  document.getElementById("playerPlayBtn").innerText = "⏸️";
  
  // Show bottom player
  document.getElementById("spotifyPlayer").style.display = "flex";

  // Check if this song is liked
  let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
  let likeBtn = document.querySelector(".player-like-btn");
  if (likedSongs.includes(song.id.toString())) {
    likeBtn.classList.add("liked");
  } else {
    likeBtn.classList.remove("liked");
  }
}

function togglePlayPause() {
  let masterAudio = document.getElementById("masterAudio");
  if (!masterAudio.src) return;
  
  if (isPlaying) {
    masterAudio.pause();
    isPlaying = false;
    document.getElementById("playerPlayBtn").innerText = "▶️";
  } else {
    masterAudio.play();
    isPlaying = true;
    document.getElementById("playerPlayBtn").innerText = "⏸️";
  }
}

function prevSong() {
  if (loadedSongsList.length === 0) return;
  let index = currentSongIndex - 1;
  if (index < 0) index = loadedSongsList.length - 1;
  playSongByIndex(index);
}

function nextSong() {
  if (loadedSongsList.length === 0) return;
  let index = currentSongIndex + 1;
  if (index >= loadedSongsList.length) index = 0;
  playSongByIndex(index);
}

function updatePlayerProgress() {
  let masterAudio = document.getElementById("masterAudio");
  let progressBar = document.getElementById("progressBar");
  let currentTimeSpan = document.getElementById("playerCurrentTime");
  let durationSpan = document.getElementById("playerDuration");
  
  if (!masterAudio.duration) return;
  
  let percent = (masterAudio.currentTime / masterAudio.duration) * 100;
  progressBar.style.width = percent + "%";
  
  currentTimeSpan.innerText = formatTime(masterAudio.currentTime);
  durationSpan.innerText = formatTime(masterAudio.duration);
}

function seekAudio(event) {
  let masterAudio = document.getElementById("masterAudio");
  let barContainer = document.getElementById("progressBarContainer");
  if (!masterAudio.duration) return;
  
  let rect = barContainer.getBoundingClientRect();
  let clickX = event.clientX - rect.left;
  let width = rect.width;
  let percent = clickX / width;
  
  masterAudio.currentTime = percent * masterAudio.duration;
}

function changeVolume(value) {
  let masterAudio = document.getElementById("masterAudio");
  masterAudio.volume = value / 100;
}

function handleSongEnded() {
  nextSong();
}

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  let mins = Math.floor(seconds / 60);
  let secs = Math.floor(seconds % 60);
  if (secs < 10) secs = "0" + secs;
  return mins + ":" + secs;
}

function togglePlayerLike() {
  if (currentSongIndex === -1) return;
  let song = loadedSongsList[currentSongIndex];
  let idStr = song.id.toString();
  
  let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
  let likeBtn = document.querySelector(".player-like-btn");
  
  if (likedSongs.includes(idStr)) {
    likedSongs = likedSongs.filter(id => id !== idStr);
    likeBtn.classList.remove("liked");
  } else {
    likedSongs.push(idStr);
    likeBtn.classList.add("liked");
  }
  
  localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
}

// ==========================
// INSTAGRAM-STYLE PROFILE FEATURES
// ==========================

function triggerAvatarUpload() {
  document.getElementById("avatarFileInput").click();
}

function handleAvatarChange(input) {
  let file = input.files[0];
  if (!file) return;

  let reader = new FileReader();
  reader.onload = function(e) {
    let dataUrl = e.target.result;
    document.getElementById("profileAvatar").src = dataUrl;
    
    let user = localStorage.getItem("loggedInUser") || "Sriram";
    localStorage.setItem("profile_avatar_" + user, dataUrl);
  };
  reader.readAsDataURL(file);
}

// Edit Bio Modal handlers
function openEditBioModal() {
  let user = localStorage.getItem("loggedInUser") || "Sriram";
  
  let currentFullName = document.getElementById("profileFullName").innerText;
  let currentBioText = document.getElementById("profileBio").innerHTML.replace(/<br\s*\/?>/gi, "\n");
  
  document.getElementById("editFullName").value = currentFullName;
  document.getElementById("editBioText").value = currentBioText;
  
  document.getElementById("editProfileModal").style.display = "flex";
}

function closeEditBioModal() {
  document.getElementById("editProfileModal").style.display = "none";
}

function saveProfileChanges() {
  let user = localStorage.getItem("loggedInUser") || "Sriram";
  
  let newName = document.getElementById("editFullName").value.trim() || user;
  let newBio = document.getElementById("editBioText").value.trim();
  
  localStorage.setItem("profile_fullname_" + user, newName);
  localStorage.setItem("profile_bio_" + user, newBio);
  
  document.getElementById("profileFullName").innerText = newName;
  document.getElementById("profileBio").innerHTML = newBio.replace(/\n/g, "<br>");
  
  closeEditBioModal();
}

// Profile tabs switcher
function switchProfileTab(tabName, element) {
  let tabs = document.querySelectorAll(".profile-tab");
  tabs.forEach(t => t.classList.remove("active"));
  element.classList.add("active");
  
  // Show grid posts
  loadProfileGrid();
}

// Dynamic load of the 3-column post grid
async function loadProfileGrid() {
  let gridContainer = document.getElementById("profileGrid");
  if (!gridContainer) return;
  gridContainer.innerHTML = "";

  let user = localStorage.getItem("loggedInUser") || "Sriram";

  // Gather user uploaded reels
  let reels = JSON.parse(localStorage.getItem("userReels")) || [];
  
  // Set stats post count
  let postCountEl = document.getElementById("postCount");
  if (postCountEl) {
    postCountEl.innerText = reels.length;
  }

  if (reels.length === 0) {
    gridContainer.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: #64748b; padding: 60px 20px;">
        <div style="font-size: 40px; margin-bottom: 12px;">📷</div>
        <div style="font-size: 18px; font-weight: bold; color: white; margin-bottom: 6px;">No Posts Yet</div>
        <p style="font-size: 13px;">When you upload reels, they will appear here in your feed.</p>
      </div>
    `;
    return;
  }

  for (let r of reels) {
    let videoURL = "https://www.w3schools.com/html/mov_bbb.mp4"; // Fallback placeholder
    try {
      let blob = await getVideoBlobFromDB(r.id);
      if (blob) {
        videoURL = URL.createObjectURL(blob);
      }
    } catch (e) {
      console.error("Failed to load video from DB for profile grid:", r.id, e);
    }

    let gridItem = document.createElement("div");
    gridItem.classList.add("profile-grid-item");
    gridItem.setAttribute("onclick", `viewProfileReel('${r.id}')`);

    gridItem.innerHTML = `
      <video src="${videoURL}" preload="metadata" muted playsinline></video>
      <div class="profile-grid-overlay">
        <div class="overlay-stat">❤️ ${r.likes || 0}</div>
        <div class="overlay-stat">💬 ${(r.comments && r.comments.length) || 0}</div>
      </div>
    `;
    
    gridContainer.appendChild(gridItem);
  }
}

// Click post to open and scroll directly to that Reel!
function viewProfileReel(reelId) {
  // 1. Navigate to the Reels page
  showPage('reels');

  // 3. Scroll to the specific Reel and play
  setTimeout(() => {
    let likeBtn = document.getElementById(`likeBtn-${reelId}`);
    if (likeBtn) {
      let reelBox = likeBtn.closest(".reel-box");
      if (reelBox) {
        reelBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
        let video = reelBox.querySelector("video");
        if (video) {
          video.play();
        }
      }
    }
  }, 200);
}