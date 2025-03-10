console.log('Hello from content script!');

// Function to process job listings
const processJobListings = async () => {
    const jobsElement = document.getElementById("mosaic-provider-jobcards");
    if (!jobsElement) {
        console.log('No job listings found');
        return;
    }

    const jobListItems = jobsElement.querySelectorAll('li');
    // Only process Indeed Easy Apply jobs (jobs that have the Indeed Apply button)
    const filteredJobs = Array.from(jobListItems)
        .filter(item => 
            item.querySelector('div.result') !== null && 
            item.querySelector('span[data-testid="indeedApply"]') !== null
        );
    
    console.log(`Found ${filteredJobs.length} Easy Apply job listings`);

    // Function to wait for network and DOM to be idle
    const waitForNetworkIdle = () => new Promise<void>(resolve => {
        let timeout: NodeJS.Timeout;
        let mutationCount = 0;
        
        // Create mutation observer to track DOM changes
        const observer = new MutationObserver(() => {
            mutationCount++;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                // If no mutations for 1 second, consider network idle
                if (mutationCount > 0) {
                    console.log(`Network appears idle after ${mutationCount} mutations`);
                    observer.disconnect();
                    resolve();
                }
            }, 1000);
        });

        // Start observing DOM changes
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });

        // Also set a maximum wait time of 5 seconds
        setTimeout(() => {
            observer.disconnect();
            console.log('Maximum wait time reached');
            resolve();
        }, 5000);
    });

    // Test with single element (first Easy Apply job)
    const jobLink = filteredJobs[0]?.querySelector('a') as HTMLElement;
    if (jobLink) {
        // Get element's position
        const rect = jobLink.getBoundingClientRect();
        // Create click event at the right edge of the anchor (where ::after usually is)
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true,
            clientX: rect.right - 5, // 5px from right edge
            clientY: rect.top + (rect.height / 2) // Vertically centered
        });
        jobLink.dispatchEvent(clickEvent);
        console.log('Clicking job link pseudo-element:', jobLink);
        
        // Wait for network to be idle
        console.log('Waiting for network to be idle...');
        await waitForNetworkIdle();
        console.log('Network is now idle');
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
    const xpath = `//*[not(self::script) and contains(translate(text(),'ABCDEFGHIJKLMNOPQRSTUVWXYZ','abcdefghijklmnopqrstuvwxyz'),'${searchText.toLowerCase()}')]`;
    const elements = document.evaluate(xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    
    console.log('XPath query:', xpath);
    console.log('Number of matching elements:', elements.snapshotLength);
    
    // Log details of each matching element
    for (let i = 0; i < elements.snapshotLength; i++) {
        const element = elements.snapshotItem(i) as Element;
        console.log('Matching element', i + 1, ':', {
            tagName: element.tagName,
            textContent: element.textContent?.trim(),
            innerHTML: element.innerHTML,
            attributes: Array.from(element.attributes).map(attr => ({
                name: attr.name,
                value: attr.value
            }))
        });
    }
    
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
