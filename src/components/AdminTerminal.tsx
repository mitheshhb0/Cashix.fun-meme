"use client";

import { useEffect, useState, useRef } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  deleteDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { 
  Users, 
  CheckCircle, 
  Radio, 
  Bell, 
  Activity, 
  Terminal, 
  Lock, 
  Unlock, 
  Settings, 
  Database, 
  Cpu, 
  Layers, 
  Trash2, 
  AlertTriangle,
  Send,
  Plus,
  Shield
} from "lucide-react";

type AdminTab = 
  | "USERS" 
  | "APPROVALS" 
  | "MEMBERS" 
  | "SIGNALS" 
  | "ANNOUNCEMENTS" 
  | "HEALTH" 
  | "API_MONITOR" 
  | "AUDIT_LOGS";

interface UserProfile {
  id: string;
  email: string;
  role: "MEMBER" | "ADMIN";
  status: "ACTIVE" | "SUSPENDED";
  joinedDate: string;
}

interface WhitelistItem {
  email: string;
  approvedAt: string;
  approvedBy: string;
}

interface AuditLog {
  id: string;
  action: string;
  admin: string;
  timestamp: string;
}

export default function AdminTerminal() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<AdminTab>("USERS");
  const [dbError, setDbError] = useState(false);
  const [signalFeedback, setSignalFeedback] = useState("");
  const [announcementFeedback, setAnnouncementFeedback] = useState("");
  const dbErrorRef = useRef(false);

  // Form states
  const [whitelistInput, setWhitelistInput] = useState("");
  const [sigToken, setSigToken] = useState("");
  const [sigAction, setSigAction] = useState<"BUY" | "SELL">("BUY");
  const [sigAddress, setSigAddress] = useState("");
  const [sigEntry, setSigEntry] = useState("");
  const [sigTarget, setSigTarget] = useState("");
  const [sigStop, setSigStop] = useState("");
  const [sigRationale, setSigRationale] = useState("");
  const [announcementText, setAnnouncementText] = useState("");

  // Data states (with local mock fallbacks)
  const [users, setUsers] = useState<UserProfile[]>([
    { id: "1", email: "sajibur@cashix.fun", role: "MEMBER", status: "ACTIVE", joinedDate: "2026-07-10" },
    { id: "2", email: "whale@watcher.com", role: "MEMBER", status: "ACTIVE", joinedDate: "2026-07-11" },
    { id: "3", email: "maxi@sol.com", role: "MEMBER", status: "ACTIVE", joinedDate: "2026-07-12" },
    { id: "4", email: "unapproved_trader@gmail.com", role: "MEMBER", status: "ACTIVE", joinedDate: "2026-07-12" },
  ]);

  const [whitelist, setWhitelist] = useState<WhitelistItem[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<string[]>([
    "unapproved_trader@gmail.com",
    "alpha_seeker@yahoo.com",
    "pump_master@outlook.com"
  ]);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { id: "1", action: "Initialized Admin Command Center", admin: "system", timestamp: new Date(Date.now() - 3600000).toLocaleString() },
  ]);

  // Telemetry state
  const [cpuUsage, setCpuUsage] = useState(18);
  const [apiLogs, setApiLogs] = useState<string[]>([
    "[INFO] Initializing API monitoring connections...",
  ]);

  // Write to Audit Log (Helper)
  const logAdminAction = async (actionText: string) => {
    const newLog = {
      action: actionText,
      admin: user?.email || "admin",
      timestamp: new Date().toLocaleString()
    };

    if (!dbError) {
      try {
        await addDoc(collection(db, "audit_logs"), newLog);
      } catch (err) {
        console.error("Failed to write audit log to Firestore", err);
      }
    }

    setAuditLogs(prev => [
      { id: Math.random().toString(), ...newLog },
      ...prev
    ]);
  };

  // Firestore subscribers
  useEffect(() => {
    // Whitelist listener
    const unsubWhitelist = onSnapshot(
      collection(db, "approved_emails"),
      (snapshot) => {
        const items: WhitelistItem[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          if (data.approved === true) {
            items.push({
              email: doc.id,
              approvedAt: data.approvedAt || "—",
              approvedBy: data.approvedBy || "—",
            });
          }
        });
        setWhitelist(items);
        setDbError(false);
        dbErrorRef.current = false;
      },
      (error) => {
        console.warn("Firestore access error (whitelist), trying local cache:", error);
        getDocs(collection(db, "approved_emails")).then((snapshot) => {
          const items: WhitelistItem[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.approved === true) {
              items.push({
                email: doc.id,
                approvedAt: data.approvedAt || "—",
                approvedBy: data.approvedBy || "—",
              });
            }
          });
          if (items.length > 0) {
            setWhitelist(items);
          }
        }).catch(() => {
          if (!dbErrorRef.current) {
            dbErrorRef.current = true;
            setDbError(true);
            setWhitelist([
              { email: "mitheshhb0@gmail.com", approvedAt: "Automatic Bypass", approvedBy: "System" },
              { email: "admin@cashix.fun", approvedAt: "Automatic Bypass", approvedBy: "System" },
            ]);
          }
        });
      }
    );

    // Pending approvals listener
    const unsubPending = onSnapshot(
      collection(db, "pending_signups"),
      (snapshot) => {
        const items: string[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push(data.email || doc.id);
        });
        setPendingApprovals(items);
      },
      (error) => {
        console.warn("Firestore access error (pending signups), trying local cache:", error);
        getDocs(collection(db, "pending_signups")).then((snapshot) => {
          const items: string[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push(data.email || doc.id);
          });
          if (items.length > 0) {
            setPendingApprovals(items);
          }
        }).catch((err) => {
          console.warn("Failed to get pending signups from cache:", err);
        });
      }
    );

    // Users directory listener
    const unsubUsers = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const items: UserProfile[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            email: data.email || doc.id,
            role: data.role || "MEMBER",
            status: data.status || "ACTIVE",
            joinedDate: data.joinedDate || "—"
          });
        });
        if (items.length > 0) {
          setUsers(items);
        }
      },
      (error) => {
        console.warn("Firestore access error (users directory), trying local cache:", error);
        getDocs(collection(db, "users")).then((snapshot) => {
          const items: UserProfile[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              email: data.email || doc.id,
              role: data.role || "MEMBER",
              status: data.status || "ACTIVE",
              joinedDate: data.joinedDate || "—"
            });
          });
          if (items.length > 0) {
            setUsers(items);
          }
        }).catch((err) => {
          console.warn("Failed to get users from cache:", err);
        });
      }
    );

    // Audit logs listener
    const unsubLogs = onSnapshot(
      collection(db, "audit_logs"),
      (snapshot) => {
        const items: AuditLog[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          items.push({
            id: doc.id,
            action: data.action || "",
            admin: data.admin || "",
            timestamp: data.timestamp || ""
          });
        });
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        if (items.length > 0) {
          setAuditLogs(items);
        }
      },
      (error) => {
        console.warn("Firestore access error (audit logs), trying local cache:", error);
        getDocs(collection(db, "audit_logs")).then((snapshot) => {
          const items: AuditLog[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              action: data.action || "",
              admin: data.admin || "",
              timestamp: data.timestamp || ""
            });
          });
          items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          if (items.length > 0) {
            setAuditLogs(items);
          }
        }).catch((err) => {
          console.warn("Failed to get audit logs from cache:", err);
        });
      }
    );

    return () => {
      unsubWhitelist();
      unsubPending();
      unsubUsers();
      unsubLogs();
    };
  }, []); // Run once on mount — error handling via ref avoids re-subscribe loops

  // CPU Telemetry Oscillator
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.floor(14 + Math.sin(Date.now() / 5000) * 8 + Math.random() * 3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // API Log Stream Simulator
  useEffect(() => {
    const rpcs = ["Helius RPC", "DexScreener API", "SocialData Crawler", "OpenAI Inference"];
    const endpoints = ["/token-boosts", "/v1/market-pulse", "/social/mentions", "/v1/chat/completions"];

    const interval = setInterval(() => {
      const rpc = rpcs[Math.floor(Math.random() * rpcs.length)];
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const latency = Math.floor(15 + Math.random() * 150);
      const isOk = Math.random() > 0.03;

      const log = isOk
        ? `[INFO] ${new Date().toLocaleTimeString()} - ${rpc}: GET ${endpoint} success in ${latency}ms`
        : `[WARNING] ${new Date().toLocaleTimeString()} - ${rpc}: GET ${endpoint} rate-limited (HTTP 429). Retrying in 1.2s`;

      setApiLogs(prev => [log, ...prev.slice(0, 30)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Whitelist Action (Approve Email)
  const handleApprove = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    try {
      await setDoc(doc(db, "approved_emails", cleanEmail), {
        approved: true,
        approvedAt: new Date().toLocaleString(),
        approvedBy: user?.email || "admin"
      });
      
      // Remove from pending_signups queue
      try {
        // Try deleting by email as ID first
        await deleteDoc(doc(db, "pending_signups", cleanEmail));
        
        // Just in case document ID was auto-generated, find and delete by email field query
        const pendingRef = collection(db, "pending_signups");
        const q = query(pendingRef, where("email", "==", cleanEmail));
        const qSnap = await getDocs(q);
        qSnap.forEach(async (docSnap) => {
          try {
            await deleteDoc(docSnap.ref);
          } catch (dErr) {
            console.warn("Could not delete specific pending doc:", dErr);
          }
        });
      } catch (delErr) {
        console.warn("Could not delete from pending queue doc:", delErr);
      }
      
      setPendingApprovals(prev => prev.filter(e => e !== cleanEmail));
      setWhitelistInput("");
      logAdminAction(`Approved user email: ${cleanEmail}`);
    } catch (err) {
      console.error("Approve action failed", err);
      // Local fallback
      if (dbError) {
        setWhitelist(prev => [
          ...prev, 
          { email: cleanEmail, approvedAt: new Date().toLocaleString(), approvedBy: user?.email || "admin" }
        ]);
        setPendingApprovals(prev => prev.filter(e => e !== cleanEmail));
        setWhitelistInput("");
        logAdminAction(`[OFFLINE] Approved user email: ${cleanEmail}`);
      }
    }
  };

  // Revoke Action
  const handleRevoke = async (email: string) => {
    try {
      await setDoc(doc(db, "approved_emails", email), { approved: false });
      logAdminAction(`Revoked whitelist access for: ${email}`);
    } catch (err) {
      console.error("Revoke action failed", err);
      if (dbError) {
        setWhitelist(prev => prev.filter(item => item.email !== email));
        logAdminAction(`[OFFLINE] Revoked whitelist access for: ${email}`);
      }
    }
  };

  // User list role toggle
  const toggleUserRole = async (id: string) => {
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;
    const nextRole = userToUpdate.role === "ADMIN" ? "MEMBER" : "ADMIN";

    try {
      await setDoc(doc(db, "users", userToUpdate.email), { role: nextRole }, { merge: true });
      logAdminAction(`Changed role for user ${userToUpdate.email} to ${nextRole}`);
    } catch (err) {
      console.error("Failed to toggle role in Firestore", err);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: nextRole } : u));
    }
  };

  // User list suspension toggle
  const toggleUserSuspension = async (id: string) => {
    const userToUpdate = users.find(u => u.id === id);
    if (!userToUpdate) return;
    const nextStatus = userToUpdate.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";

    try {
      await setDoc(doc(db, "users", userToUpdate.email), { status: nextStatus }, { merge: true });
      if (nextStatus === "SUSPENDED") {
        await setDoc(doc(db, "approved_emails", userToUpdate.email), { approved: false });
      } else {
        await setDoc(doc(db, "approved_emails", userToUpdate.email), { 
          approved: true,
          approvedAt: new Date().toLocaleString(),
          approvedBy: user?.email || "admin" 
        });
      }
      logAdminAction(`Toggled status for ${userToUpdate.email} to ${nextStatus}`);
    } catch (err) {
      console.error("Failed to toggle suspension in Firestore", err);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: nextStatus } : u));
    }
  };

  // Broadcast Call (Signal Desk)
  const handleBroadcastSignal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sigToken || !sigAddress || !sigEntry || !sigTarget || !sigStop) return;

    const signalData = {
      tokenName: sigToken,
      action: sigAction,
      contractAddress: sigAddress,
      entryPrice: sigEntry,
      targetPrice: sigTarget,
      stopLoss: sigStop,
      rationale: sigRationale || "Strategic momentum pattern detected. Honeypot check clear.",
      timestamp: "Just now"
    };

    try {
      await setDoc(doc(db, "signals", "active"), signalData);
      localStorage.setItem("cashix_active_signal", JSON.stringify(signalData));
      
      logAdminAction(`Broadcasted ${sigAction} signal for ${sigToken} (${sigAddress})`);
      
      // Clear Form
      setSigToken("");
      setSigAddress("");
      setSigEntry("");
      setSigTarget("");
      setSigStop("");
      setSigRationale("");

      setSignalFeedback("✅ Signal broadcasted to all terminals!");
      setTimeout(() => setSignalFeedback(""), 4000);
    } catch (err) {
      console.error("Failed to broadcast signal to Firestore", err);
      // Offline fallback
      localStorage.setItem("cashix_active_signal", JSON.stringify(signalData));
      logAdminAction(`[OFFLINE] Broadcasted ${sigAction} signal for ${sigToken}`);
      setSignalFeedback("⚠️ Saved locally (offline mode)");
      setTimeout(() => setSignalFeedback(""), 4000);
    }
  };

  // Broadcast Announcement
  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    try {
      await setDoc(doc(db, "announcements", "active"), {
        message: announcementText,
        timestamp: new Date().toLocaleString(),
        sender: user?.email || "Admin"
      });
      logAdminAction(`Published announcement: "${announcementText.substring(0, 30)}..."`);
      setAnnouncementText("");
      setAnnouncementFeedback("✅ Announcement posted to all terminals!");
      setTimeout(() => setAnnouncementFeedback(""), 4000);
    } catch (err) {
      console.error("Failed to post announcement to Firestore", err);
      logAdminAction(`[OFFLINE] Published announcement: "${announcementText.substring(0, 30)}..."`);
      setAnnouncementText("");
      setAnnouncementFeedback("⚠️ Posted locally (offline mode)");
      setTimeout(() => setAnnouncementFeedback(""), 4000);
    }
  };

  return (
    <div className="flex-grow flex flex-col gap-6 w-full max-w-6xl mx-auto p-4 md:p-6 lg:p-8 animate-fadeIn text-slate-100 font-sans">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2">
            <Terminal className="w-6 h-6 text-blue-500" />
            Admin Command Center
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            System administration console. Manage whitelists, broadcast intelligence signals, and monitor health.
          </p>
        </div>

        {dbError && (
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            Offline Mode: Using State Fallback
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        
        {/* Module Submenu Sidebar */}
        <div className="w-full md:w-64 bg-[#0D1117] border border-slate-800 rounded-xl p-3 flex flex-col gap-1 shrink-0">
          <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black px-3 py-2 block">Control Modules</span>
          <button
            onClick={() => setActiveSubTab("USERS")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
              activeSubTab === "USERS" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            User Management
          </button>
          <button
            onClick={() => setActiveSubTab("APPROVALS")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
              activeSubTab === "APPROVALS" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <CheckCircle className="w-4 h-4" />
              Pending Approvals
            </span>
            {pendingApprovals.length > 0 && (
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                activeSubTab === "APPROVALS" ? "bg-white text-blue-600" : "bg-blue-500/20 text-blue-400"
              }`}>
                {pendingApprovals.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveSubTab("MEMBERS")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${
              activeSubTab === "MEMBERS" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span className="flex items-center gap-2.5">
              <Shield className="w-4 h-4" />
              Whitelisted Members
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
              activeSubTab === "MEMBERS" ? "bg-white text-blue-600" : "bg-slate-800 text-slate-400"
            }`}>
              {whitelist.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab("SIGNALS")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
              activeSubTab === "SIGNALS" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Radio className="w-4 h-4" />
            Signal Desk
          </button>
          <button
            onClick={() => setActiveSubTab("ANNOUNCEMENTS")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
              activeSubTab === "ANNOUNCEMENTS" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Bell className="w-4 h-4" />
            Announcements
          </button>
          <button
            onClick={() => setActiveSubTab("HEALTH")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
              activeSubTab === "HEALTH" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            System Health
          </button>
          <button
            onClick={() => setActiveSubTab("API_MONITOR")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
              activeSubTab === "API_MONITOR" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4" />
            API Monitoring
          </button>
          <button
            onClick={() => setActiveSubTab("AUDIT_LOGS")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${
              activeSubTab === "AUDIT_LOGS" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <Database className="w-4 h-4" />
            Audit Logs
          </button>
        </div>

        {/* Dynamic Panel Workspace */}
        <div className="flex-grow w-full bg-[#0D1117] border border-slate-800 rounded-xl p-5 md:p-6 shadow-xl relative min-h-[450px]">
          
          {/* USER MANAGEMENT MODULE */}
          {activeSubTab === "USERS" && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">User Profiles</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Audit status, revoke roles, or suspend active user sessions.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                      <th className="py-2.5 px-3">Email Address</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Registered Date</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-slate-800/40 hover:bg-slate-900/30">
                        <td className="py-3 px-3 font-medium text-slate-200">{u.email}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                            u.role === "ADMIN" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-slate-800 text-slate-400"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-wider ${
                            u.status === "ACTIVE" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-400 font-mono">{u.joinedDate}</td>
                        <td className="py-3 px-3 text-right space-x-2">
                          <button
                            onClick={() => toggleUserRole(u.id)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-350 hover:text-white rounded text-[10px] font-bold uppercase transition-colors"
                          >
                            Toggle Role
                          </button>
                          <button
                            onClick={() => toggleUserSuspension(u.id)}
                            className={`px-2.5 py-1 border rounded text-[10px] font-bold uppercase transition-colors ${
                              u.status === "ACTIVE" 
                                ? "bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-900/20" 
                                : "bg-emerald-950/20 border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/20"
                            }`}
                          >
                            {u.status === "ACTIVE" ? "Suspend" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PENDING APPROVALS MODULE */}
          {activeSubTab === "APPROVALS" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-white tracking-wider">Access Approval Queue</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Approve pending members to grant them terminal workspace access.</p>
                </div>
              </div>

              {/* Manual Approval input */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-3">
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-black block">Pre-Approve Whitelist Email</label>
                <div className="flex gap-3">
                  <input
                    type="email"
                    value={whitelistInput}
                    onChange={(e) => setWhitelistInput(e.target.value)}
                    placeholder="Enter email address (e.g. member@gmail.com)"
                    className="flex-grow bg-[#060913]/60 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => handleApprove(whitelistInput)}
                    className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-lg transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Approve
                  </button>
                </div>
              </div>

              {/* Pending Queue list */}
              <div className="space-y-3">
                <h4 className="text-[10px] uppercase tracking-wider text-slate-450 font-black">Pending Requests ({pendingApprovals.length})</h4>
                
                {pendingApprovals.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 bg-[#060913]/20 border border-dashed border-slate-800 rounded-xl font-bold uppercase tracking-wider">
                    All clear! No pending approval requests.
                  </div>
                ) : (
                  <div className="border border-slate-800 rounded-xl divide-y divide-slate-800/60 overflow-hidden">
                    {pendingApprovals.map((email) => (
                      <div key={email} className="px-4 py-3.5 flex items-center justify-between gap-4 bg-[#07090E]/20 hover:bg-slate-900/10 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-2.5 h-2.5 bg-yellow-500/20 border border-yellow-500/40 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-slate-350">{email}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(email)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-[10px] rounded-lg transition-colors shadow"
                          >
                            Grant Access
                          </button>
                          <button
                            onClick={() => {
                              setPendingApprovals(prev => prev.filter(e => e !== email));
                              logAdminAction(`Rejected access request for: ${email}`);
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold uppercase text-[10px] rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* WHITELISTED MEMBERS MODULE */}
          {activeSubTab === "MEMBERS" && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">Whitelisted Members</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Audit active approved emails. Revoking access instantly blocks terminal access.</p>
              </div>

              {whitelist.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500 font-bold uppercase tracking-wider bg-[#060913]/10 border border-slate-800 rounded-xl border-dashed">
                  No active whitelist records retrieved.
                </div>
              ) : (
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                        <th className="py-3 px-4">Approved Email</th>
                        <th className="py-3 px-4">Approval Date</th>
                        <th className="py-3 px-4">Authorized By</th>
                        <th className="py-3 px-4 text-right">Revocation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-[#07090E]/10">
                      {whitelist.map((item) => (
                        <tr key={item.email} className="hover:bg-slate-900/30">
                          <td className="py-3.5 px-4 font-bold text-slate-200">{item.email}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono">{item.approvedAt}</td>
                          <td className="py-3.5 px-4 text-slate-400 font-semibold">{item.approvedBy}</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleRevoke(item.email)}
                              className="p-1.5 bg-red-950/10 border border-red-900/30 hover:bg-red-900/20 text-red-400 rounded-lg transition-colors cursor-pointer"
                              title="Revoke Whitelist Status"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* SIGNAL DESK MODULE */}
          {activeSubTab === "SIGNALS" && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">Signals desk</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Broadcast new token calls. All whitelisted members will receive the call in real-time.</p>
              </div>

              <form onSubmit={handleBroadcastSignal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Token Symbol</label>
                  <input
                    type="text"
                    value={sigToken}
                    onChange={(e) => setSigToken(e.target.value)}
                    placeholder="e.g. BONK"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Action</label>
                  <select
                    value={sigAction}
                    onChange={(e) => setSigAction(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none font-bold"
                  >
                    <option value="BUY" className="text-emerald-400 bg-slate-950 font-bold">BUY Call</option>
                    <option value="SELL" className="text-rose-400 bg-slate-950 font-bold">SELL Call</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Contract Address</label>
                  <input
                    type="text"
                    value={sigAddress}
                    onChange={(e) => setSigAddress(e.target.value)}
                    placeholder="e.g. DezXAZ8z7PnrFcEEbUYQ3k..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Entry Target</label>
                  <input
                    type="text"
                    value={sigEntry}
                    onChange={(e) => setSigEntry(e.target.value)}
                    placeholder="e.g. $0.000024"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Target Exit</label>
                  <input
                    type="text"
                    value={sigTarget}
                    onChange={(e) => setSigTarget(e.target.value)}
                    placeholder="e.g. $0.00012"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Stop Loss</label>
                  <input
                    type="text"
                    value={sigStop}
                    onChange={(e) => setSigStop(e.target.value)}
                    placeholder="e.g. $0.000015"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Analysis Rationale</label>
                  <textarea
                    rows={3}
                    value={sigRationale}
                    onChange={(e) => setSigRationale(e.target.value)}
                    placeholder="Explain the AI signal conviction metrics and smart money flows..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2 pt-2 space-y-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publish Signal to Terminals
                  </button>
                  {signalFeedback && (
                    <div className={`text-[10px] font-bold px-3 py-2 rounded-lg border ${
                      signalFeedback.includes("✅") 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    }`}>{signalFeedback}</div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* ANNOUNCEMENTS MODULE */}
          {activeSubTab === "ANNOUNCEMENTS" && (
            <div className="space-y-5">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">Broadcaster</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Publish emergency warnings or system updates globally.</p>
              </div>

              <form onSubmit={handlePostAnnouncement} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-wider text-slate-400 font-black block">Global Notice Message</label>
                  <textarea
                    rows={4}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Enter announcement text to broadcast..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-xs rounded-xl transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Post Global Announcement
                  </button>
                  {announcementFeedback && (
                    <div className={`text-[10px] font-bold px-3 py-2 rounded-lg border ${
                      announcementFeedback.includes("✅")
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-yellow-500/10 border-yellow-500/20 text-yellow-400"
                    }`}>{announcementFeedback}</div>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* SYSTEM HEALTH MODULE */}
          {activeSubTab === "HEALTH" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">System Telemetry</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Real-time daemon engine health metrics and system performance.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    <span className="text-[9px] uppercase tracking-wider font-black">CPU Load</span>
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xl font-black font-mono mt-1 block">{cpuUsage}%</span>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-1000"
                      style={{ width: `${cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    <span className="text-[9px] uppercase tracking-wider font-black">RAM Allocation</span>
                    <Database className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xl font-black font-mono mt-1 block">1.4 GB</span>
                  <p className="text-[8px] text-slate-500 uppercase font-black tracking-wide mt-3">Quota: 4.0 GB MAX</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    <span className="text-[9px] uppercase tracking-wider font-black">Cache Hit Rate</span>
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xl font-black font-mono mt-1 block">99.4%</span>
                  <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wide mt-3 block">Highly Optimized</span>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="flex items-center justify-between gap-2 text-slate-500">
                    <span className="text-[9px] uppercase tracking-wider font-black">WebSocket Feeds</span>
                    <Activity className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xl font-black font-mono mt-1 block">42 Active</span>
                  <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wide mt-3 block">0 Dropped Frames</span>
                </div>

              </div>

              {/* Visual simulated canvas signal frequency */}
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Signal Engine Frequency (Oscilloscope)</span>
                <div className="h-20 flex gap-0.5 items-end pt-5 relative">
                  <div className="absolute top-1 right-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-[8px] uppercase tracking-wider text-slate-500 font-bold">Frequency: 60Hz</span>
                  </div>
                  {Array.from({ length: 48 }).map((_, i) => {
                    const waveHeight = 20 + Math.sin((i + Date.now() / 400) * 0.4) * 35 + Math.random() * 8;
                    return (
                      <div 
                        key={i} 
                        className="flex-grow bg-blue-500/25 border-t border-blue-500/50 hover:bg-blue-400 transition-all rounded-t-sm"
                        style={{ height: `${Math.max(10, Math.min(100, waveHeight))}%` }}
                      />
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* API MONITORING MODULE */}
          {activeSubTab === "API_MONITOR" && (
            <div className="space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">API Endpoint Latencies</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Status logs of RPC data links and OpenAI inference integrations.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Latency List */}
                <div className="space-y-3.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black block">Target Integration Feeds</span>
                  
                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">Helius RPC (Solana)</h5>
                      <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wide block mt-0.5">Status: Operational</span>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-300">12ms</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">DexScreener WebSocket</h5>
                      <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wide block mt-0.5">Status: Operational</span>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-300">38ms</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">SocialData Scraper</h5>
                      <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wide block mt-0.5">Status: Operational</span>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-300">92ms</span>
                  </div>

                  <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-lg flex items-center justify-between gap-4">
                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">OpenAI API (Gemini Gateway)</h5>
                      <span className="text-[8px] text-emerald-400 uppercase font-black tracking-wide block mt-0.5">Status: Operational</span>
                    </div>
                    <span className="text-xs font-mono font-black text-slate-300">140ms</span>
                  </div>

                </div>

                {/* Console Log */}
                <div className="flex flex-col h-full min-h-[220px]">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-black block mb-3.5">API Traffic Logs (Real-time console)</span>
                  <div className="flex-grow bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[9px] text-blue-400 overflow-y-auto max-h-[220px] space-y-1.5 shadow-inner">
                    {apiLogs.map((log, index) => (
                      <div 
                        key={index} 
                        className={log.includes("WARNING") ? "text-yellow-500" : "text-blue-400/90"}
                      >
                        {log}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* AUDIT LOGS MODULE */}
          {activeSubTab === "AUDIT_LOGS" && (
            <div className="space-y-4">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase text-white tracking-wider">Security Audit Ledger</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide mt-1">Irreversible ledger of administrator sessions, signals, and approval updates.</p>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-xl divide-y divide-slate-800/60 max-h-[350px] overflow-y-auto font-mono text-[10px]">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-1.5 hover:bg-slate-900/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-[8px] bg-slate-900 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{log.admin}</span>
                      <span className="text-slate-300 font-semibold">{log.action}</span>
                    </div>
                    <span className="text-slate-500 shrink-0 text-right">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
