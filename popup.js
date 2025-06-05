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
    // Button customization elements
    buttonText: document.getElementById("buttonText"),
    iconOptions: document.querySelectorAll(".icon-option"),
    colorOptions: document.querySelectorAll(".color-option"),
    sizeOptions: document.querySelectorAll(".size-option"),
    previewButton: document.getElementById("previewButton"),
    previewIcon: document.getElementById("previewIcon"),
    previewText: document.getElementById("previewText"),
    // Tab elements
    tabButtons: document.querySelectorAll(".tab-button"),
    tabContents: document.querySelectorAll(".tab-content"),
  };

  let currentSettings = {};
  let selectedTone = "professional";

  // Button customization defaults
  let buttonCustomization = {
    icon: "🤖",
    text: "",
    color: "blue",
    size: "medium",
  };

  // Color theme configurations
  const colorThemes = {
    blue: {
      primary: "#0077b5",
      hover: "#005885",
      light: "#e6f3ff",
    },
    green: {
      primary: "#16a085",
      hover: "#138d75",
      light: "#e8f8f5",
    },
    purple: {
      primary: "#8e44ad",
      hover: "#7d3c98",
      light: "#f4ecf7",
    },
    orange: {
      primary: "#e67e22",
      hover: "#d35400",
      light: "#fef9e7",
    },
    red: {
      primary: "#e74c3c",
      hover: "#c0392b",
      light: "#fadbd8",
    },
    teal: {
      primary: "#1abc9c",
      hover: "#16a085",
      light: "#d5f4e6",
    },
  };

  // Load current settings
  loadSettings();

  // Event listeners
  elements.toggleApiKey.addEventListener("click", toggleApiKeyVisibility);
  elements.saveButton.addEventListener("click", saveSettings);

  // Tab switching
  elements.tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      switchTab(this.dataset.tab);
    });
  });

  // Tone selection
  elements.toneOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectTone(this.dataset.tone);
    });
  });

  // Button customization event listeners
  elements.buttonText.addEventListener("input", function () {
    buttonCustomization.text = this.value.trim();
    updatePreview();
  });

  elements.iconOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectIcon(this.dataset.icon);
    });
  });

  elements.colorOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectColor(this.dataset.color);
    });
  });

  elements.sizeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      selectSize(this.dataset.size);
    });
  });

  // Real-time API key validation
  elements.apiKey.addEventListener("input", validateApiKey);

  // Tab switching function
  function switchTab(targetTab) {
    // Update tab buttons
    elements.tabButtons.forEach((button) => {
      button.classList.remove("active");
      if (button.dataset.tab === targetTab) {
        button.classList.add("active");
      }
    });

    // Update tab contents
    elements.tabContents.forEach((content) => {
      content.classList.remove("active");
      if (content.id === targetTab) {
        content.classList.add("active");
      }
    });
  }

  function loadSettings() {
    chrome.storage.sync.get(
      [
        "enabled",
        "tone",
        "autoGenerate",
        "includeHindi",
        "autoLike",
        "apiKey",
        "buttonIcon",
        "buttonText",
        "buttonColor",
        "buttonSize",
      ],
      function (result) {
        currentSettings = result;

        // Set form values
        elements.enabled.checked = result.enabled !== false;
        elements.autoGenerate.checked = result.autoGenerate !== false;
        elements.includeHindi.checked = result.includeHindi !== false;
        elements.autoLike.checked = result.autoLike !== false;
        elements.apiKey.value = result.apiKey || "";

        // Set button customization - allow empty text
        buttonCustomization = {
          icon: result.buttonIcon || "🤖",
          text: result.buttonText || "",
          color: result.buttonColor || "blue",
          size: result.buttonSize || "medium",
        };

        elements.buttonText.value = buttonCustomization.text;

        // Set selected tone
        selectedTone = result.tone || "professional";
        selectTone(selectedTone);

        // Set button customization UI
        selectIcon(buttonCustomization.icon);
        selectColor(buttonCustomization.color);
        selectSize(buttonCustomization.size);

        updatePreview();

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

  function selectIcon(icon) {
    buttonCustomization.icon = icon;

    // Update UI
    elements.iconOptions.forEach((option) => {
      option.classList.remove("active");
      if (option.dataset.icon === icon) {
        option.classList.add("active");
      }
    });

    updatePreview();
  }

  function selectColor(color) {
    buttonCustomization.color = color;

    // Update UI
    elements.colorOptions.forEach((option) => {
      option.classList.remove("active");
      if (option.dataset.color === color) {
        option.classList.add("active");
      }
    });

    updatePreview();
  }

  function selectSize(size) {
    buttonCustomization.size = size;

    // Update UI
    elements.sizeOptions.forEach((option) => {
      option.classList.remove("active");
      if (option.dataset.size === size) {
        option.classList.add("active");
      }
    });

    updatePreview();
  }

  function updatePreview() {
    const theme = colorThemes[buttonCustomization.color];

    // Update preview content
    elements.previewIcon.textContent = buttonCustomization.icon;
    elements.previewText.textContent = buttonCustomization.text || "";

    // Hide text span if empty
    if (!buttonCustomization.text) {
      elements.previewText.style.display = "none";
    } else {
      elements.previewText.style.display = "inline";
    }

    // Update preview styling
    elements.previewButton.style.background = theme.light;
    elements.previewButton.style.borderColor = theme.primary;
    elements.previewButton.style.color = theme.primary;

    // Update size
    const sizeStyles = {
      small: { fontSize: "11px", padding: "6px 10px" },
      medium: { fontSize: "13px", padding: "8px 12px" },
      large: { fontSize: "15px", padding: "10px 16px" },
    };

    const size = sizeStyles[buttonCustomization.size];
    elements.previewButton.style.fontSize = size.fontSize;

    // Adjust padding for icon-only buttons
    if (!buttonCustomization.text) {
      const iconOnlyPadding = {
        small: "6px",
        medium: "8px",
        large: "10px",
      };
      elements.previewButton.style.padding =
        iconOnlyPadding[buttonCustomization.size];
    } else {
      elements.previewButton.style.padding = size.padding;
    }

    // Add hover effect simulation
    elements.previewButton.onmouseenter = function () {
      this.style.background = theme.primary;
      this.style.color = "white";
    };

    elements.previewButton.onmouseleave = function () {
      this.style.background = theme.light;
      this.style.color = theme.primary;
    };
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
      buttonIcon: buttonCustomization.icon,
      buttonText: buttonCustomization.text,
      buttonColor: buttonCustomization.color,
      buttonSize: buttonCustomization.size,
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

    // Tab navigation with number keys
    if (e.key >= "1" && e.key <= "3") {
      e.preventDefault();
      const tabIndex = parseInt(e.key) - 1;
      const tabs = ["general", "customization", "advanced"];
      if (tabs[tabIndex]) {
        switchTab(tabs[tabIndex]);
      }
    }

    // Arrow key navigation for tabs
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      const activeTab = document.querySelector(".tab-button.active");
      if (activeTab) {
        const tabs = Array.from(elements.tabButtons);
        const currentIndex = tabs.indexOf(activeTab);
        let newIndex;

        if (e.key === "ArrowLeft") {
          newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        } else {
          newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }

        e.preventDefault();
        switchTab(tabs[newIndex].dataset.tab);
      }
    }
  });
});
