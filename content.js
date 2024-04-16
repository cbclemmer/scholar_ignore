// Function to add a paper to the list
function addPaperToList(url, el) {
  browser.storage.local.get(['currentProject', 'projectPapers']).then((result) => {
    const currentProject = result.currentProject;
    const projectPapers = result.projectPapers || {};
    if (currentProject) {
      if (!projectPapers[currentProject]) {
        projectPapers[currentProject] = [];
      }
      if (!projectPapers[currentProject].includes(url)) {
        projectPapers[currentProject].push(url);
        browser.storage.local.set({ projectPapers: projectPapers });
      }
      el.remove();
    } else {
      alert('No project selected')
    }
  });
}

// Function to hide search results that match the saved URLs
function hideMatchingResults() {
  browser.storage.local.get(['currentProject', 'projectPapers']).then((result) => {
    const currentProject = result.currentProject;
    const projectPapers = result.projectPapers || {};
    const papers = projectPapers[currentProject] || [];
    let searchResults = document.querySelectorAll('.gs_r');
    searchResults.forEach((result) => {
      const a = result.querySelector('.gs_rt a')
      if (a == null) {
        return
      }
      let url = a.attributes.href.nodeValue
      if (url.indexOf('?') !== -1) {
        url = url.split('?')[0]
      }
      if (papers.includes(url)) {
        result.style.display = 'none';
      }
    });
  });
}

// Add a button to each search result
function addButtons() {
  let searchResults = document.querySelectorAll('.gs_r');
  searchResults.forEach((result) => {
    let button = document.createElement('button');
    button.textContent = 'Add to List';
    button.addEventListener('click', () => {
      let url = result.querySelector('.gs_rt a').href;
      addPaperToList(url, result);
    });
    result.appendChild(button);
  });
}

setTimeout(() => {
  console.log('Starting Scholar Ignore')
  addButtons();
  hideMatchingResults();
}, 1000)