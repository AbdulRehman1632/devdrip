// src/context/TicketContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirestore, collectionGroup, onSnapshot } from 'firebase/firestore';
import { app } from '../../../firebase';
// import { app } from '../firebase';

const TicketContext = createContext();
export const useTicketContext = () => useContext(TicketContext);

export const TicketProvider = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(app);
    const unsub = onSnapshot(collectionGroup(db, 'Tickets'), snapshot => {
      const all = snapshot.docs.map(doc => doc.data());
      const pending = all.filter(t => t.status === 'pending').length;
      setPendingCount(pending);
    });

    return () => unsub(); // cleanup
  }, []);

  return (
    <TicketContext.Provider value={{ pendingCount }}>
      {children}
    </TicketContext.Provider>
  );
};
