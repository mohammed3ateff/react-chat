import { auth } from "../library/firebase"; // Adjust the import based on your project structure
import { useChatStore } from "../library/chatStore";

const LogOut = () => {
  const { resetChat } = useChatStore();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      resetChat();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="absolute bottom-0 w-full p-2.5 bg-[#1a73e8] text-white border-0 rounded-[5px] cursor-pointer duration-[0.3s] hover:bg-[#0653b7]"
    >
      Logout
    </button>
  );
};

export default LogOut;
