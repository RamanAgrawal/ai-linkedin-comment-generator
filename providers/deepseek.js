// DeepSeek AI Provider for LinkedComment AI

class DeepSeekProvider {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.deepseek.com/v1";
    this.model = "deepseek-chat";
  }

  /**
   * Generate AI comment using DeepSeek API
   * @param {Object} postData - The LinkedIn post data
   * @param {string} tone - The tone for the comment (professional, friendly, funny)
   * @returns {Promise<string>} Generated comment
   */
  async generateComment(postData, tone = "professional") {
    if (!this.apiKey) {
      throw new Error("DeepSeek API key is required");
    }

    const tonePrompts = {
      professional: "Write a professional and thoughtful LinkedIn comment",
      friendly: "Write a friendly and engaging LinkedIn comment",
      funny:
        "Write a light-hearted and witty LinkedIn comment (keep it professional)",
    };

    const systemPrompt = `You are a helpful assistant that writes professional LinkedIn comments. 
    Keep responses concise, engaging, and human-like. Avoid generic responses and be specific to the post content.
    Never use hashtags in comments. Make the comment sound natural and authentic.`;

    const userPrompt = `${
      tonePrompts[tone] || tonePrompts.professional
    } for the following post:

"${postData.text}"

Author: ${postData.author || "Unknown"}

Instructions:
- Keep the comment concise (1-2 sentences)
- Make it engaging and add value to the conversation
- Do not use hashtags
- Sound natural and human-like
- Be specific to the content of the post
- Avoid generic responses
- Add a personal touch to the comment and make it sound like you are a real person
- add the part of the post that you are responding to
- Show genuine interest or insight`;

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: "system",
              content: systemPrompt,
            },
            {
              role: "user",
              content: userPrompt,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `DeepSeek API error: ${response.status} - ${
            errorData.error?.message || "Unknown error"
          }`
        );
      }

      const data = await response.json();

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid response from DeepSeek API");
      }

      const comment = data.choices[0].message.content.trim();

      // Clean up the comment (remove quotes if wrapped)
      return this.cleanComment(comment);
    } catch (error) {
      console.error("DeepSeek API error:", error);
      throw error;
    }
  }

  /**
   * Clean and format the generated comment
   * @param {string} comment - Raw comment from API
   * @returns {string} Cleaned comment
   */
  cleanComment(comment) {
    // Remove surrounding quotes if present
    if (
      (comment.startsWith('"') && comment.endsWith('"')) ||
      (comment.startsWith("'") && comment.endsWith("'"))
    ) {
      comment = comment.slice(1, -1);
    }

    // Remove any leading/trailing whitespace
    comment = comment.trim();

    // Ensure the comment doesn't start with generic phrases
    const genericStarters = [
      "Great post!",
      "Thanks for sharing!",
      "This is interesting!",
      "Nice post!",
    ];

    // If comment starts with generic phrase, try to make it more specific
    for (const starter of genericStarters) {
      if (comment.toLowerCase().startsWith(starter.toLowerCase())) {
        // Keep the comment as is for now, but could enhance this logic
        break;
      }
    }

    return comment;
  }

  /**
   * Test the API connection
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection() {
    try {
      const testData = {
        text: "This is a test post about professional development.",
        author: "Test User",
      };

      await this.generateComment(testData, "professional");
      return true;
    } catch (error) {
      console.error("DeepSeek connection test failed:", error);
      return false;
    }
  }

  /**
   * Get provider information
   * @returns {Object} Provider details
   */
  getInfo() {
    return {
      name: "DeepSeek",
      model: this.model,
      hasApiKey: !!this.apiKey,
      baseUrl: this.baseUrl,
    };
  }
}

// Export for use in other files
if (typeof module !== "undefined" && module.exports) {
  module.exports = DeepSeekProvider;
} else if (typeof window !== "undefined") {
  window.DeepSeekProvider = DeepSeekProvider;
}
