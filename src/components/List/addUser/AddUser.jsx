import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../library/firebase";
import { useState } from "react";
import { useUserStore } from "../../../library/userStore";
import avatar from "../../../assets/images/avatar.jpg";

export default function AddUser() {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapShot = await getDocs(q);

      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      } else {
        setUser(null);
        console.log("User not found.");
      }
    } catch (err) {
      console.error("Error searching for user:", err);
    }
  };

  const handleAddUser = async () => {
    if (!user) return;

    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");

    try {
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (err) {
      console.error("Error adding user to chat:", err);
    }
  };

  return (
    <div className="w-max	h-max	p-[30px] bg-[rgba(17,25,40,0.781)] rounded-[10px] absolute top-0 left-0 bottom-0 right-0 m-auto">
      <form onSubmit={handleSearch} className="flex gap-5">
        <input
          type="text"
          placeholder="Username"
          name="username"
          className="p-5 rounded-[10px] border-0 outline-0 text-black"
        />
        <button className="p-5 bg-[#1a73e8] rounded-[10px] cursor-pointer">
          Search
        </button>
      </form>
      {user && (
        <div className="mt-[50px] flex items-center justify-between">
          <div className="flex items-center gap-5">
            <img
              src={user.avatar || avatar}
              alt="avatar"
              className="w-[50px] h-[50px] rounded-full object-cover"
            />
            <span>{user.username}</span>
          </div>
          <button
            onClick={handleAddUser}
            className="p-[10px] bg-[#1a73e8] rounded-[10px] cursor-pointer"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  );
}
