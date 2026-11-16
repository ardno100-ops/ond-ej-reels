import React from 'react';

/** When true, shared FX render in the calm monochrome style (no shake/flash, blur-fade text, wide tracking). */
export const MonoCtx = React.createContext(false);
export const useMono = () => React.useContext(MonoCtx);
