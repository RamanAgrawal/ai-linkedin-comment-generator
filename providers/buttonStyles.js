// Button Styles Provider - Manages dynamic button customization styles
class ButtonStylesProvider {
  constructor() {
    this.styleElement = null;
    this.currentSettings = null;
    this.init();
  }

  init() {
    // Create style element for dynamic styles
    this.styleElement = document.createElement("style");
    this.styleElement.id = "linkedcomment-ai-button-styles";
    document.head.appendChild(this.styleElement);
  }

  // Color theme configurations
  getColorThemes() {
    return {
      blue: {
        primary: "#0077b5",
        hover: "#005885",
        light: "#e6f3ff",
        shadow: "rgba(0, 119, 181, 0.33)",
      },
      green: {
        primary: "#16a085",
        hover: "#138d75",
        light: "#e8f8f5",
        shadow: "rgba(22, 160, 133, 0.33)",
      },
      purple: {
        primary: "#8e44ad",
        hover: "#7d3c98",
        light: "#f4ecf7",
        shadow: "rgba(142, 68, 173, 0.33)",
      },
      orange: {
        primary: "#e67e22",
        hover: "#d35400",
        light: "#fef9e7",
        shadow: "rgba(230, 126, 34, 0.33)",
      },
      red: {
        primary: "#e74c3c",
        hover: "#c0392b",
        light: "#fadbd8",
        shadow: "rgba(231, 76, 60, 0.33)",
      },
      teal: {
        primary: "#1abc9c",
        hover: "#16a085",
        light: "#d5f4e6",
        shadow: "rgba(26, 188, 156, 0.33)",
      },
    };
  }

  // Size configurations
  getSizeConfigs() {
    return {
      small: {
        fontSize: "11px",
        padding: "6px",
        iconSize: "14px",
        gap: "4px",
        borderRadius: "4px",
      },
      medium: {
        fontSize: "13px",
        padding: "6px",
        iconSize: "16px",
        gap: "6px",
        borderRadius: "6px",
      },
      large: {
        fontSize: "15px",
        padding: "10px",
        iconSize: "18px",
        gap: "8px",
        borderRadius: "8px",
      },
    };
  }

  // Update button styles based on settings
  updateButtonStyles(settings) {
    if (!settings) return;

    this.currentSettings = settings;
    const themes = this.getColorThemes();
    const sizes = this.getSizeConfigs();

    const theme = themes[settings.buttonColor] || themes.blue;
    const size = sizes[settings.buttonSize] || sizes.medium;

    // Generate CSS for current settings
    const css = this.generateDynamicCSS(theme, size, settings);

    // Update style element
    if (this.styleElement) {
      this.styleElement.textContent = css;
    }
  }

