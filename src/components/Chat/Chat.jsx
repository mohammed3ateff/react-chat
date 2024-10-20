import { useEffect, useRef, useState } from "react";
import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../library/firebase";
import { useChatStore } from "../../library/chatStore";
import { useUserStore } from "../../library/userStore";
import upload from "../../library/upload";
import avatar from "../../assets/images/avatar.jpg";
import phone from "../../assets/images/phone.jpg";
import video from "../../assets/images/video.jpg";
import info from "../../assets/images/info.jpg";
import camera from "../../assets/images/camera.jpg";
import mic from "../../assets/images/mic.jpg";
import emoji from "../../assets/images/emoji.jpg";
import image from "../../assets/images/img.jpg";
import { format } from "timeago.js";
import BlockUser from "../BlockUser";

export default function Chat() {
  const [chat, setChat] = useState({ messages: [] });
  const [openEmoji, setOpenEmoji] = useState(false);
  const [textMessage, setTextMessage] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });

  const { currentUser } = useUserStore();
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const [showBlockUser, setShowBlockUser] = useState(false);

  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat.messages.length]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat({ messages: res.data().messages || [] });
    });
    return () => {
      unSub();
    };
  }, [chatId]);

  const handleEmoji = (e) => {
    setTextMessage((text) => text + e.emoji);
    setOpenEmoji(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleSend = async () => {
    if (textMessage === "" && !img.url) return;

    if (isCurrentUserBlocked) {
      console.log("You are blocked and cannot send messages.");
      return;
    }

    let imgUrl = null;
    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }

      const newMessage = {
        senderId: currentUser.id,
        textMessage,
        createdAt: new Date(),
        ...(imgUrl && { img: imgUrl }),
      };

      if (!isReceiverBlocked) {
        await updateDoc(doc(db, "chats", chatId), {
          messages: arrayUnion(newMessage),
        });
      }

      const userIDs = [currentUser.id, user.id];
      userIDs.forEach(async (id) => {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          userChatsData.chats[chatIndex].lastMessage = textMessage;
          userChatsData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatsData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      });
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setImg({ file: null, url: "" });
      setTextMessage("");
    }
  };

  return (
    <div className="flex-1  border-x border-x-[#dddddd35] h-full flex flex-col w-full">
      <div className="p-5 flex items-center justify-between border-b border-b-[#dddddd35]">
        <div className="flex items-center gap-5">
          <img
            src={user?.avatar || avatar}
            alt="avatar"
            className="w-[60px] h-[60px] rounded-full object-cover"
          />
          <div className="flex flex-col ">
            <span className="text-xl font-bold">{user?.username}</span>
            <p className="text-sm font-light text-[#a5a5a5]">
              {user?.status || "Online"}
            </p>
          </div>
        </div>
        <div className="flex gap-5 items-center">
          <img src={phone} alt="phone" className="w-5 h-5 cursor-pointer" />
          <img src={video} alt="video" className="w-5 h-5 cursor-pointer" />
          {/* <img src={info} alt="info" className="w-5 h-5 cursor-pointer" /> */}
          <BlockUser />
        </div>
      </div>

      <div className="p-5 flex-1 overflow-auto flex flex-col gap-5">
        {chat.messages.map((message, index) => (
          <div
            key={index}
            className={`text-wrap  overflow-wrap break-word ${
              message.senderId === currentUser.id
                ? "self-end max-w-[70%] flex gap-5"
                : "self-start max-w-[70%] flex gap-5"
            }`}
          >
            {message.senderId !== currentUser?.id ? (
              <>
                <img
                  src={user?.avatar || avatar}
                  alt="avatar"
                  className="w-[30px] h-[30px] rounded-full object-cover"
                />
                <div className="flex-1 flex flex-col gap-[5px]">
                  <p className=" p-5 bg-[rgba(17,25,40,0.3)] rounded-[10px]">
                    {message.textMessage}
                  </p>
                  <span className="text-[13px]">
                    {format(new Date(message.createdAt.seconds * 1000))}
                  </span>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col gap-[5px]">
                {message.img && (
                  <img
                    src={user?.avatar}
                    alt="Uploaded image"
                    className="rounded-[10px] max-w-[100%]"
                  />
                )}
                <p className=" bg-[#5183fe] p-5 rounded-[10px] ">
                  {message.textMessage}
                </p>
                <span className="text-[13px]">
                  {format(new Date(message.createdAt.seconds * 1000))}
                </span>
              </div>
            )}
          </div>
        ))}
        <div ref={endRef}></div>
      </div>

      <div className="p-5 mt-auto flex justify-center flex-col gap-2 border-t border-t-[#dddddd35] md:flex-row md:gap-5">
        <div className="flex gap-5 items-center">
          <div className="relative ">
            <img
              src={emoji}
              alt="emoji"
              className="w-5 h-5 cursor-pointer"
              onClick={() => setOpenEmoji((open) => !open)}
            />
            {openEmoji && (
              <div className="absolute left-0 bottom-[50px]">
                <EmojiPicker onEmojiClick={handleEmoji} />
              </div>
            )}
          </div>
          <label htmlFor="file">
            <img src={image} alt="img" className="w-5 h-5 cursor-pointer" />
          </label>
          <input
            type="file"
            name="file"
            id="file"
            className="hidden"
            onChange={handleImg}
          />
          <img src={mic} alt="mic" className="w-5 h-5 cursor-pointer" />
        </div>

        <input
          type="text"
          placeholder={
            isCurrentUserBlocked || isReceiverBlocked
              ? "You cannot send a message"
              : "Type a message..."
          }
          className="flex-1 bg-[rgba(17,25,40,0.5)] border-0 outline-0 p-3 rounded-[10px] text-base disabled:cursor-not-allowed"
          value={textMessage}
          onChange={(e) => setTextMessage(e.target.value)}
          disabled={isCurrentUserBlocked || isReceiverBlocked}
        />

        <button
          disabled={isCurrentUserBlocked || isReceiverBlocked}
          onClick={handleSend}
          className="bg-[#5183fe] w-full md:w-auto px-5 py-2.5 border-0 rounded-[5px] cursor-pointer duration-[0.3s] hover:bg-[#0653b7] disabled:bg-[#5182feb4] disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}
