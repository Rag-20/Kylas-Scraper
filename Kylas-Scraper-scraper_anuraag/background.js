chrome.runtime.onInstalled.addListener(() => {
    console.log("LinkedIn Scraper Installed");
});





//chrome.storage.local.get("profileData", (data) => {
//    console.log("Stored Data:", data.profileData);
//});
//fetch("https://your-database.com/api/save", {
//    method: "POST",
//    headers: { "Content-Type": "application/json" },
//    body: JSON.stringify({ name, headline, location, experience })
//});