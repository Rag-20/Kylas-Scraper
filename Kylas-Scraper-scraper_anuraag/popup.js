document.addEventListener("DOMContentLoaded", () => {
    const scrapeBtn = document.getElementById("scrapeBtn");
    const enhanceBtn = document.getElementById("enhanceBtn");
    const pushBtn = document.getElementById("pushBtn");
    const nameEl = document.getElementById("name");
    const companyEl = document.getElementById("company");
    const cityEl = document.getElementById("city");
    const stateEl = document.getElementById("state");
    const countryEl = document.getElementById("country");
    const linkedinProfileEl = document.getElementById("linkedIn");
    const emailEl = document.getElementById("email");
    const phoneEl = document.getElementById("phone");
  
    const APOLLO_API_URL = "https://api.apollo.io/v1/people/match";
    const APOLLO_API_KEY = "PIFrD8WvoR0i3EQGNzUpGA"; // Replace with actual API key
  
    const KYLAS_API_URL = "https://api-qa.sling-dev.com/v1/leads/";
    const KYLAS_API_KEY = "2c618f84-b16b-445f-b34a-891930068c5b:4366"; // Replace with actual API key
    const OWNER_ID = 11205;
  
    scrapeBtn.addEventListener("click", async () => {
      scrapeBtn.innerText = "Scraping...";
      scrapeBtn.disabled = true;
  
      resetUI();
  
      // Run content script
      chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ["content.js"],
        });
      });
  
      setTimeout(() => {
        loadProfileData();
      }, 5000);
    });
  
    function loadProfileData() {
      chrome.storage.local.get("profileData", (result) => {
        if (result.profileData) {
          const profile = result.profileData;
          nameEl.innerText = `${profile.first_name || "N/A"} ${
            profile.last_name || ""
          }`;
          companyEl.innerText = profile.company_name || "N/A";
          cityEl.innerText = profile.city || "N/A";
          stateEl.innerText = profile.state || "N/A";
          countryEl.innerText = profile.country || "N/A";
          linkedinProfileEl.innerText = profile.linkedin_url || "N/A";
  
          enhanceBtn.disabled = false;
          pushBtn.disabled = false;
  
          enhanceBtn.onclick = () => enhanceData(profile.linkedin_url);
          pushBtn.onclick = () => pushToKylas(profile);
        } else {
          alert("⚠️ No profile data found!");
          enhanceBtn.disabled = true;
          pushBtn.disabled = true;
        }
  
        scrapeBtn.innerText = "Scrape Again";
        scrapeBtn.disabled = false;
      });
    }
  
    async function fetchApolloProfile() {
      alert("Enrich Successful");
      const endpoint =
        "https://api.apollo.io/api/v1/people/match?reveal_personal_emails=false&reveal_phone_number=false";
  
      const requestBody = {
        linkedin_url: linkedIn,
      };
  
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Cache-Control": "no-cache",
            "Content-Type": "application/json",
            "Accept": "application/json",
            "x-api-key": "PIFrD8WvoR0i3EQGNzUpGA",
          },
          body: JSON.stringify(requestBody),
        });
  
        if (!response.ok) {
          throw new Error(
            `HTTP Error: ${response.status} - ${response.statusText}`
          );
        }
  
        const data = await response.json();
        console.log("Apollo Profile URL:", data);
         
        // return data;
      } catch (error) {
        console.error("Error fetching data from Apollo:", error);
        throw error; 
      }
    }
  
    async function enhanceData(linkedinUrl) {
      enhanceBtn.innerText = "Enhancing...";
      enhanceBtn.disabled = true;
  
      const enhancedData = await fetchApolloProfile(linkedinUrl);
  
      // if (enhancedData) {
      //   emailEl.innerText = enhancedData.email;
      //   phoneEl.innerText = enhancedData.phone;
      //   alert("✅ Data Enhanced Successfully!");
      // } else {
      //   alert("❌ No data found in Apollo.");
      // }
  
      enhanceBtn.innerText = "Enhance Data";
      enhanceBtn.disabled = false;
    }
  
    async function pushToKylas(profile) {
      if (!profile || !profile.first_name) {
        console.error("❌ No valid profile data to send.");
        return;
      }
  
      const leadData = {
        ownerId: OWNER_ID,
        firstName: profile.first_name || "N/A",
        lastName: profile.last_name || "N/A",
        linkedIn: profile.linkedin_url || null,
        email: emailEl.innerText !== "N/A" ? emailEl.innerText : null,
        phone: phoneEl.innerText !== "N/A" ? phoneEl.innerText : null,
      };
  
      pushBtn.innerText = "Pushing...";
      pushBtn.disabled = true;
  
      try {
        const response = await fetch(KYLAS_API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-key": KYLAS_API_KEY,
          },
          body: JSON.stringify(leadData),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert("🎉 Lead successfully pushed to Kylas!");
          pushBtn.innerText = "Pushed!";
        } else {
          alert(`❌ Failed to push lead: ${result.message || "Unknown error"}`);
          pushBtn.innerText = "Push to Kylas";
          pushBtn.disabled = false;
        }
      } catch (error) {
        console.error("⚠️ Error pushing data to Kylas:", error);
        alert("❌ Error pushing lead.");
        pushBtn.innerText = "Push to Kylas";
        pushBtn.disabled = false;
      }
    }
  
    document.getElementById("enhanceBtn").addEventListener("click", async () => {
      const linkedinURL = document.getElementById("linkedIn").innerText;
  
      if (linkedinURL === "N/A") {
        alert("❌ No LinkedIn profile found.");
        return;
      }
  
      document.getElementById("enhanceBtn").innerText = "Enhancing...";
      document.getElementById("enhanceBtn").disabled = true;
  
      const enhancedData = await fetchApolloProfile(linkedinURL);
  
      if (enhancedData) {
        alert(`✅ Email: ${enhancedData.email}\n📞 Phone: ${enhancedData.phone}`);
      } else {
        alert("❌ Failed to enhance data.");
      }
  
      document.getElementById("enhanceBtn").innerText = "Enhance Data";
      document.getElementById("enhanceBtn").disabled = false;
    });
  
    function resetUI() {
      nameEl.innerText =
        companyEl.innerText =
        cityEl.innerText =
        stateEl.innerText =
        countryEl.innerText =
        linkedinProfileEl.innerText =
        emailEl.innerText =
        phoneEl.innerText =
          "N/A";
      enhanceBtn.disabled = pushBtn.disabled = true;
    }
  });
  