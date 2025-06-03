// LinkedComment AI Injection Script
// This script handles additional post processing and AI comment logic

class PostProcessor {
  static extractPostMetadata(postElement) {
    const metadata = {
      timestamp: null,
      engagement: {
        likes: 0,
        comments: 0,
        shares: 0,
      },
      postType: "text",
      hasMedia: false,
      isSponsored: false,
    };

    try {
      // Extract timestamp
      const timeElement = postElement.querySelector(
        'time, [data-test-id*="time"], .update-components-actor__sub-description time'
      );
      if (timeElement) {
        metadata.timestamp =
          timeElement.getAttribute("datetime") || timeElement.textContent;
      }

      // Extract engagement metrics
      const socialCountsElement = postElement.querySelector(
        ".social-counts-reactions__count, .feed-shared-social-counts"
      );
      if (socialCountsElement) {
        const text = socialCountsElement.textContent || "";
        const numbers = text.match(/\d+/g);
        if (numbers) {
          metadata.engagement.likes = parseInt(numbers[0]) || 0;
        }
      }

      // Check for media
      const mediaElements = postElement.querySelectorAll(
        'img, video, [data-test-id*="media"]'
      );
      metadata.hasMedia = mediaElements.length > 0;

      // Determine post type
      if (postElement.querySelector('[data-test-id*="video"]')) {
        metadata.postType = "video";
      } else if (postElement.querySelector('[data-test-id*="image"]')) {
        metadata.postType = "image";
      } else if (postElement.querySelector('[data-test-id*="article"]')) {
        metadata.postType = "article";
      }

      // Check if sponsored
      metadata.isSponsored = !!postElement.querySelector(
        '[data-test-id*="promoted"], .update-components-actor__description [aria-label*="promoted"]'
      );
    } catch (error) {
      console.warn("Error extracting post metadata:", error);
    }

    return metadata;
  }

  static enhancePostContent(postData) {
    // Add context and metadata to improve AI comment generation
    const metadata = this.extractPostMetadata(postData.element);

    return {
      ...postData,
      metadata,
      contextualInfo: this.generateContextualInfo(postData, metadata),
    };
  }

  static generateContextualInfo(postData, metadata) {
    const context = [];

    // Add post type context
    if (metadata.postType !== "text") {
      context.push(`This is a ${metadata.postType} post`);
    }

    // Add engagement context
    if (metadata.engagement.likes > 100) {
      context.push("This post has high engagement");
    }

    // Add timing context
    if (metadata.timestamp) {
      const postDate = new Date(metadata.timestamp);
      const now = new Date();
      const daysDiff = Math.floor((now - postDate) / (1000 * 60 * 60 * 24));

      if (daysDiff === 0) {
        context.push("This is a recent post");
      } else if (daysDiff > 7) {
        context.push("This is an older post");
      }
    }

    return context.join(". ");
  }

  static sanitizePostText(text) {
    // Clean up post text for better AI processing
    return text
      .replace(/\s+/g, " ") // Normalize whitespace
      .replace(/#{1,}\s*$/gm, "") // Remove trailing hashtags
      .replace(/^\s*#\w+\s*/gm, "") // Remove leading hashtags
      .trim();
  }

  static shouldSkipPost(postElement) {
    // Determine if we should skip generating comments for this post
    const skipSelectors = [
      '[data-test-id*="promoted"]',
      '.update-components-actor__description [aria-label*="promoted"]',
      '[data-test-id*="job-posting"]',
      ".jobs-post-card",
    ];

    return skipSelectors.some((selector) =>
      postElement.querySelector(selector)
    );
  }
}

// Make available globally
window.PostProcessor = PostProcessor;
