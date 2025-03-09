console.log('Hello from content script!');

// Add focus event listener to document
document.addEventListener('focusin', (event) => {
    const target = event.target as HTMLElement;
    console.log('Focused element:', {
        element: target,
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        tabIndex: target.tabIndex,
        href: target instanceof HTMLAnchorElement ? target.href : undefined
    });
});

// Add click event listener to document
document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    console.log('Clicked element:', {
        element: target,
        tagName: target.tagName,
        className: target.className,
        id: target.id
    });
});

let jobsElement = document.getElementById("mosaic-provider-jobcards");

if (jobsElement) {
    const jobListItems = jobsElement.querySelectorAll('li');
    const filteredJobs = Array.from(jobListItems)
        .filter(item => item.querySelector('div.result') !== null);
        
    console.log('Job listings with result div:', filteredJobs);

    // get and focus the link from the first job listing
    const firstJob = filteredJobs[3];
    const jobLink = firstJob.querySelector('a');
    if (jobLink) {
        jobLink.focus();
        console.log('Focused job link:', jobLink);
    }
}

console.log(jobsElement);