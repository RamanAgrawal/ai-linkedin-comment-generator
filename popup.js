// LinkedComment AI Popup Script

document.addEventListener("DOMContentLoaded", function () {
  const elements = {
    enabled: document.getElementById("enabled"),
    autoGenerate: document.getElementById("autoGenerate"),
    includeHindi: document.getElementById("includeHindi"),
    autoLike: document.getElementById("autoLike"),
    apiKey: document.getElementById("apiKey"),
    toggleApiKey: document.getElementById("toggleApiKey"),
    saveButton: document.getElementById("saveSettings"),
    statusMessage: document.getElementById("statusMessage"),
    toneOptions: document.querySelectorAll(".tone-option"),
  };

  let currentSettings = {};
  let selectedTone = "professional";

  // Load current settings
  loadSettings();

  // Event listeners
  elements.toggleApiKey.addEventListener("click", toggleApiKeyVisibility);
  elements.saveButton.addEventListener("click", saveSettings);

  // Tone selection
  elements.toneOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectTone(this.dataset.tone);
    });
  });

  // Real-time API key validation
  elements.apiKey.addEventListener("input", validateApiKey);

  function loadSettings() {
    chrome.storage.sync.get(
      ["enabled", "tone", "autoGenerate", "includeHindi", "autoLike", "apiKey"],
      function (result) {
        currentSettings = result;

        // Set form values
        elements.enabled.checked = result.enabled !== false; // Default to true
        elements.autoGenerate.checked = result.autoGenerate !== false; // Default to true
        elements.includeHindi.checked = result.includeHindi !== false; // Default to true
        elements.autoLike.checked = result.autoLike !== false; // Default to true
        elements.apiKey.value = result.apiKey || "";

        // Set selected tone
        selectedTone = result.tone || "professional";
        selectTone(selectedTone);

        console.log("Settings loaded:", result);
      }
    );
  }

  function selectTone(tone) {
    selectedTone = tone;

    // Update UI
    elements.toneOptions.forEach((option) => {
      option.classList.remove("active");
      if (option.dataset.tone === tone) {
        option.classList.add("active");
      }
    });
  }

  function toggleApiKeyVisibility() {
    const isPassword = elements.apiKey.type === "password";
    elements.apiKey.type = isPassword ? "text" : "password";
    elements.toggleApiKey.textContent = isPassword ? "🙈" : "👁️";
  }

  function validateApiKey() {
    const apiKey = elements.apiKey.value.trim();
    const isValid = !apiKey || apiKey.startsWith("sk-");

    elements.apiKey.style.borderColor = isValid ? "#e1e5e9" : "#dc3545";

    if (!isValid && apiKey) {
      showStatus('Invalid API key format. Should start with "sk-"', "error");
    } else {
      hideStatus();
    }

    return isValid;
  }

  function saveSettings() {
    if (!validateApiKey()) {
      return;
    }

    elements.saveButton.disabled = true;
    elements.saveButton.textContent = "Saving...";

    const newSettings = {
      enabled: elements.enabled.checked,
      tone: selectedTone,
      autoGenerate: elements.autoGenerate.checked,
      includeHindi: elements.includeHindi.checked,
      autoLike: elements.autoLike.checked,
      apiKey: elements.apiKey.value.trim(),
    };

    chrome.storage.sync.set(newSettings, function () {
      if (chrome.runtime.lastError) {
        showStatus(
          "Error saving settings: " + chrome.runtime.lastError.message,
          "error"
        );
      } else {
        showStatus("Settings saved successfully!", "success");
        currentSettings = newSettings;

        // Notify content script about changes
        notifyContentScript(newSettings);
      }

      elements.saveButton.disabled = false;
      elements.saveButton.textContent = "Save Settings";
    });
  }

  function notifyContentScript(settings) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0] && tabs[0].url.includes("linkedin.com")) {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            action: "settingsUpdated",
            settings: settings,
          },
          function (response) {
            // Handle response if needed
            if (chrome.runtime.lastError) {
              console.log(
                "Content script not responding (tab may need refresh)"
              );
            }
          }
        );
      }
    });
  }

  function showStatus(message, type) {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message status-${type}`;
    elements.statusMessage.style.display = "block";

    // Auto-hide success messages
    if (type === "success") {
      setTimeout(hideStatus, 3000);
    }
  }

  function hideStatus() {
    elements.statusMessage.style.display = "none";
  }

  // Check if extension is active on current tab
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (tabs[0]) {
      const isLinkedIn = tabs[0].url.includes("linkedin.com");

      if (!isLinkedIn) {
        showStatus("Navigate to LinkedIn to use this extension", "error");
        elements.saveButton.textContent = "Go to LinkedIn";
        elements.saveButton.onclick = function () {
          chrome.tabs.create({ url: "https://www.linkedin.com/feed/" });
          window.close();
        };
      }
    }
  });

  // Add keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case "s":
          e.preventDefault();
          saveSettings();
          break;
        case "Enter":
          e.preventDefault();
          saveSettings();
          break;
      }
    }
  });
});
