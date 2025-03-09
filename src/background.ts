// Listen for sign-in status from content script and store it
chrome.runtime.onMessage.addListener((
    message: { type: string; requiresSignIn: boolean },
    sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: any) => void
) => {
    if (message.type === 'SIGN_IN_STATUS' && sender.tab?.id) {
        // Store the sign-in status with the tab ID
        chrome.storage.local.set({
            [`signInStatus_${sender.tab.id}`]: message.requiresSignIn
        });
    }
    return false; // Required to indicate we're not using sendResponse
});

// Clean up storage when a tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
    chrome.storage.local.remove(`signInStatus_${tabId}`);
});
