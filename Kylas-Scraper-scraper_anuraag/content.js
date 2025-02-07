(async function scrapeLinkedInProfile() {
    console.log("Scraping LinkedIn Profile...");

    // Scroll smoothly to load all content
    await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300;
        const timer = setInterval(() => {
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= document.body.scrollHeight) {
                clearInterval(timer);
                resolve();
            }
        }, 500);
    });
    // Extract all text from the page
    const scrapedText =  document.body.innerText;
//    console.log(scrapedText);

//    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";  // Replace with actual Groq API URL
//    const apiKey = "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"; // Replace with your API key

    let extractedText= extractUntilContactInfo(scrapedText);
//    console.log(extractedText);
    await sendToGroq(extractedText);

})();

function extractUntilContactInfo(text) {
        // Regular expression to capture everything from the start until "Contact info"
        const regex = /^(.*?)(?=Contact info)/s;
        const match = text.match(regex);

        // Return the extracted content or "Not found" if no match
        let extractedText= match ? match[1].trim() : 'Not found';

          // Regular expression to capture everything between "Experience" and "Education"
            const regex2 = /Experience([\s\S]*?)Education/g;
            const match2 = text.match(regex2);

            // Return the extracted content or "Not found" if no match
        extractedText+= match2 ? match2[0].replace('Experience', '').replace('Education', '').trim() : 'Not found';
        return extractedText;
}


// Function to send data to Groq API (via HTTP request)
async function sendToGroq(extractedData) {
  const apiKey = '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';  // Replace with your Groq API key
  const endpoint = 'https://api.groq.com/openai/v1/chat/completions';  // Groq endpoint

  const bodyData = {
    model: 'llama-3.3-70b-versatile',
    temperature: 1,
    max_completion_tokens: 1024,
    top_p: 1,
    stop: null,
    messages: [
      {
        role: "system",
        content: "You are a LinkedIn scraper that extracts name, headline, location, and experience with company name as its parameter from a given text."
      },
      {
        role: "user",
        content: `Extracted data:
         ${extractedData}`
      }
    ]
  };

  // Make the request to Groq API
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(bodyData)
  });

  if (response.ok) {
    const result = await response.json();
    console.log('Groq Response:', extractProfileData(result.choices[0].message.content));
  } else {
    console.error('Error calling Groq API:', response.statusText);
  }
}

function extractProfileData(responseContent) {
  // Use regular expressions to extract name, headline, and location
  const name = responseContent.match(/Name:\s*([^\n]*)/)?.[1];
  const headline = responseContent.match(/Headline:\s*([^\n]*)/)?.[1];
  const location = responseContent.match(/Location:\s*([^\n]*)/)?.[1];
  const url= window.location.href;
  // Extract the experience section


  const experience = responseContent.match(/Experience:\s*(.+)$/s)?.[1]?.trim();
  // Return the extracted data
  return {
    url,
    name,
    headline,
    location,
    experience
  };
}