const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.markAbsentUsers = functions.pubsub.schedule('59 23 * * *') // har din raat 11:59 baje
  .timeZone('Asia/Karachi') // apni timezone set karo
  .onRun(async (context) => {
    const now = new Date();
    const todayDate = now.toISOString().slice(0, 10); // "YYYY-MM-DD"

    // Sab users lo
    const usersSnapshot = await db.collection('allUsers').get();

    for (const userDoc of usersSnapshot.docs) {
      const username = userDoc.id;
      const attendanceRef = db.collection('allUsers').doc(username).collection('attendance');

      // Attendance check karo ke login hua ya nahi
      const attendanceQuery = attendanceRef.where('date', '==', todayDate);
      const attendanceSnapshot = await attendanceQuery.get();

      if (attendanceSnapshot.empty) {
        // Agar attendance nahi mili to check karo leave apply kiya ya nahi
        const leaveRef = db.collection('leaves');
        const leaveQuery = leaveRef.where('userName', '==', username)
                                   .where('status', '==', 'approved') // agar aap approved leaves check karna chahte hain
                                   .where('fromDate', '<=', todayDate)
                                   .where('toDate', '>=', todayDate);
        const leaveSnapshot = await leaveQuery.get();

        if (leaveSnapshot.empty) {
          // Leave nahi hai, to absent mark karo
          await attendanceRef.add({
            date: todayDate,
            present: false,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
          });
          console.log(`Marked absent: ${username}`);
        } else {
          console.log(`Leave applied: ${username} on ${todayDate}`);
        }
      } else {
        console.log(`Already marked present: ${username}`);
      }
    }
    return null;
  });
