// LinkedComment AI Background Service Worker

// Extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("LinkedComment AI extension installed");

  // Initialize default settings
  chrome.storage.sync.set({
    enabled: true,
    tone: "professional",
    autoGenerate: true,
    apiKey: "",
  });
});

// Handle messages from content script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case "generateComment":
      handleGenerateComment(request.data)
        .then((response) => sendResponse(response))
        .catch((error) => sendResponse({ error: error.message }));
      return true; // Will respond asynchronously

    case "getSettings":
      chrome.storage.sync.get(
        ["enabled", "tone", "autoGenerate", "apiKey"],
        (result) => {
          sendResponse(result);
        }
      );
      return true;

    case "updateSettings":
      chrome.storage.sync.set(request.settings, () => {
        sendResponse({ success: true });
      });
      return true;
  }
});

// Function to generate AI comment
async function handleGenerateComment(postData) {
  try {
    // Get user settings
    const settings = await new Promise((resolve) => {
      chrome.storage.sync.get(["apiKey", "tone"], resolve);
    });

    // Use tone from request data if provided, otherwise fall back to settings
    const tone = postData.tone || settings.tone || "professional";
    const requestData = { ...postData, tone };

    if (!settings.apiKey) {
      // Return mock comment if no API key is set
      return await generateMockComment(requestData, tone);
    }

    // Call DeepSeek API with user's API key
    return await callDeepSeek(requestData, { ...settings, tone });
  } catch (error) {
    console.error("Error generating comment:", error);
    throw error;
  }
}

// Generate mock comment (for testing without API key)
async function generateMockComment(postData, tone = "professional") {
  const comments = {
    professional: [
      "This is such a valuable insight! Thanks for sharing your perspective on this topic.",
      "Completely agree with your points here. This really resonates with my experience as well.",
      "Great post! This is exactly what professionals in our field need to hear.",
      "Thank you for bringing attention to this important topic. Very well articulated!",
      "This is spot on! I've seen similar patterns in my work and couldn't agree more.",
      "Excellent analysis! Your expertise really shows through in this post.",
      "This is incredibly helpful. Thank you for taking the time to share these insights!",
    ],
    friendly: [
      "Love this post! 😊 Thanks for sharing your thoughts!",
      "This is so true! Really appreciate you bringing this up.",
      "Great insights! This made me think about my own experiences too.",
      "Thanks for sharing this! Always enjoy reading your posts.",
      "This resonates with me so much! Thanks for putting it so well.",
      "Really well said! Looking forward to more posts like this.",
      "This is exactly what I needed to read today. Thank you!",
    ],
    funny: [
      "This hit different! 😂 Thanks for the reality check!",
      "Why is this so accurate though? 😅 Great post!",
      "This is too real! Thanks for sharing the truth.",
      "Called out by a LinkedIn post again! 😂 Well said!",
      "This made me chuckle because it's so true. Great insights!",
      "LinkedIn wisdom strikes again! Thanks for this gem.",
      "This is both hilarious and insightful. Perfect combo!",
    ],
  };

  // Simulate API delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1000 + Math.random() * 2000)
  );

  const toneComments = comments[tone] || comments.professional;
  return {
    comment: toneComments[Math.floor(Math.random() * toneComments.length)],
  };
}

// Call DeepSeek API (when API key is provided)
async function callDeepSeek(postData, settings) {
  const { apiKey, tone } = settings;

  const tonePrompts = {
    professional: "Write a professional and thoughtful LinkedIn comment",
    friendly: "Write a friendly and engaging LinkedIn comment",
    funny:
      "Write a light-hearted and witty LinkedIn comment (keep it professional)",
  };

  const prompt = `${
    tonePrompts[tone] || tonePrompts.professional
  } for the following post:

"${postData.text}"

IMPORTANT INSTRUCTIONS:
- Respond with ONLY the comment text
- Do NOT include explanations, alternatives, or instructions
- Do NOT use phrases like "Here's a comment" or "Alternatively"
- Keep it 1-2 sentences maximum
- Make it engaging and specific to the post content
- Do not use hashtags
- Sound natural and human-like
- Be ready to copy and paste directly

Response should be the comment only, nothing else.`;

  try {
    const response = await fetch(
      "https://api.deepseek.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that writes LinkedIn comments. Respond with ONLY the comment text, no explanations, no alternatives, no instructions. Just the clean comment ready to copy and paste.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
          stream: false,
        }),
      }
    );

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

    let comment = data.choices[0].message.content.trim();

    // Clean up the response to remove any unwanted text
    comment = cleanDeepSeekResponse(comment);

    return {
      comment: comment,
    };
  } catch (error) {
    console.error("DeepSeek API error:", error);
    // Fallback to mock comment if API fails
    return await generateMockComment(postData, tone);
  }
}

// Clean up DeepSeek response to ensure it's just the comment
function cleanDeepSeekResponse(response) {
  // Remove common unwanted phrases
  const unwantedPhrases = [
    /^Here's a [^:]*:/i,
    /^Here is a [^:]*:/i,
    /^\(Alternatively[^)]*\)/i,
    /^Alternatively[^:]*:/i,
    /Both options are/i,
    /Choose based on/i,
    /Would love to hear/i,
    /Can't wait to hear/i,
  ];

  let cleaned = response.trim();

  // Remove unwanted phrases
  unwantedPhrases.forEach((phrase) => {
    cleaned = cleaned.replace(phrase, "").trim();
  });

  // Split by common separators and take the first clean comment
  const separators = [
    /\n\n\(Alternatively/i,
    /\n\nAlternatively/i,
    /\n\nBoth options/i,
    /\n\nChoose based/i,
  ];

  for (const separator of separators) {
    const parts = cleaned.split(separator);
    if (parts.length > 1) {
      cleaned = parts[0].trim();
      break;
    }
  }

  // Remove surrounding quotes if present
  if (
    (cleaned.startsWith('"') && cleaned.endsWith('"')) ||
    (cleaned.startsWith("'") && cleaned.endsWith("'"))
  ) {
    cleaned = cleaned.slice(1, -1).trim();
  }

  // Remove any remaining instructional text at the end
  cleaned = cleaned.replace(
    /\s*(Both options|Choose based|Would love to hear).*$/i,
    ""
  );

  return cleaned.trim();
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab.url.includes("linkedin.com")) {
    // Toggle extension on/off for current tab
    chrome.storage.sync.get(["enabled"], (result) => {
      const newState = !result.enabled;
      chrome.storage.sync.set({ enabled: newState });

      // Send message to content script
      chrome.tabs.sendMessage(tab.id, {
        action: "toggleExtension",
        enabled: newState,
      });
    });
  }
});
