import initPythiaModules from '@virgilsecurity/core-pythia';

import { setPythiaModules } from './pythiaModules';

export const initPythia = async () => {
  const pythiaModules = await initPythiaModules();
  setPythiaModules(pythiaModules);
};
