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
  
  //scapper current active chrome content
  const scrapeLinks = async () => {
    document.querySelectorAll("button").forEach(node => {
      if (node.ariaLabel === 'See more, click to view the full content.') {
        console.log(node)
        node.click()
      }
    })
    const links = document.querySelectorAll('p');
    let linkList = ''
    links.forEach((link) => {
      const listItem = document.createElement('li');
      listItem.textContent = link.textContent;
      linkList = linkList + (listItem.textContent);
    });
    linkList = linkList.replace(/\s+/g,' ');
    
    //store content into airtable
    try {
      const myHeaders = new Headers();
      myHeaders.append("Authorization", "Bearer keyUZKA03iFrtK1Ol");
      myHeaders.append("Content-Type", "application/json");
      const content = linkList;
      const raw = JSON.stringify({
        "records": [
          {
            "fields": {
              content
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
      const result = await fetch(url, requestOptions)
      if (result.status === 200) {
        alert('success');
      }  else {
        alert('failed');
      }
    } catch (err) {
      alert(err.message || err);
    }
  }