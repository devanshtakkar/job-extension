import { useEffect, useState } from 'react';

export default function App() {
    const [currentUrl, setCurrentUrl] = useState<string>('');

    useEffect(() => {
        // Get current tab URL when component mounts
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs: chrome.tabs.Tab[]) => {
            const url = tabs[0]?.url ?? '';
            setCurrentUrl(url);
        });
    }, []);

    const isIndeedPage = currentUrl.includes('indeed.com');

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
