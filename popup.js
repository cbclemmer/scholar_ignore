document.addEventListener('DOMContentLoaded', () => {
  const currentProjectElement = document.getElementById('current-project');
  const projectList = document.getElementById('project-list');
  const newProjectInput = document.getElementById('new-project');
  const addProjectButton = document.getElementById('add-project');
  const paperListContainer = document.getElementById('paper-list-container');
  const paperList = document.getElementById('paper-list');

  // Function to render the paper list for the selected project
  function renderPaperList(projectName) {
    paperList.innerHTML = '';
    browser.storage.local.get('projectPapers').then((result) => {
      const projectPapers = result.projectPapers || {};
      const papers = projectPapers[projectName] || [];
      papers.sort((a, b) => new Date(a.date) < new Date(b.date));

      if (papers.length > 0) {
        papers.forEach((paper) => {
          const li = document.createElement('li');
          const paperTitle = document.createElement('span');
          paperTitle.textContent = paper.title;

          const dateText = document.createElement('span')
          dateText.textContent = "Date Added: " + (new Date(paper.date)).toISOString()

          const removeButton = document.createElement('button');
          removeButton.textContent = 'Remove';
          removeButton.addEventListener('click', () => {
            removePaperFromList(projectName, paper.url);
          });

          li.appendChild(paperTitle);
          li.appendChild(document.createElement('br'))
          li.appendChild(dateText)
          li.appendChild(document.createElement('br'))
          li.appendChild(removeButton);
          paperList.appendChild(li);
        });
        paperListContainer.style.display = 'block';
      } else {
        paperListContainer.style.display = 'none';
      }
    });
  }

  // Function to remove a paper from the ignore list
  function removePaperFromList(projectName, paperURL) {
    browser.storage.local.get('projectPapers').then((result) => {
      const projectPapers = result.projectPapers || {};
      if (projectPapers[projectName]) {
        const paperIndex = projectPapers[projectName].findIndex(paper => paper.url === paperURL);
        if (paperIndex > -1) {
          projectPapers[projectName].splice(paperIndex, 1);
          browser.storage.local.set({ projectPapers: projectPapers }).then(() => {
            renderPaperList(projectName);
          });
        }
      }
    });
  }

  // Function to render the project list
  function renderProjects() {
    projectList.innerHTML = '';
    browser.storage.local.get(['projects', 'currentProject']).then((result) => {
      const projects = result.projects || [];
      const currentProject = result.currentProject;

      // Update the current project display
      if (currentProject) {
        currentProjectElement.textContent = `Current project: ${currentProject}`;
        renderPaperList(currentProject)
      } else {
        currentProjectElement.textContent = 'No project selected';
        paperListContainer.style.display = 'none'
      }

      document.querySelectorAll('li').forEach((line) => {
        line.remove();
      });

      projects.forEach((project) => {
        const li = document.createElement('li');
        li.textContent = project;

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
          removeProject(project);
        });

        
        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select';
        selectButton.addEventListener('click', () => {
          browser.storage.local.get(['currentProject']).then(({ currentProject }) => {
            if (currentProject == project) {
              return
            }
            browser.storage.local.set({ currentProject: project }).then(() => {
              renderProjects(); // Refresh the project list and current project display
            })
          })
        })
        
        li.appendChild(document.createElement('br'))
        li.appendChild(selectButton)
        li.appendChild(removeButton)

        projectList.appendChild(li)
      });
    });
  }

  // Function to add a new project
  function addProject() {
    const projectName = newProjectInput.value.trim();
    if (projectName) {
      browser.storage.local.get('projects').then((result) => {
        const projects = result.projects || [];
        if (!projects.includes(projectName)) {
          projects.push(projectName);
          browser.storage.local.set({ projects: projects }).then(() => {
            renderProjects();
            newProjectInput.value = '';
          });
        }
      });
    }
  }

  // Function to remove a project
  function removeProject(project) {
    if (!window.confirm(`Are you sure you want to remove the project "${project}"?`)) {
      return
    }

    browser.storage.local.get(['projects', 'currentProject', 'projectPapers']).then((result) => {
      const projects = result.projects || [];
      let currentProject = result.currentProject;
      const projectPapers = result.projectPapers || {};

      const index = projects.indexOf(project);
      if (index == -1) {
        return
      }

      projects.splice(index, 1);
      delete projectPapers[project];
      if (project == currentProject) {
        currentProject = undefined
      }

      browser.storage.local.set({ projects: projects, projectPapers: projectPapers, currentProject: currentProject }).then(() => {
        renderProjects();
      });
    });
  }

  // Event listener for the "Add Project" button
  addProjectButton.addEventListener('click', addProject);

  // Render the project list when the popup is opened
  renderProjects();
});