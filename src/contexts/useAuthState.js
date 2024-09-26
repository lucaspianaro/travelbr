import React, { useEffect, useState, useContext, createContext } from 'react';
import { auth, db } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Verifica se o e-mail foi verificado
        if (user.emailVerified) {
          // Busca o documento do usuário no Firestore para verificar o campo isApproved
          const userDocRef = doc(db, 'usuarios', user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            setCurrentUser({ ...user, isApproved: userData.isApproved }); // Adiciona isApproved ao currentUser
          } else {
            console.log('Usuário não encontrado no banco de dados.');
            setCurrentUser(null);
          }
        } else {
          await signOut(auth); // Desloga se o email não for verificado
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
