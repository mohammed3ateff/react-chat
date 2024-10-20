import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { auth, db } from "../../library/firebase";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import upload from "../../library/upload";
import avatarr from "../../assets/images/avatar.jpg";

export default function Login() {
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });
  const [loading, setLoading] = useState(false);
  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);

    if (!username || !email || !password)
      return toast.warn("Please enter all inputs!");
    if (!avatar.file) return toast.warn("Please upload an avatar!");

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return toast.warn("Select another username");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const imgUrl = await upload(avatar.file);
      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: [],
      });
      toast.success("Account created! You can login now!");
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      console.log(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center md:flex-row w-full h-full gap-[100px] p-5">
      <div className="flex-1 flex flex-col items-center gap-5 justify-center">
        <h2>Welcome to react chat</h2>
        <form
          onSubmit={handleLogin}
          className="flex flex-col items-center justify-center gap-5 w-full"
        >
          <input
            type="text"
            placeholder="Email"
            name="email"
            defaultValue="muhammedatef57@gmail.com"
            className="p-5 border-0 outline-0 bg-[rgba(17,25,40,0.6)] text-white rounded-[5px] w-full  md:w-[50%]"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            defaultValue="555555"
            className="p-5 border-0 outline-0 bg-[rgba(17,25,40,0.6)] text-white rounded-[5px] w-full  md:w-[50%]"
          />
          <button
            disabled={loading}
            className="w-full md:w-[30%] p-5 border-0 bg-[#1f8efa] rounded-[5px] cursor-pointer font-medium disabled:cursor-not-allowed disabled:bg-[#1f8ff19c]"
          >
            {loading ? "Loading..." : "Sign In"}
          </button>
        </form>

        <div>
          <p className="text-center">Try Now</p>
          <div className="mb-4">
            <div className="underline">First Account</div>
            <p>
              <span>Email:</span> muhammedatef57@gmail.com
            </p>
            <p>
              <span>Password:</span> 555555
            </p>
          </div>
          <div>
            <div className="underline">Second Account</div>
            <p>
              <span>Email:</span> atefhamosa@gmail.com
            </p>
            <p>
              <span>Password:</span> 666666
            </p>
          </div>
        </div>
      </div>
      {/* <div className="h-[80%] w-[2px] bg-[#dddddd35] hidden md:block"></div>
      <div className="flex-1 flex flex-col items-center gap-5">
        <h2>Create an Account</h2>
        <form
          onSubmit={handleRegister}
          className="flex flex-col items-center justify-center gap-5 w-full"
        >
          <label
            htmlFor="file"
            className="w-full flex items-center justify-between cursor-pointer underline"
          >
            <img
              src={avatar.url || avatarr}
              alt="avatar"
              className="w-[50px] h-[50px] rounded-[10px] object-cover opacity-60"
            />
            Upload an image
          </label>
          <input
            type="file"
            id="file"
            className="hidden"
            onChange={handleAvatar}
          />
          <input
            type="text"
            placeholder="Username"
            name="username"
            className="p-5 border-0 outline-0 bg-[rgba(17,25,40,0.6)] text-white rounded-[5px] w-full"
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            className="p-5 border-0 outline-0 bg-[rgba(17,25,40,0.6)] text-white rounded-[5px] w-full"
          />
          <input
            type="password"
            placeholder="Password"
            name="password"
            className="p-5 border-0 outline-0 bg-[rgba(17,25,40,0.6)] text-white rounded-[5px] w-full"
          />
          <button
            disabled={loading}
            className="w-full p-5 border-0 bg-[#1f8efa] rounded-[5px] cursor-pointer font-medium disabled:cursor-not-allowed disabled:bg-[#1f8ff19c]"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </form>
      </div> */}
    </div>
  );
}