  generateDynamicCSS(theme, size, settings) {
    const hasText = settings.buttonText && settings.buttonText.trim();

    return `
      /* Dynamic Button Customization Styles */
      .linkedcomment-ai-btn[data-customized="true"] {
        background: transparent !important;
        color: ${theme.primary} !important;
        border-radius: ${size.borderRadius} !important;
        padding: ${
          hasText ? size.padding : size.padding.split(" ")[0]
        } !important;
        font-size: ${size.fontSize} !important;
        gap: ${hasText ? size.gap : "0"} !important;
        flex-direction: row !important;
        height: auto !important;
        min-width: auto !important;
        font-weight: 500 !important;
        transition: all 0.3s ease !important;
        outline: none !important;
        position: relative !important;
        overflow: hidden !important;
      }

      /* Icon-only button specific styles */
      .linkedcomment-ai-btn[data-customized="true"].icon-only {
        padding: ${size.padding.split(" ")[0]} !important;
        min-width: auto !important;
        aspect-ratio: 1;
        justify-content: center !important;
      }

      .linkedcomment-ai-btn[data-customized="true"]:hover {
        background: ${theme.primary} !important;
        color: white !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 2px 8px ${theme.shadow} !important;
        border-color: ${theme.primary} !important;
      }

      .linkedcomment-ai-btn[data-customized="true"]:active {
        transform: translateY(0) !important;
        box-shadow: 0 1px 4px ${theme.shadow} !important;
      }

      .linkedcomment-ai-btn[data-customized="true"]:disabled {
        cursor: not-allowed !important;
        opacity: 0.6 !important;
        transform: none !important;
        box-shadow: none !important;
      }

      .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-content {
        flex-direction: row !important;
        gap: ${hasText ? size.gap : "0"} !important;
        width: auto !important;
        align-items: center !important;
        justify-content: center !important;
      }

      .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-icon {
        font-size: ${size.iconSize} !important;
        line-height: 1 !important;
      }

      .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-text {
        font-size: ${size.fontSize} !important;
        font-weight: 500 !important;
        white-space: nowrap !important;
      }

      .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-loading {
        flex-direction: row !important;
        width: auto !important;
        gap: ${size.gap} !important;
        color: ${theme.primary} !important;
      }

      .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-loading span {
        font-size: calc(${size.fontSize} - 2px) !important;
        text-align: left !important;
      }

      .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-spinner {
        width: calc(${size.iconSize} - 2px) !important;
        height: calc(${size.iconSize} - 2px) !important;
        border-top-color: ${theme.primary} !important;
        border-right-color: transparent !important;
        border-bottom-color: transparent !important;
        border-left-color: transparent !important;
      }

      /* Hover animation for customized buttons */
      .linkedcomment-ai-btn[data-customized="true"]::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s;
      }

      .linkedcomment-ai-btn[data-customized="true"]:hover::before {
        left: 100%;
      }

      /* Focus states for accessibility */
      .linkedcomment-ai-btn[data-customized="true"]:focus {
        outline: 2px solid ${theme.primary} !important;
        outline-offset: 2px !important;
      }

      .linkedcomment-ai-btn[data-customized="true"]:focus:not(:focus-visible) {
        outline: none !important;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .linkedcomment-ai-btn[data-customized="true"] {
          font-size: calc(${size.fontSize} - 1px) !important;
          padding: calc(${size.padding.split(" ")[0]} - 1px) ${
      hasText
        ? `calc(${size.padding.split(" ")[1]} - 2px)`
        : `calc(${size.padding.split(" ")[0]} - 1px)`
    } !important;
        }
        
        .linkedcomment-ai-btn[data-customized="true"] .linkedcomment-ai-icon {
          font-size: calc(${size.iconSize} - 2px) !important;
        }

        .linkedcomment-ai-btn[data-customized="true"].icon-only {
          padding: calc(${size.padding.split(" ")[0]} - 1px) !important;
        }
      }
    `;
  }

  // Get current settings
  getCurrentSettings() {
    return this.currentSettings;
  }

  // Cleanup
  destroy() {
    if (this.styleElement && this.styleElement.parentNode) {
      this.styleElement.parentNode.removeChild(this.styleElement);
    }
  }

  // Reset to default styles
  resetToDefault() {
    const defaultSettings = {
      buttonIcon: "🤖",
      buttonText: "",
      buttonColor: "blue",
      buttonSize: "medium",
    };

    this.updateButtonStyles(defaultSettings);
    return defaultSettings;
  }

  // Validate settings
  validateSettings(settings) {
    const themes = Object.keys(this.getColorThemes());
    const sizes = Object.keys(this.getSizeConfigs());

    return {
      buttonColor: themes.includes(settings.buttonColor)
        ? settings.buttonColor
        : "blue",
      buttonSize: sizes.includes(settings.buttonSize)
        ? settings.buttonSize
        : "medium",
      buttonIcon: settings.buttonIcon || "🤖",
      buttonText: settings.buttonText || "",
    };
  }

  // Add custom theme
  addCustomTheme(name, themeConfig) {
    const themes = this.getColorThemes();
    themes[name] = themeConfig;

    if (this.currentSettings) {
      this.updateButtonStyles(this.currentSettings);
    }
  }

  // Get available themes
  getAvailableThemes() {
    return Object.keys(this.getColorThemes());
  }

  // Get available sizes
  getAvailableSizes() {
    return Object.keys(this.getSizeConfigs());
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = ButtonStylesProvider;
} else {
  window.ButtonStylesProvider = ButtonStylesProvider;
}
