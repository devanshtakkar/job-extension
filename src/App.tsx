import { useEffect, useState } from 'react';

export default function App() {
    const [currentUrl, setCurrentUrl] = useState<string>('');
    const [requiresSignIn, setRequiresSignIn] = useState(false);

    useEffect(() => {
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
                    <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Start Application
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
