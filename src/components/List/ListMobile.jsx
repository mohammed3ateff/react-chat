import List from "./components/List/List";
import Chat from "./components/Chat/Chat";
import Detail from "./components/Detail/Detail";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./library/firebase";
import { useUserStore } from "./library/userStore";
import { useChatStore } from "./library/chatStore";

export default function MobileList() {
  const user = false;

  const { fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  return (
    <div className="relative">
      {/* Icon for mobile view */}
      <div className="md:hidden flex items-center justify-end p-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="text-gray-500 focus:outline-none"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Content to be toggled */}
      <div
        className={`absolute inset-0 md:relative ${
          isVisible ? "block" : "hidden"
        } md:block`}
      >
        <div className="p-4">
          <List />
          {chatId && <Chat />}
          {chatId && <Detail />}
        </div>
      </div>
    </div>
  );
}
