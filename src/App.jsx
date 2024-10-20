import "./App.css";
import List from "./components/List/List";
import Chat from "./components/Chat/Chat";
import Detail from "./components/Detail/Detail";
import Login from "./components/Login/Login";
import Notification from "./components/notification/notification";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./library/firebase";
import { useUserStore } from "./library/userStore";
import { useChatStore } from "./library/chatStore";

function App() {
  const user = false;

  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, [fetchUserInfo]);
  if (isLoading)
    return (
      <div className="p-[50px] text-xl rounded-[10px] bg-[rgba(17,25,40,0.9)]">
        Loading...
      </div>
    );

  return (
    <div className="w-[90vw]  h-[90vh] rounded-xl bg-[rgba(17,25,40,0.75)] backdrop-blur-[19px] backdrop-saturate-[180%] border border-solid border-[rgba(225,225,255,0.125)] flex ">
      {currentUser ? (
        <>
          <List />
          {chatId && <Chat />}
          {/* {chatId && <Detail />} */}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
}

export default App;
