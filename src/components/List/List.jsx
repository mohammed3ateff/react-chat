import ChatList from "./ChatList";
import UserInfo from "./UserInfo";
import LogOut from "../../components/LogOut";

export default function List() {
  return (
    <div className="relative flex-2  flex flex-col hidden md:block ">
      <UserInfo />
      <ChatList />
      <LogOut />
    </div>
  );
}
