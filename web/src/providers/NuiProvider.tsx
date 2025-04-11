import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface NuiContextProps {
  isEnvBrowser: boolean;
  sendNuiMessage: (action: string, data?: any) => void;
}

const NuiContext = createContext<NuiContextProps>({
  isEnvBrowser: false,
  sendNuiMessage: () => {},
});

interface NuiProviderProps {
  children: ReactNode;
}

export const NuiProvider = ({ children }: NuiProviderProps) => {
  const [isEnvBrowser, setIsEnvBrowser] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsEnvBrowser(true);
    }
  }, []);

  const sendNuiMessage = (action: string, data: any = {}) => {
    if (isEnvBrowser) {
      console.log('NUI Message:', { action, ...data });
      return;
    }

    fetch(`https://vein-minigames/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(data),
    }).catch(error => console.error('Error sending NUI message:', error));
  };

  return (
    <NuiContext.Provider value={{ isEnvBrowser, sendNuiMessage }}>
      {children}
    </NuiContext.Provider>
  );
};

export const useNui = () => useContext(NuiContext);
