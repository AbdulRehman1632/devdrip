// src/context/LeaveContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../../../firebase';


const LeaveContext = createContext();
export const useLeaveContext = () => useContext(LeaveContext);

export const LeaveProvider = ({ children }) => {
  const [leaveCount, setLeaveCount] = useState(0);

  useEffect(() => {
    const db = getFirestore(app);
    const unsub = onSnapshot(collection(db, 'leaves'), snapshot => {
      const pending = snapshot.docs.filter(doc => doc.data().status === 'pending').length;
      setLeaveCount(pending);
    });

    return () => unsub();
  }, []);

  return (
    <LeaveContext.Provider value={{ leaveCount }}>
      {children}
    </LeaveContext.Provider>
  );
};
