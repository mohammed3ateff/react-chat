import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../library/chatStore";
import { auth, db } from "../../library/firebase";
import { useUserStore } from "../../library/userStore";

import arrowUp from "../../assets/images/arrowUp.jpg";
import arrowDown from "../../assets/images/arrowDown.jpg";
import mo from "../../assets/images/mo.jpg";
import download from "../../assets/images/download.jpg";

export default function Detail() {
  const {
    chatId,
    user,
    isCurrentUserBlocked,
    isReceiverBlocked,
    changeBlock,
    resetChat,
  } = useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
    } catch (err) {
      console.error("Error blocking user:", err);
    }
  };
  const handleLogout = () => {
    auth.signOut();
    resetChat();
  };

  return (
    <div className="flex-1  hidden lg:block">
      <div className="px-5 py-[30px] flex flex-col items-center gap-[15px] border-b border-b-[#dddddd35]">
        <img
          src={user?.avatar || "../../../public/avatar.jpg"}
          alt="avatar"
          className="w-[100px] h-[100px] rounded-full object-cover"
        />
        <h2>{user?.username}</h2>
        <p>Frontend Developer</p>
      </div>
      <div className="p-5 flex flex-col gap-2.5 ">
        <div>
          <div className="flex items-center justify-between">
            <span>Chat Settings</span>
            <img
              src={arrowUp}
              alt="setting"
              className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.4)] p-2.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span>Privacy & Help</span>
            <img
              src={arrowUp}
              alt="setting"
              className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.4)] p-2.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span>Shared photos</span>
            <img
              src={arrowDown}
              alt="setting"
              className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.4)] p-2.5 rounded-full cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-5 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-5">
                <img
                  src={mo}
                  alt="mo"
                  className="w-[40px] h-[40px] rounded-[5px] object-cover"
                />
                <span className="text-sm text-[lightgray] font-light">
                  Mohammed.jpg
                </span>
              </div>
              <img
                src={download}
                alt="download"
                className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.4)] p-2.5 rounded-full cursor-pointer"
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <span>Shared Files</span>
            <img
              src={arrowUp}
              alt="setting"
              className="w-[30px] h-[30px] bg-[rgba(17,25,40,0.4)] p-2.5 rounded-full cursor-pointer"
            />
          </div>
        </div>
        <button
          onClick={handleBlock}
          className="p-[15px] bg-[rgba(230,74,105,0.55)] text-white border-0 rounded-[5px] cursor-pointer duration-[0.3s] hover:bg-[rgba(220,20,60,0.796)]"
        >
          {isCurrentUserBlocked
            ? "You are Blocked"
            : isReceiverBlocked
            ? "User Blocked"
            : "Block User"}
        </button>
        <button
          onClick={handleLogout}
          className="p-2.5 bg-[#1a73e8] text-white border-0 rounded-[5px] cursor-pointer duration-[0.3s] hover:bg-[#0653b7]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
