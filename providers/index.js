// AI Providers Index for LinkedComment AI
// This file manages all available AI providers and utility providers

// Import providers
// Note: In browser extension context, we'll load these via script tags

/**
 * Available AI Providers
 */
const PROVIDERS = {
  DEEPSEEK: "deepseek",
  // Future providers can be added here
  // OPENAI: 'openai',
  // ANTHROPIC: 'anthropic',
  // GEMINI: 'gemini'
};

/**
 * Available Utility Providers
 */
const UTILITY_PROVIDERS = {
  BUTTON_STYLES: "buttonStyles",
  // Future utility providers
  // THEMES: 'themes',
  // ANALYTICS: 'analytics'
};

/**
 * Provider Factory
 * Creates and returns the appropriate AI provider instance
 */
class ProviderFactory {
  /**
   * Create a provider instance
   * @param {string} providerType - Type of provider (deepseek, openai, etc.)
   * @param {string} apiKey - API key for the provider
   * @returns {Object} Provider instance
   */
  static createProvider(providerType = PROVIDERS.DEEPSEEK, apiKey) {
    switch (providerType.toLowerCase()) {
      case PROVIDERS.DEEPSEEK:
        if (typeof DeepSeekProvider === "undefined") {
          throw new Error("DeepSeek provider not loaded");
        }
        return new DeepSeekProvider(apiKey);

      // Future providers
      // case PROVIDERS.OPENAI:
      //   return new OpenAIProvider(apiKey);

      default:
        throw new Error(`Unknown provider type: ${providerType}`);
    }
  }

  /**
   * Create a utility provider instance
   * @param {string} utilityType - Type of utility provider
   * @returns {Object} Utility provider instance
   */
  static createUtilityProvider(utilityType) {
    switch (utilityType.toLowerCase()) {
      case UTILITY_PROVIDERS.BUTTON_STYLES:
        if (typeof ButtonStylesProvider === "undefined") {
          throw new Error("ButtonStyles provider not loaded");
        }
        return new ButtonStylesProvider();

      // Future utility providers
      // case UTILITY_PROVIDERS.THEMES:
      //   return new ThemesProvider();

      default:
        throw new Error(`Unknown utility provider type: ${utilityType}`);
    }
  }

  /**
   * Get list of available providers
   * @returns {Array} List of provider types
   */
  static getAvailableProviders() {
    return Object.values(PROVIDERS);
  }

  /**
   * Get list of available utility providers
   * @returns {Array} List of utility provider types
   */
  static getAvailableUtilityProviders() {
    return Object.values(UTILITY_PROVIDERS);
  }

  /**
   * Check if a provider is available
   * @param {string} providerType - Provider type to check
   * @returns {boolean} True if provider is available
   */
  static isProviderAvailable(providerType) {
    return Object.values(PROVIDERS).includes(providerType.toLowerCase());
  }

  /**
   * Check if a utility provider is available
   * @param {string} utilityType - Utility provider type to check
   * @returns {boolean} True if utility provider is available
   */
  static isUtilityProviderAvailable(utilityType) {
    return Object.values(UTILITY_PROVIDERS).includes(utilityType.toLowerCase());
  }
}

/**
 * Provider Manager
 * Handles provider lifecycle and configuration
 */
class ProviderManager {
  constructor() {
    this.currentProvider = null;
    this.providerType = PROVIDERS.DEEPSEEK;
    this.apiKey = null;
    this.utilityProviders = new Map();
  }

  /**
   * Initialize provider with settings
   * @param {Object} settings - Provider settings
   */
  async initialize(settings = {}) {
    this.apiKey = settings.apiKey || "";
    this.providerType = settings.provider || PROVIDERS.DEEPSEEK;

    try {
      this.currentProvider = ProviderFactory.createProvider(
        this.providerType,
        this.apiKey
      );
      console.log(`Initialized ${this.providerType} provider`);

      // Initialize utility providers
      await this.initializeUtilityProviders();
    } catch (error) {
      console.error("Failed to initialize provider:", error);
      throw error;
    }
  }

  /**
   * Initialize utility providers
   */
  async initializeUtilityProviders() {
    try {
      // Initialize ButtonStyles provider
      const buttonStylesProvider = ProviderFactory.createUtilityProvider(
        UTILITY_PROVIDERS.BUTTON_STYLES
      );
      this.utilityProviders.set(
        UTILITY_PROVIDERS.BUTTON_STYLES,
        buttonStylesProvider
      );

      console.log("Utility providers initialized");
    } catch (error) {
      console.warn("Some utility providers failed to initialize:", error);
    }
  }

  /**
   * Get utility provider
   * @param {string} utilityType - Type of utility provider
   * @returns {Object|null} Utility provider instance
   */
  getUtilityProvider(utilityType) {
    return this.utilityProviders.get(utilityType) || null;
  }

  /**
   * Generate comment using current provider
   * @param {Object} postData - LinkedIn post data
   * @param {string} tone - Comment tone
   * @returns {Promise<string>} Generated comment
   */
  async generateComment(postData, tone) {
    if (!this.currentProvider) {
      throw new Error("No provider initialized");
    }

    return await this.currentProvider.generateComment(postData, tone);
  }

  /**
   * Update button styles using ButtonStyles provider
   * @param {Object} settings - Button customization settings
   */
  updateButtonStyles(settings) {
    const buttonStylesProvider = this.getUtilityProvider(
      UTILITY_PROVIDERS.BUTTON_STYLES
    );
    if (buttonStylesProvider) {
      buttonStylesProvider.updateButtonStyles(settings);
    }
  }

  /**
   * Test current provider connection
   * @returns {Promise<boolean>} Connection test result
   */
  async testConnection() {
    if (!this.currentProvider) {
      return false;
    }

    return await this.currentProvider.testConnection();
  }

  /**
   * Get current provider info
   * @returns {Object} Provider information
   */
  getProviderInfo() {
    if (!this.currentProvider) {
      return null;
    }

    return this.currentProvider.getInfo();
  }

  /**
   * Switch to a different provider
   * @param {string} providerType - New provider type
   * @param {string} apiKey - API key for new provider
   */
  async switchProvider(providerType, apiKey) {
    this.providerType = providerType;
    this.apiKey = apiKey;
    await this.initialize({ provider: providerType, apiKey });
  }

  /**
   * Cleanup all providers
   */
  cleanup() {
    // Cleanup utility providers
    this.utilityProviders.forEach((provider) => {
      if (provider.destroy && typeof provider.destroy === "function") {
        provider.destroy();
      }
    });
    this.utilityProviders.clear();

    // Clear current provider
    this.currentProvider = null;
  }
}

// Export for different environments
if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = {
    PROVIDERS,
    UTILITY_PROVIDERS,
    ProviderFactory,
    ProviderManager,
  };
} else if (typeof window !== "undefined") {
  // Browser environment
  window.PROVIDERS = PROVIDERS;
  window.UTILITY_PROVIDERS = UTILITY_PROVIDERS;
  window.ProviderFactory = ProviderFactory;
  window.ProviderManager = ProviderManager;
}
