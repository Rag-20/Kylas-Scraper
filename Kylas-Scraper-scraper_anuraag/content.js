   import Groq from "groq-sdk";
(async function scrapeLinkedInProfile() {
    console.log("🔍 Scraping LinkedIn Profile...");

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

    const apiUrl = "https://api.groq.com/openai/v1/chat/completions";  // Replace with actual Groq API URL
    const apiKey = "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"; // Replace with your API key

    let extractedText=""
    function extractUntilContactInfo(text) {
        // Regular expression to capture everything from the start until "Contact info"
        const regex = /^(.*?)(?=Contact info)/s;
        const match = text.match(regex);

        // Return the extracted content or "Not found" if no match
        extractedText+= match ? match[1].trim() : 'Not found';

          // Regular expression to capture everything between "Experience" and "Education"
            const regex2 = /Experience([\s\S]*?)Education/g;
            const match2 = text.match(regex2);

            // Return the extracted content or "Not found" if no match
        extractedText+= match2 ? match2[0].replace('Experience', '').replace('Education', '').trim() : 'Not found';
    }


    extractUntilContactInfo(scrapedText);
    //console.log(extractedText);




    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    export async function main() {
      const chatCompletion = await getGroqChatCompletion();
      // Print the completion returned by the LLM.
      console.log(chatCompletion.choices[0]?.message?.content || "");
    }

    export async function getGroqChatCompletion() {
      return groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Explain the importance of fast language models",
          },
        ],
        model: "llama-3.3-70b-versatile",
      });
    }



})();



