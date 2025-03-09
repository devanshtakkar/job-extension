import { useEffect, useState } from 'react';

export default function App() {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [requiresSignIn, setRequiresSignIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Listen for script completion from background script
    useEffect(() => {
        const handleMessage = (
            message: any,
            _sender: chrome.runtime.MessageSender,
            _sendResponse: () => void
        ) => {
            if (message.type === 'SCRIPT_COMPLETE') {
                setIsLoading(false);
                // Clear the completion status
                chrome.storage.local.remove('scriptComplete');
            }
            return false; // Required to indicate we're not using sendResponse
        };
        
        chrome.runtime.onMessage.addListener(handleMessage);
        return () => chrome.runtime.onMessage.removeListener(handleMessage);
    }, []);

    useEffect(() => {
        // Check if script is already complete when popup opens
        chrome.storage.local.get('scriptComplete', (result) => {
            if (result.scriptComplete) {
                setIsLoading(false);
                chrome.storage.local.remove('scriptComplete');
            }
        });

        // Get current tab info when component mounts
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            const tab = tabs[0];
            const url = tab?.url ?? '';
            setCurrentUrl(url);

            // Check sign-in status for current tab from storage
            if (tab?.id) {
                const result = await chrome.storage.local.get(`signInStatus_${tab.id}`);
                const requiresSignIn = result[`signInStatus_${tab.id}`];
                setRequiresSignIn(!!requiresSignIn);
            }
        });
    }, []);

    const isIndeedPage = currentUrl.includes('indeed.com');

    if (requiresSignIn) {
        return (
            <div className="p-6 min-w-[300px]">
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Please Sign In
                    </h1>
                    <p className="text-gray-600 text-center">
                        You need to sign in to Indeed to use this extension.
                        If you are already signed in, please try reloading the page.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 min-w-[300px]">
            {isIndeedPage ? (
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Ready to apply?
                    </h1>
                    <button 
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        onClick={async () => {
                            setIsLoading(true);
                            const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
                            const tab = tabs[0];
                            if (tab.id) {
                                chrome.tabs.sendMessage(tab.id, { type: 'START_SCRIPT' });
                            }
                        }}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </div>
                        ) : (
                            'Start Application'
                        )}
                    </button>
                </div>
            ) : (
                <div className="flex flex-col items-center gap-4">
                    <h1 className="text-xl font-semibold text-gray-800">
                        Please navigate to Indeed.com
                    </h1>
                    <p className="text-gray-600 text-center">
                        This extension only works on Indeed job listings
                    </p>
                </div>
            )}
        </div>
    );
}
