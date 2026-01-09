
import BackButton from "../components/BackButton.jsx";
import InstallPWA from "../components/InstallPWA.jsx";
import OfflineIndicator from "../components/OfflineIndicator.jsx";
import ErrorBoundary from "../components/ErrorBoundary.jsx";
import { ErrorProvider } from "../context/ErrorContext.jsx";
import Toaster from 'react-hot-toast'

export const AppProviders = ({ children }) => {



    return (
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
    );
};
