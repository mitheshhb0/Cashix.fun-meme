"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-2 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

type FormMode = "SIGN_IN" | "SIGN_UP" | "FORGOT_PASSWORD";

export default function Login() {
  const { user, signInWithGoogle, signUpWithEmail, signInWithEmail, resetPassword, loading } = useAuth();
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<FormMode>("SIGN_IN");

  // Input states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Feedback states
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const getFriendlyErrorMessage = (error: unknown) => {
    if (!error) return "An unexpected error occurred.";
    if (typeof error === "string") return error;
    const errObj = error as { code?: string; message?: string };
    const code = errObj.code || "";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
        return "Invalid email or password. Please try again.";
      case "auth/user-not-found":
        return "No account found with this email address.";
      case "auth/email-already-in-use":
        return "This email is already in use by another account.";
      case "auth/weak-password":
        return "Password is too weak. It must be at least 6 characters.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      default:
        return errObj.message || "Authentication failed. Please check your details.";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");

    if (mode === "SIGN_IN") {
      try {
        await signInWithEmail(email, password);
        router.push("/dashboard");
      } catch (error) {
        setErr(getFriendlyErrorMessage(error));
      }
    } else if (mode === "SIGN_UP") {
      try {
        await signUpWithEmail(email, password);
        router.push("/dashboard");
      } catch (error) {
        setErr(getFriendlyErrorMessage(error));
      }
    } else if (mode === "FORGOT_PASSWORD") {
      try {
        await resetPassword(email);
        setSuccessMsg("If this account exists, a reset link was sent.");
      } catch (error) {
        setErr(getFriendlyErrorMessage(error));
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setErr("");
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (error) {
      setErr(getFriendlyErrorMessage(error));
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] text-white flex flex-col items-center justify-center p-4 relative overflow-hidden premium-mesh-bg font-sans">
      
      {/* Back button */}
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 hover:text-[#FFD600] transition-colors font-bold text-sm uppercase tracking-wider z-20">
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="w-full max-w-[420px] z-10 my-8">
        <div className="bg-[#0D1426] border border-white/10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col w-full relative">
          
          {/* Header block with cover design */}
          <div className="relative pt-12 pb-14 px-8 text-center bg-gradient-to-tr from-[#FF4D00] via-[#FFD600] to-[#00E5FF] overflow-hidden">
            {/* Visual background bubbles inside the header cover */}
            <div className="absolute top-0 left-0 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none -translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-36 h-36 rounded-full bg-black/10 blur-xl pointer-events-none translate-x-12 translate-y-12" />

            <h2 className="text-3xl font-black text-black uppercase tracking-tight relative z-10 leading-none">
              {mode === "SIGN_IN" && "Sign In"}
              {mode === "SIGN_UP" && "Create an Account"}
              {mode === "FORGOT_PASSWORD" && "Reset Password"}
            </h2>
            <p className="text-[11px] font-black text-black/75 uppercase tracking-widest mt-2 relative z-10">
              to continue to Cashix.fun
            </p>
          </div>

          {/* Form container overlapping the header cover */}
          <div className="bg-[#0D1426] px-6 md:px-8 py-8 -mt-6 rounded-t-[2.5rem] relative z-10 border-t border-white/5 flex flex-col gap-5">
            
            {/* Google Sign In Action */}
            {mode !== "FORGOT_PASSWORD" && (
              <>
                <button
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 bg-white text-black font-semibold text-sm rounded-full hover:scale-102 transition-transform shadow-[0_4px_12px_rgba(255,255,255,0.1)] flex items-center justify-center tracking-wide cursor-pointer"
                >
                  <GoogleIcon />
                  Sign in with Google
                </button>

                <div className="flex items-center justify-center my-1">
                  <span className="text-neutral-500 font-medium text-xs">or</span>
                </div>
              </>
            )}

            {err && (
              <div className="text-xs bg-red-500/10 border border-red-500/20 text-red-500 font-bold p-3.5 rounded-2xl">
                {err}
              </div>
            )}

            {successMsg && (
              <div className="text-xs bg-[#00C853]/10 border border-[#00C853]/20 text-[#00C853] font-bold p-3.5 rounded-2xl">
                {successMsg}
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* Sign Up Side-by-Side First/Last Name Inputs */}
              {mode === "SIGN_UP" && (
                <div className="grid grid-cols-2 gap-3.5">
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="bg-[#060913]/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-[#FFD600] focus:outline-none w-full"
                    placeholder="First Name"
                    required
                  />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="bg-[#060913]/60 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-[#FFD600] focus:outline-none w-full"
                    placeholder="Last Name"
                    required
                  />
                </div>
              )}

              {/* Email Input */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#060913]/60 border border-white/10 rounded-2xl px-4 py-3.5 text-xs text-white placeholder-neutral-500 focus:border-[#FFD600] focus:outline-none w-full"
                placeholder="Email"
                required
              />

              {/* Password Input with visibility toggle */}
              {mode !== "FORGOT_PASSWORD" && (
                <div className="relative flex items-center bg-[#060913]/60 border border-white/10 rounded-2xl focus-within:border-[#FFD600] transition-colors pr-3">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-0 text-white placeholder-neutral-500 font-medium text-xs focus:outline-none w-full pl-4 py-3.5"
                    placeholder="Password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-neutral-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Action Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 bg-white text-black font-black uppercase text-xs rounded-full hover:scale-102 transition-transform hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] tracking-wider disabled:opacity-50 cursor-pointer text-center"
              >
                {loading ? "Processing..." : ""}
                {!loading && mode === "SIGN_IN" && "Sign In"}
                {!loading && mode === "SIGN_UP" && "Create account"}
                {!loading && mode === "FORGOT_PASSWORD" && "Send Reset Link"}
              </button>
            </form>

            {/* Recovery / Reset Link */}
            {mode === "SIGN_IN" && (
              <button
                type="button"
                onClick={() => { setMode("FORGOT_PASSWORD"); setErr(""); setSuccessMsg(""); }}
                className="text-[10px] font-black text-neutral-400 hover:text-[#FFD600] tracking-wider uppercase text-center mt-1"
              >
                Forgot password?
              </button>
            )}

            <div className="w-full h-[1px] bg-white/5 my-2" />

            {/* Footnote */}
            <p className="text-[10px] text-neutral-500 font-semibold leading-relaxed text-center px-4">
              Signing up for a Cashix.fun account means you agree to the{" "}
              <a href="#" className="underline hover:text-[#FFD600]">Privacy Policy</a> and{" "}
              <a href="#" className="underline hover:text-[#FFD600]">Terms of Service</a>.
            </p>

            {/* Bottom Form Toggles */}
            <div className="text-center mt-2">
              {mode === "SIGN_IN" && (
                <p className="text-xs text-neutral-400 font-semibold">
                  Don&apos;t have an account?{" "}
                  <button
                    onClick={() => { setMode("SIGN_UP"); setErr(""); setSuccessMsg(""); }}
                    className="text-[#FFD600] font-black hover:underline cursor-pointer"
                  >
                    Sign up here
                  </button>
                </p>
              )}
              {mode === "SIGN_UP" && (
                <p className="text-xs text-neutral-400 font-semibold">
                  Have an account?{" "}
                  <button
                    onClick={() => { setMode("SIGN_IN"); setErr(""); setSuccessMsg(""); }}
                    className="text-[#FFD600] font-black hover:underline cursor-pointer"
                  >
                    Log in here
                  </button>
                </p>
              )}
              {mode === "FORGOT_PASSWORD" && (
                <button
                  onClick={() => { setMode("SIGN_IN"); setErr(""); setSuccessMsg(""); }}
                  className="text-xs text-neutral-400 font-semibold hover:text-white"
                >
                  Back to Sign In
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
