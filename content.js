// LinkedComment AI Content Script
class LinkedCommentAI {
  constructor() {
    this.processedPosts = new Set();
    this.aiButtons = new Map();
    this.isInitialized = false;
    this.observer = null;
    this.settings = {
      enabled: true,
      tone: "professional",
      autoGenerate: true,
      includeHindi: true,
      apiKey: "",
    };

    // Load settings first, then initialize
    this.loadSettings().then(() => {
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.init());
      } else {
        this.init();
      }
    });

    // Listen for messages from popup/background
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sendResponse);
      return true; // Will respond asynchronously
    });
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        "enabled",
        "tone",
        "autoGenerate",
        "includeHindi",
        "apiKey",
      ]);
      this.settings = {
        enabled: result.enabled !== false,
        tone: result.tone || "professional",
        autoGenerate: result.autoGenerate !== false,
        includeHindi: result.includeHindi !== false,
        apiKey: result.apiKey || "",
      };
      console.log("LinkedComment AI: Settings loaded", this.settings);
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  handleMessage(message, sendResponse) {
    switch (message.action) {
      case "settingsUpdated":
        this.settings = { ...this.settings, ...message.settings };
        if (!this.settings.enabled) {
          this.removeAllAIButtons();
        } else {
          this.scanForPosts();
        }
        sendResponse({ success: true });
        break;

      case "toggleExtension":
        this.settings.enabled = message.enabled;
        if (!this.settings.enabled) {
          this.removeAllAIButtons();
        }
        sendResponse({ success: true });
        break;

      default:
        sendResponse({ error: "Unknown action" });
    }
  }

  removeAllAIButtons() {
    this.aiButtons.forEach((button) => button.remove());
    this.aiButtons.clear();
  }

  init() {
    if (this.isInitialized || !this.settings.enabled) return;

    console.log("LinkedComment AI: Initializing...");
    this.isInitialized = true;

    // Initial scan for existing posts
    this.scanForPosts();

    // Set up observer for new posts
    this.setupPostObserver();

    // Listen for scroll events (throttled)
    this.setupScrollListener();
  }

  scanForPosts() {
    if (!this.settings.enabled) return;

    // LinkedIn post selectors (these may need updates as LinkedIn changes their DOM)
    const postSelectors = [
      '[data-urn*="urn:li:activity"]',
      ".feed-shared-update-v2",
      '[data-id*="urn:li:activity"]',
      ".occludable-update",
    ];

    const posts = document.querySelectorAll(postSelectors.join(", "));

    posts.forEach((post) => this.processPost(post));
  }

  setupPostObserver() {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      if (!this.settings.enabled) return;

      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a post or contains posts
            const posts =
              node.matches && node.matches('[data-urn*="urn:li:activity"]')
                ? [node]
                : node.querySelectorAll
                ? node.querySelectorAll(
                    '[data-urn*="urn:li:activity"], [data-id*="urn:li:activity"], .feed-shared-update-v2'
                  )
                : [];

            posts.forEach((post) => this.processPost(post));
          }
        });
      });
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  setupScrollListener() {
    let scrollTimeout;
    window.addEventListener("scroll", () => {
      if (!this.settings.enabled) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.scanForPosts();
      }, 100);
    });
  }

  processPost(postElement) {
    if (
      !postElement ||
      this.processedPosts.has(postElement) ||
      !this.settings.enabled
    )
      return;

    // Skip if this is a sponsored post or job posting
    if (
      window.PostProcessor &&
      window.PostProcessor.shouldSkipPost(postElement)
    ) {
      return;
    }

    this.processedPosts.add(postElement);

    // Extract post content
    const postData = this.extractPostContent(postElement);
    if (!postData) return;

    // Add AI button to the post
    this.addAIButton(postElement, postData);
  }

  extractPostContent(postElement) {
    try {
      // Find post text content
      const textSelectors = [
        ".feed-shared-text",
        ".feed-shared-update-v2__description",
        '[data-test-id="main-feed-activity-card"] .break-words',
        '.feed-shared-text .break-words span[dir="ltr"]',
        '.update-components-text span[dir="ltr"]',
      ];

      let postText = "";
      for (const selector of textSelectors) {
        const textElement = postElement.querySelector(selector);
        if (textElement) {
          postText = textElement.innerText || textElement.textContent || "";
          break;
        }
      }

      // Find author information
      const authorSelectors = [
        ".feed-shared-actor__name",
        ".update-components-actor__name",
        '[data-test-id="main-feed-activity-card"] .update-components-actor__name',
        ".update-components-actor__title",
      ];

      let authorName = "";
      for (const selector of authorSelectors) {
        const authorElement = postElement.querySelector(selector);
        if (authorElement) {
          authorName =
            authorElement.innerText || authorElement.textContent || "";
          break;
        }
      }

      if (!postText.trim()) return null;

      // Clean up text if PostProcessor is available
      if (window.PostProcessor) {
        postText = window.PostProcessor.sanitizePostText(postText);
      }

      return {
        text: postText.trim(),
        author: authorName.trim(),
        element: postElement,
      };
    } catch (error) {
      console.error("Error extracting post content:", error);
      return null;
    }
  }

  addAIButton(postElement, postData) {
    // Find the actions container (where Like, Comment, Repost, Send buttons are)
    const actionsSelectors = [
      ".feed-shared-social-actions",
      ".social-actions-buttons",
      '[data-test-id="social-actions"]',
      ".feed-shared-social-action-bar",
      ".feed-shared-footer__social-actions",
    ];

    let actionsContainer = null;
    for (const selector of actionsSelectors) {
      actionsContainer = postElement.querySelector(selector);
      if (actionsContainer) break;
    }

    if (!actionsContainer) {
      console.warn("Could not find actions container for post");
      return;
    }

    // Check if AI button already exists
    if (actionsContainer.querySelector(".linkedcomment-ai-button")) {
      return;
    }

    // Create AI button
    const aiButton = this.createAIButton(postElement, postData);

    // Better insertion logic - find the actual button container
    const actionButtons = actionsContainer.querySelectorAll(
      'button, [role="button"]'
    );
    const lastButton = actionButtons[actionButtons.length - 1];

    if (lastButton && lastButton.parentElement) {
      // Insert after the last button's container
      const lastButtonContainer =
        lastButton.closest(".feed-shared-footer__social-action") ||
        lastButton.closest('[data-test-id*="social-action"]') ||
        lastButton.parentElement;

      if (lastButtonContainer.parentElement) {
        lastButtonContainer.parentElement.insertBefore(
          aiButton,
          lastButtonContainer.nextSibling
        );
      } else {
        actionsContainer.appendChild(aiButton);
      }
    } else {
      // Fallback: append to the actions container
      actionsContainer.appendChild(aiButton);
    }

    // Store reference
    this.aiButtons.set(postElement, aiButton);
  }

  createAIButton(postElement, postData) {
    const button = document.createElement("div");
    button.className =
      "linkedcomment-ai-button feed-shared-footer__social-action";

    button.innerHTML = `
      <button class="linkedcomment-ai-btn" type="button" aria-label="Generate AI comment">
        <div class="linkedcomment-ai-content">
          <div class="linkedcomment-ai-icon">🤖</div>
          <span class="linkedcomment-ai-text">AI Comment</span>
        </div>
        <div class="linkedcomment-ai-loading" style="display: none;">
          <div class="linkedcomment-ai-spinner"></div>
          <span>Generating...</span>
        </div>
      </button>
    `;

    // Add click handler
    const btnElement = button.querySelector(".linkedcomment-ai-btn");
    btnElement.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.handleAIButtonClick(button, postElement, postData);
    });

    return button;
  }

  async handleAIButtonClick(buttonContainer, postElement, postData) {
    const button = buttonContainer.querySelector(".linkedcomment-ai-btn");

    // Disable button during generation
    button.disabled = true;
    button.style.opacity = "0.6";

    try {
      // Show popup with generating state
      const popup = this.createCommentPopup(postElement, postData);
      document.body.appendChild(popup);

      // The initial comment generation is now handled in setupPopupEventListeners
    } catch (error) {
      console.error("Error generating comment:", error);
      // Show error popup
      this.showErrorPopup(error.message);
    } finally {
      // Re-enable button
      button.disabled = false;
      button.style.opacity = "1";
    }
  }

  createCommentPopup(postElement, postData) {
    const popup = document.createElement("div");
    popup.className = "linkedcomment-ai-popup-overlay";

    popup.innerHTML = `
      <div class="linkedcomment-ai-popup">
        <div class="linkedcomment-ai-popup-header">
          <h3>💡 AI Comment Generator</h3>
          <button class="linkedcomment-ai-popup-close">&times;</button>
        </div>
        
        <div class="linkedcomment-ai-popup-content">
          <div class="linkedcomment-ai-popup-post-preview">
            <strong>Post by:</strong> ${postData.author || "Unknown"}<br>
            <div class="linkedcomment-ai-popup-post-text">"${this.truncateText(
              postData.text,
              100
            )}"</div>
          </div>

          <div class="linkedcomment-ai-popup-tone-selection">
            <label class="linkedcomment-ai-popup-tone-label">Tone:</label>
            <div class="linkedcomment-ai-popup-tone-options">
              <button class="linkedcomment-ai-popup-tone-btn active" data-tone="professional">
                👔 Professional
              </button>
              <button class="linkedcomment-ai-popup-tone-btn" data-tone="friendly">
                😊 Friendly
              </button>
              <button class="linkedcomment-ai-popup-tone-btn" data-tone="funny">
                😄 Witty
              </button>
            </div>
          </div>

          <div class="linkedcomment-ai-popup-hindi-toggle">
            <label class="linkedcomment-ai-popup-hindi-label">
              <input type="checkbox" class="linkedcomment-ai-popup-hindi-checkbox" ${
                this.settings.includeHindi ? "checked" : ""
              }>
              <span class="linkedcomment-ai-popup-hindi-text">🇮🇳 Include Hindi/Hinglish</span>
            </label>
          </div>
          
          <div class="linkedcomment-ai-popup-result">
            <div class="linkedcomment-ai-popup-loading">
              <div class="linkedcomment-ai-spinner"></div>
              <span>Generating your AI comment...</span>
            </div>
            
            <div class="linkedcomment-ai-popup-comment" style="display: none;">
              <div class="linkedcomment-ai-popup-comment-label">Generated Comment:</div>
              <div class="linkedcomment-ai-popup-comment-text"></div>
            </div>
            
            <div class="linkedcomment-ai-popup-error" style="display: none;">
              <div class="linkedcomment-ai-popup-error-text"></div>
            </div>
          </div>
        </div>
        
        <div class="linkedcomment-ai-popup-actions" style="display: none;">
          <button class="linkedcomment-ai-popup-btn linkedcomment-ai-popup-copy">
            📋 Copy to Clipboard
          </button>
          <button class="linkedcomment-ai-popup-btn linkedcomment-ai-popup-regenerate">
            🔄 Regenerate
          </button>
        </div>
      </div>
    `;

    // Add event listeners
    this.setupPopupEventListeners(popup, postElement, postData);

    return popup;
  }

  setupPopupEventListeners(popup, postElement, postData) {
    let currentTone = "professional";
    let includeHindi = this.settings.includeHindi;

    // Close button
    const closeBtn = popup.querySelector(".linkedcomment-ai-popup-close");
    closeBtn.addEventListener("click", () => {
      popup.remove();
    });

    // Click outside to close
    popup.addEventListener("click", (e) => {
      if (e.target === popup) {
        popup.remove();
      }
    });

    // Hindi toggle
    const hindiCheckbox = popup.querySelector(
      ".linkedcomment-ai-popup-hindi-checkbox"
    );
    hindiCheckbox.addEventListener("change", async () => {
      includeHindi = hindiCheckbox.checked;

      // Auto-regenerate with new setting
      this.resetPopupToLoading(popup);
      await this.generateCommentForPopup(
        popup,
        postData,
        currentTone,
        includeHindi
      );
    });

    // Tone selection buttons
    const toneButtons = popup.querySelectorAll(
      ".linkedcomment-ai-popup-tone-btn"
    );
    toneButtons.forEach((btn) => {
      btn.addEventListener("click", async () => {
        // Update active state
        toneButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        // Update current tone
        currentTone = btn.dataset.tone;

        // Auto-regenerate with new tone
        this.resetPopupToLoading(popup);
        await this.generateCommentForPopup(
          popup,
          postData,
          currentTone,
          includeHindi
        );
      });
    });

    // Copy button
    const copyBtn = popup.querySelector(".linkedcomment-ai-popup-copy");
    copyBtn.addEventListener("click", async () => {
      const commentText = popup.querySelector(
        ".linkedcomment-ai-popup-comment-text"
      ).textContent;
      try {
        await navigator.clipboard.writeText(commentText);
        this.showSuccessMessage("Comment copied to clipboard!");
        copyBtn.textContent = "✅ Copied!";

        // Close the popup after a brief delay to show the success state
        setTimeout(() => {
          popup.remove();
        }, 800);
      } catch (error) {
        this.showErrorMessage("Failed to copy comment.");
      }
    });

    // Regenerate button
    const regenerateBtn = popup.querySelector(
      ".linkedcomment-ai-popup-regenerate"
    );
    regenerateBtn.addEventListener("click", async () => {
      // Reset to loading state
      this.resetPopupToLoading(popup);
      // Generate new comment with current tone and hindi setting
      await this.generateCommentForPopup(
        popup,
        postData,
        currentTone,
        includeHindi
      );
    });

    // Escape key to close
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        popup.remove();
        document.removeEventListener("keydown", handleEscape);
      }
    };
    document.addEventListener("keydown", handleEscape);

    // Generate initial comment
    this.generateCommentForPopup(popup, postData, currentTone, includeHindi);
  }

  async generateCommentForPopup(
    popup,
    postData,
    tone,
    includeHindi = this.settings.includeHindi
  ) {
    const loadingEl = popup.querySelector(".linkedcomment-ai-popup-loading");
    const commentEl = popup.querySelector(".linkedcomment-ai-popup-comment");
    const errorEl = popup.querySelector(".linkedcomment-ai-popup-error");
    const actionsEl = popup.querySelector(".linkedcomment-ai-popup-actions");

    // Show loading state
    loadingEl.style.display = "flex";
    commentEl.style.display = "none";
    errorEl.style.display = "none";
    actionsEl.style.display = "none";

    try {
      // Enhance post data if PostProcessor is available
      const enhancedData = window.PostProcessor
        ? window.PostProcessor.enhancePostContent(postData)
        : postData;

      // Call background script to generate comment
      const response = await chrome.runtime.sendMessage({
        action: "generateComment",
        data: { ...enhancedData, tone, includeHindi },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Show generated comment
      popup.querySelector(".linkedcomment-ai-popup-comment-text").textContent =
        response.comment;
      loadingEl.style.display = "none";
      commentEl.style.display = "block";
      actionsEl.style.display = "flex";
    } catch (error) {
      console.error("Error generating comment:", error);

      // Show error state
      popup.querySelector(".linkedcomment-ai-popup-error-text").textContent =
        error.message || "Failed to generate comment. Please try again.";
      loadingEl.style.display = "none";
      errorEl.style.display = "block";

      // Show only regenerate button in error state
      actionsEl.style.display = "flex";
      popup.querySelector(".linkedcomment-ai-popup-copy").style.display =
        "none";
    }
  }

  resetPopupToLoading(popup) {
    const loadingEl = popup.querySelector(".linkedcomment-ai-popup-loading");
    const commentEl = popup.querySelector(".linkedcomment-ai-popup-comment");
    const errorEl = popup.querySelector(".linkedcomment-ai-popup-error");
    const actionsEl = popup.querySelector(".linkedcomment-ai-popup-actions");

    loadingEl.style.display = "flex";
    commentEl.style.display = "none";
    errorEl.style.display = "none";
    actionsEl.style.display = "none";

    // Reset button visibility
    popup.querySelector(".linkedcomment-ai-popup-copy").style.display =
      "inline-flex";
  }

  truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }

  showSuccessMessage(message) {
    this.showToast(message, "success");
  }

  showErrorMessage(message) {
    this.showToast(message, "error");
  }

  showToast(message, type) {
    const toast = document.createElement("div");
    toast.className = `linkedcomment-ai-toast linkedcomment-ai-toast-${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  showErrorPopup(message) {
    const popup = document.createElement("div");
    popup.className = "linkedcomment-ai-popup-overlay";
    popup.innerHTML = `
      <div class="linkedcomment-ai-popup">
        <div class="linkedcomment-ai-popup-header">
          <h3>❌ Error</h3>
          <button class="linkedcomment-ai-popup-close">&times;</button>
        </div>
        <div class="linkedcomment-ai-popup-content">
          <div class="linkedcomment-ai-popup-error-text">${message}</div>
        </div>
        <div class="linkedcomment-ai-popup-actions">
          <button class="linkedcomment-ai-popup-btn" onclick="this.closest('.linkedcomment-ai-popup-overlay').remove()">
            OK
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(popup);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (popup.parentNode) popup.remove();
    }, 5000);
  }
}

// Initialize the extension when the script loads
const linkedCommentAI = new LinkedCommentAI();
