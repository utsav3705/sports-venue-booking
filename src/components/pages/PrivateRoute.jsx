import { useState } from "react";
import { useApp } from "@/lib/store";
import LoginPage from "./LoginPage";
import SignupPage from "./SignupPage";

export default function PrivateRoute({ children }) {
  const { currentUser } = useApp();
  const [isLogin, setIsLogin] = useState(true);

  if (!currentUser) {
    if (isLogin) {
      return (
        <div className="w-full flex justify-center py-8">
          <LoginPage onToggleAuth={() => setIsLogin(false)} />
        </div>
      );
    } else {
      return (
        <div className="w-full flex justify-center py-8">
          <SignupPage onToggleAuth={() => setIsLogin(true)} />
        </div>
      );
    }
  }

  return children;
}
