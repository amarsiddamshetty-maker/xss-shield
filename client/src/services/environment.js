import { createContext, useContext } from 'react';

export const EnvironmentContext = createContext({ publicDemo: false, eventLimit: null });
export const useEnvironment = () => useContext(EnvironmentContext);
