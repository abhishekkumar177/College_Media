import React, { ReactNode } from "react";
import BackButton from "../components/BackButton";
import InstallPWA from "../components/InstallPWA";
import OfflineIndicator from "../components/OfflineIndicator";
import ErrorBoundary from "../components/ErrorBoundary";
import { ErrorProvider } from "../context/ErrorContext";
import { SettingsProvider } from "../context/SettingsContext";
import { ThemeProvider } from "../context/ThemeContext";
import { PermissionProvider } from "../context/PermissionContext";
import { Toaster } from 'react-hot-toast';

interface AppProvidersProps {
    children: ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
    return (
        <div style={{ margin: 0, padding: 0, width: '100%', overflow: 'hidden' }}>
            <SettingsProvider>
                <ThemeProvider>
                    <ErrorProvider>
                        <PermissionProvider>
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
                        </PermissionProvider>
                    </ErrorProvider>
                </ThemeProvider>
            </SettingsProvider>
        </div>
    );
};
