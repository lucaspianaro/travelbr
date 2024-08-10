import React, { createContext, useContext, useState } from 'react';

// Cria um contexto para o estado do Drawer (menu lateral)
const DrawerContext = createContext();

// Hook personalizado para utilizar o contexto do Drawer
export const useDrawer = () => useContext(DrawerContext);

// Provedor de contexto do Drawer, que envolve os componentes filhos e fornece o estado e funções do Drawer
export const DrawerProvider = ({ children }) => {
  // Estado que indica se o Drawer está aberto ou fechado
  const [openDrawer, setOpenDrawer] = useState(false);

  // Função para alternar o estado do Drawer (abre se estiver fechado e fecha se estiver aberto)
  const toggleDrawer = () => {
    setOpenDrawer((prevOpen) => !prevOpen);
  };

  // Função para fechar o Drawer
  const closeDrawer = () => {
    setOpenDrawer(false);
  };

  // Valor fornecido pelo contexto, incluindo o estado atual do Drawer e as funções para manipulá-lo
  const value = {
    openDrawer,
    toggleDrawer,
    closeDrawer,
  };

  // Provedor de contexto que envolve os componentes filhos
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
};
