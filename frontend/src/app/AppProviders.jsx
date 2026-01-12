
import BackButton from "../components/BackButton.jsx";
import InstallPWA from "../components/InstallPWA.jsx";
import OfflineIndicator from "../components/OfflineIndicator.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import { ErrorProvider } from "../context/ErrorContext.jsx";
import { SettingsProvider } from "../context/SettingsContext.jsx";
import Toaster from 'react-hot-toast'

export const AppProviders = ({ children }) => {
    return (
        <div style={{ margin: 0, padding: 0, width: '100%', overflow: 'hidden' }}>
            <SettingsProvider>
                <ErrorProvider>
                    <ErrorBoundary>
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 4000,
                                style: { background: "#363636", color: "#fff" },
                                success: {
                                    duration: 3000,
                                    iconTheme: { primary: "#10B981", secondary: "#fff" },
                                },
                                error: {
                                    duration: 4000,
                                    iconTheme: { primary: "#EF4444", secondary: "#fff" },
                                },
                            }}
                        />
                        <BackButton />

                        {children}

                        <InstallPWA />
                        <OfflineIndicator />
                    </ErrorBoundary>
                </ErrorProvider>
            </SettingsProvider>
        </div>
    );
};
