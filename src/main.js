import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/chat";

const chatBox = document.getElementById("chat-box");
const chatForm = document.getElementById("chat-form");
const userInput = document.getElementById("user-input");
const clearBtn = document.getElementById("clear-btn");
const dilemmaChips = document.querySelectorAll(".dilemma-chip");
const starterPrompts = document.getElementById("starter-prompts");

function appendMessage(sender, text, citation = null, purushartha = null) {
  const wrapper = document.createElement("div");
  const isUser = sender === "user";

  wrapper.className = `w-full flex ${isUser ? "justify-end" : "justify-start"}`;

  if (isUser) {
    wrapper.innerHTML = `
      <div class="max-w-[85%] bg-gold-500/20 border border-gold-500/40 text-gold-300 px-5 py-3 rounded-2xl rounded-tr-sm text-sm font-medium shadow-md">
        ${text}
      </div>
    `;
  } else {
    let metaTags = "";
    if (citation || purushartha) {
      metaTags = `
        <div class="flex flex-wrap gap-2 pt-2 mt-3 border-t border-surfaceBorder text-xs">
          ${citation ? `<span class="bg-gold-500/10 text-gold-400 px-2.5 py-1 rounded-md border border-gold-500/30 font-semibold uppercase tracking-wider">📖 ${citation}</span>` : ""}
          ${purushartha ? `<span class="bg-emerald-950/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-800/40 font-semibold uppercase tracking-wider">✨ ${purushartha}</span>` : ""}
        </div>
      `;
    }

    wrapper.innerHTML = `
      <div class="max-w-[90%] bg-surface border border-surfaceBorder text-parchment p-5 rounded-2xl rounded-tl-sm text-sm leading-relaxed shadow-xl space-y-2">
        <div class="flex items-center gap-2 text-gold-400 font-serif font-bold text-xs uppercase tracking-widest">
          <span>🛞</span> Sārathi Guidance
        </div>
        <p class="text-parchment/95">${text}</p>
        ${metaTags}
      </div>
    `;
  }

  chatBox.appendChild(wrapper);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleQuery(queryText) {
  if (!queryText.trim()) return;

  if (starterPrompts) {
    starterPrompts.style.display = "none";
  }

  appendMessage("user", queryText);

  const loader = document.createElement("div");
  loader.id = "loading-indicator";
  loader.className = "w-full flex justify-start";
  loader.innerHTML = `
    <div class="bg-surface border border-surfaceBorder text-dimParchment px-5 py-3.5 rounded-2xl rounded-tl-sm text-xs italic flex items-center gap-2">
      <svg class="animate-spin h-4 w-4 text-gold-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Searching the Mahābhārata scriptures...
    </div>
  `;
  chatBox.appendChild(loader);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await axios.post(API_URL, { message: queryText });
    document.getElementById("loading-indicator")?.remove();

    const data = response.data;
    appendMessage(
      "bot",
      data.response || data.text,
      data.citation,
      data.purushartha,
    );
  } catch (error) {
    document.getElementById("loading-indicator")?.remove();
    appendMessage(
      "bot",
      "Unable to connect to the Sarathi backend server. Please verify FastAPI is running on http://127.0.0.1:8000.",
    );
  }
}

chatForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = userInput.value;
  userInput.value = "";
  handleQuery(text);
});

dilemmaChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const chipText =
      chip.querySelector("span:last-child")?.innerText || chip.innerText;
    handleQuery(chipText);
  });
});

clearBtn?.addEventListener("click", () => {
  chatBox.innerHTML = `
    <div id="welcome-card" class="w-full bg-surface border border-surfaceBorder rounded-2xl p-6 sm:px-8 sm:py-7 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
      <div class="flex items-center justify-center gap-3 mb-4">
        <span class="h-px w-10 bg-gradient-to-r from-transparent to-gold-500/60"></span>
        <h2 class="text-xs font-semibold tracking-[0.2em] text-gold-400 uppercase">
          Bhagavad Gītā 2.47
        </h2>
        <span class="h-px w-10 bg-gradient-to-l from-transparent to-gold-500/60"></span>
      </div>
      <blockquote class="text-lg sm:text-xl font-medium tracking-wide text-[#f5ebd8] italic font-serif mb-3">
        “कर्मण्येवाधिकारस्ते मा फलेषु कदाचन...”
      </blockquote>
      <p class="text-xs sm:text-sm text-dimParchment font-normal leading-relaxed max-w-lg mx-auto">
        You have a right only to work, never to its fruits. Let not the fruit of action be your motive.
      </p>
    </div>
  `;
  if (starterPrompts) {
    starterPrompts.style.display = "flex";
  }
});
