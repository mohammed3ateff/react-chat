// BlockUserButton.jsx
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../library/chatStore";
import { auth, db } from "../library/firebase";
import { useUserStore } from "../library/userStore";

const BlockUser = () => {
  const { user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } =
    useChatStore();
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

  return (
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
  );
};

export default BlockUser;
