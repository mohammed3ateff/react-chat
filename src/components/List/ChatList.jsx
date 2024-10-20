import { useEffect, useState } from "react";
import AddUser from "./addUser/AddUser";
import { useUserStore } from "../../library/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../library/firebase";
import { useChatStore } from "../../library/chatStore";
import minus from "../../assets/images/minus.jpg";
import plus from "../../assets/images/plus.jpg";
import avatar from "../../assets/images/avatar.jpg";
import search from "../../assets/images/search.jpg";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();

          return { ...item, user };
        });
        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log("Error updating chat:", err);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-auto">
      <div className="flex items-center gap-5 p-5">
        <div className="flex-1 bg-[rgba(17,25,40,0.5)] flex items-center gap-5 rounded-xl p-2.5">
          <img src={search} alt="search" className="w-5 h-5" />
          <input
            type="text"
            placeholder="Search"
            className="bg-transparent outline-0 border-0 flex-1"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? minus : plus}
          alt=""
          className="w-9 h-9 bg-[rgba(17,25,40,0.5)] p-2.5 rounded-md cursor-pointer"
          onClick={() => setAddMode((open) => !open)}
        />
      </div>
      {filteredChats.map((chat) => (
        <div
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          className="flex items-center gap-5 p-5 cursor-pointer border-b border-b-[#dddddd35]"
          style={{ backgroundColor: chat?.isSeen ? "transparent" : "#5183fe" }}
        >
          <img
            src={
              chat.user?.blocked?.includes(currentUser.id)
                ? avatar
                : chat.user?.avatar || avatar
            }
            alt="User Avatar"
            className="w-[50px] h-[50px] rounded-full object-cover"
          />

          <div className="flex flex-col gap-[10px]">
            <span className="font-medium">
              {chat.user?.blocked?.includes(currentUser.id)
                ? "User"
                : chat.user?.username || "Unknown User"}
            </span>
            <p className="max-w-36 text-nowrap overflow-hidden text-ellipsis text-sm font-light">
              {chat.lastMessage}
            </p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
}
