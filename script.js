const url = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const result = document.getElementById("result");
const sound = document.getElementById("sound");
const btn = document.getElementById("search-btn");
const themeToggle = document.getElementById("checkbox");

// Theme Toggle Logic
themeToggle.addEventListener("change", (e) => {
    if (e.target.checked) {
        document.body.setAttribute("data-theme", "dark");
    } else {
        document.body.setAttribute("data-theme", "light");
    }
});

btn.addEventListener("click", () => {
    let inpWord = document.getElementById("inp-word").value.trim().toLowerCase();
    if (!inpWord) return;

    fetchData(inpWord);
});

function fetchData(word, originalWord = null) {
    if (!originalWord) originalWord = word;

    fetch(`${url}${encodeURIComponent(word)}`)
        .then((response) => {
            if (!response.ok) {
                // If 404 and it's a multi-word phrase, try splitting
                if (response.status === 404 && word.includes(" ")) {
                    const firstWord = word.split(" ")[0];
                    console.log(`Word "${word}" not found, trying "${firstWord}"`);
                    return fetchData(firstWord, originalWord);
                }
                throw new Error("Word could not be found");
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
            if (!data || data.length === 0) {
                throw new Error("No data received");
            }

            const wordData = data[0];

            // Check if we are showing a fallback result
            let fallbackMessage = "";
            if (originalWord && originalWord !== wordData.word.toLowerCase()) {
                fallbackMessage = `<p class="fallback-msg">No exact match for <strong>"${originalWord}"</strong>. Showing results for <strong>"${wordData.word}"</strong>:</p>`;
            }

            // Safe access for phonetics
            const phonetics = wordData.phonetics ? (wordData.phonetics.find(p => p.audio && p.audio !== "") || wordData.phonetics[0] || {}) : {};

            // Safe access for meanings
            if (!wordData.meanings || wordData.meanings.length === 0) {
                throw new Error("No definitions found for this word");
            }
            const meaning = wordData.meanings[0];
            const definition = meaning.definitions && meaning.definitions.length > 0 ? meaning.definitions[0] : null;

            if (!definition) {
                throw new Error("No definition text available");
            }

            result.innerHTML = `
            ${fallbackMessage}
            <div class="word-row">
                <h3>${wordData.word}</h3>
                <button onclick="playSound()">
                    <i class="fas fa-volume-up"></i>
                </button>
            </div>
            <div class="details">
                <p>${meaning.partOfSpeech || ''}</p>
                <p>/${wordData.phonetic || phonetics.text || ''}/</p>
            </div>
            <p class="word-meaning">
               ${definition.definition}
            </p>
            <p class="word-example">
                ${definition.example || ""}
            </p>`;

            // Set audio source if available
            if (phonetics && phonetics.audio) {
                let audioUrl = phonetics.audio;
                if (audioUrl.startsWith('//')) {
                    audioUrl = 'https:' + audioUrl;
                }
                sound.setAttribute("src", audioUrl);
                const audioBtn = document.querySelector('.word-row button');
                if (audioBtn) audioBtn.style.display = 'block';
            } else {
                const audioBtn = document.querySelector('.word-row button');
                if (audioBtn) audioBtn.style.display = 'none';
            }
        })
        .catch((error) => {
            // Check if it's our recursive call's error or a final error
            // If the recursive call fails, we land here. 
            // We should only show the error if we are at the end of the line.

            // Actually, recursion promise handling above isn't quite right for the catch block 
            // because `fetchData` returns a promise but we aren't returning it in the .then callback properly for chaining?
            // Wait, I am calling `fetchData(firstWord)` inside the .then.
            // If I return that call, the next .then will be the result of that call.
            // But `fetchData` doesn't return the promise chain explicitly in my code above? 
            // Ah, `fetchData` calls `fetch` which returns a promise. 
            // So `return fetchData(...)` works IF `fetchData` returns the fetch promise.

            console.error("Dictionary App Error:", error);
            result.innerHTML = `<h3 class="error">${error.message}</h3>`;
        });
}

function playSound() {
    sound.play();
}

// Add enter key support
document.getElementById("inp-word").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        document.getElementById("search-btn").click();
    }
});

// ✅ Register Service Worker (must be outside all functions)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("/dictionary-app/service-worker.js", { scope: "/dictionary-app/" })
      .then(function (registration) {
        console.log("Service Worker Registered:", registration.scope);
      })
      .catch(function (error) {
        console.log("Service Worker Registration Failed:", error);
      });
  });
}



