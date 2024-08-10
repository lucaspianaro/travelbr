import { auth, db } from '../../firebaseConfig';
import { updateEmail, updateProfile as firebaseUpdateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';

export const updateProfile = async ({ displayName, email }) => {
  const user = auth.currentUser;

  if (!user) throw new Error('Usuário não está autenticado.');

  const userDocRef = doc(db, 'usuarios', user.uid);

  await firebaseUpdateProfile(user, { displayName });
  if (email !== user.email) {
    await updateEmail(user, email);
  }
  await updateDoc(userDocRef, { displayName, email });
};
