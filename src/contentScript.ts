console.log('Hello from content script!');

// Function to process job listings
const processJobListings = async () => {
    const jobsElement = document.getElementById("mosaic-provider-jobcards");
    if (!jobsElement) {
        console.log('No job listings found');
        return;
    }

    const jobListItems = jobsElement.querySelectorAll('li');
    const filteredJobs = Array.from(jobListItems)
        .filter(item => item.querySelector('div.result') !== null);
    
    console.log(`Found ${filteredJobs.length} job listings`);

    for (const job of filteredJobs) {
        const jobLink = job.querySelector('a');
        if (jobLink) {
            jobLink.focus();
            console.log('Focusing job link:', jobLink);
            // Small delay to ensure proper focus handling
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    // Notify background script that processing is complete
    chrome.runtime.sendMessage({ type: 'SCRIPT_COMPLETE' });
};

// Add focus event listener to document for debugging
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

// Find elements containing "sign in" text and return true if any are found
const findElementsWithText = (searchText: string): boolean => {
    const xpath = `//*[contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'${searchText.toLowerCase()}')]`;
    const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    return elements.snapshotLength > 0;
};

// Check if user needs to sign in and send message to background script
const isSignInRequired = findElementsWithText('sign in');
chrome.runtime.sendMessage({ type: 'SIGN_IN_STATUS', requiresSignIn: isSignInRequired });

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
    if (message.type === 'START_SCRIPT') {
        processJobListings();
    }
    return false; // Required to indicate we're not using sendResponse
});

// Add click event listener to document for debugging
document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    console.log('Clicked element:', {
        element: target,
        tagName: target.tagName,
        className: target.className,
        id: target.id
    });
});
