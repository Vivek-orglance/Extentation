// Button
document.addEventListener("DOMContentLoaded", async function () {
  const myButton = document.getElementById("my-btn");

  myButton.addEventListener("click", async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs) {
      const tab = tabs[0];
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: scrapeLinks,
      });
    });
  });
});

// Scrape current active chrome content
const scrapeLinks = async () => {
  let maxScrollAttempts = 1000; // Number of times to attempt scrolling
  let currentScrollAttempt = 0;
  const scrollInterval = 100; // Time interval between scroll attempts (in milliseconds)
  
  const uniqueEmails = new Set(); // Use a Set to store unique email addresses

  const scrollAndScrape = async () => {
    if (currentScrollAttempt >= maxScrollAttempts) {
      clearInterval(scrollIntervalId);
      console.log("Reached the end of the page or maximum scroll attempts.");
      scrapeData();
    } else {
      document.documentElement.scrollTop += 1000; // Scroll down by 1000 pixels
      currentScrollAttempt++;
    }
  };

  const scrapeData = async () => {
    const seeMoreButton = document.querySelector('button[aria-label="see more, visually reveals content which is already detected by screen readers"]');
    if (seeMoreButton) {
      seeMoreButton.click();
    }

    // Wait for a moment for the content to load after clicking "see more" (adjust the delay if necessary)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const links = document.querySelectorAll('span');
    links.forEach((link) => {
      let emailList = link.innerHTML.match(/([a-zA-Z0-9.+-]+@[a-zA-Z0-9.-]+\.[a-z]+)/gi);
      if (emailList !== null) {
        emailList.forEach((email) => {
          uniqueEmails.add(email); // Add unique emails to the Set
        });
      }
    });

    // Convert the Set to an array
    const uniqueEmailArray = Array.from(uniqueEmails);

    // Send unique scraped data to Airtable or perform other actions
    uniqueEmailArray.forEach(async (value) => {
      console.log(value);
      try {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", "Bearer keyUZKA03iFrtK1Ol");
        myHeaders.append("Content-Type", "application/json");
        
        const raw = JSON.stringify({
          "records": [
            {
              "fields": {
                "content": value
              }
            }
          ]
        });

        const requestOptions = {
          method: 'POST',
          headers: myHeaders,
          body: raw,
          redirect: 'follow'
        };
        const url = "https://api.airtable.com/v0/app0S6pzSWtEFG7bp/Extentation";
        const result = await fetch(url, requestOptions);
        if (result.status === 200) {
          //alert('success');
          console.log('success');
        } else {
          //alert('failed');
          console.log('failed');
        }
      } catch (err) {
        alert(err.message || err);
      }
    });
  };

  const scrollIntervalId = setInterval(scrollAndScrape, scrollInterval);
};














