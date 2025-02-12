(function () {
  let lastProfileId = getProfileIdFromUrl(); // Store the initial profile ID

  function scrapeLinkedInProfile() {
    console.log("🚀 Scraping LinkedIn Profile...");

    // Extract all text from the profile page
    const scrapedText = document.body.innerText;

    // Process and filter the extracted text
    let extractedText = extractUntilContactInfo(scrapedText);

    // Send extracted text to Groq API (or handle it as needed)
    sendToGroq(extractedText);
  }

  // Function to extract the unique profile ID from LinkedIn URL
  function getProfileIdFromUrl() {
    const match = location.href.match(/linkedin\.com\/in\/([a-zA-Z0-9-]+)/);
    return match ? match[1] : null; // Extract profile username or ID
  }

  // Function to check if the profile ID has changed
  function checkProfileChange() {
    const currentProfileId = getProfileIdFromUrl();

    if (currentProfileId && currentProfileId !== lastProfileId) {
      console.log("🔄 New profile detected, scraping...");
      lastProfileId = currentProfileId;
      scrapeLinkedInProfile();
    }
  }

  // Check for profile changes every 1 second
  setInterval(checkProfileChange, 1000);

  console.log("👀 Monitoring LinkedIn profile changes...");
})();

// Extract relevant LinkedIn profile data before "Contact info"
function extractUntilContactInfo(text) {
  const regex = /^(.*?)(?=Contact info)/s;
  const match = text.match(regex);
  let extractedText = match ? match[1].trim() : "Not found";

  const regex2 = /Experience([\s\S]*?)Education/g;
  const match2 = text.match(regex2);

  extractedText += match2
    ? match2[0].replace("Experience", "").replace("Education", "").trim()
    : "Not found";
  return extractedText;
}

// Send extracted LinkedIn data to Groq API
async function sendToGroq(extractedData) {
  const apiKey = "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";
  const endpoint = "https://api.groq.com/openai/v1/chat/completions";

  const bodyData = {
    model: "llama-3.3-70b-versatile",
    temperature: 1,
    max_completion_tokens: 1024,
    top_p: 1,
    messages: [
      {
        role: "system",
        content:
          "You are a LinkedIn scraper that extracts first name, last name, company name, city, state, country, industry, and experience from the given text in JSON format.",
      },
      {
        role: "user",
        content: `Extracted data:\n${extractedData}`,
      },
    ],
  };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(bodyData),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const result = await response.json();
    const resultText = result.choices[0].message.content;
    const jsonText = resultText.slice(
      resultText.indexOf("{"),
      resultText.lastIndexOf("}") + 1
    );

    let jsonObject = JSON.parse(jsonText);
    jsonObject.linkedin_url = window.location.href;

    console.log("✅ Scraped Data:", jsonObject);

    // ✅ Store data in Chrome storage
    chrome.storage.local.set({ profileData: jsonObject }, () => {
      console.log("✅ Profile data saved in Chrome storage!");
    });
  } catch (error) {
    console.error("❌ Error calling Groq API:", error);
  }
}
