import { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function useBookmarks() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setBookmarkedIds([]);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const bookmarks = Array.isArray(userSnap.data()?.bookmarkedEvents)
          ? userSnap.data()?.bookmarkedEvents
          : [];
        setBookmarkedIds(bookmarks);
      } else {
        setBookmarkedIds([]);
      }
    });

    return () => unsubscribe(); // Dọn dẹp listener khi unmount
  }, []);

  const toggleBookmark = async (activityId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) return;

    const bookmarks = Array.isArray(userSnap.data()?.bookmarkedEvents)
      ? userSnap.data()?.bookmarkedEvents
      : [];

    let updatedBookmarks;
    if (bookmarks.includes(activityId)) {
      updatedBookmarks = bookmarks.filter((id: string) => id !== activityId);
    } else {
      updatedBookmarks = [...bookmarks, activityId];
    }

    await updateDoc(userRef, { bookmarkedEvents: updatedBookmarks });
    setBookmarkedIds(updatedBookmarks);
  };

  return { bookmarkedIds, toggleBookmark };
}
