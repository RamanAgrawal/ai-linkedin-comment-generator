// AI Providers Index for LinkedComment AI
// This file manages all available AI providers

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
   * Get list of available providers
   * @returns {Array} List of provider types
   */
  static getAvailableProviders() {
    return Object.values(PROVIDERS);
  }

  /**
   * Check if a provider is available
   * @param {string} providerType - Provider type to check
   * @returns {boolean} True if provider is available
   */
  static isProviderAvailable(providerType) {
    return Object.values(PROVIDERS).includes(providerType.toLowerCase());
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
    } catch (error) {
      console.error("Failed to initialize provider:", error);
      throw error;
    }
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
}

// Export for different environments
if (typeof module !== "undefined" && module.exports) {
  // Node.js environment
  module.exports = {
    PROVIDERS,
    ProviderFactory,
    ProviderManager,
  };
} else if (typeof window !== "undefined") {
  // Browser environment
  window.PROVIDERS = PROVIDERS;
  window.ProviderFactory = ProviderFactory;
  window.ProviderManager = ProviderManager;
}
