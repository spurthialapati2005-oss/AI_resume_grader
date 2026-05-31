import { useState } from "react";
import { KeyRound, Save, UserRound } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAppStore } from "../store/useAppStore";

export default function ProfilePage() {
  const { user, loading, updateProfile, changePassword } = useAppStore();
  const [profile, setProfile] = useState({
    username: user?.username || "",
    email: user?.email || "",
    role: user?.role || "student",
    targetRole: user?.targetRole || "Software Developer",
    skills: Array.isArray(user?.skills) ? user.skills.join(", ") : "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    try {
      await updateProfile({
        ...profile,
        skills: profile.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      });
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    try {
      await changePassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <main className="mx-auto grid w-full max-w-5xl gap-6 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      <section className="glass-panel rounded-[2rem] p-5 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-full bg-gray-950 text-white">
            <UserRound size={24} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-sky-700">Profile</p>
            <h1 className="text-3xl font-black tracking-normal text-gray-950">Edit your details</h1>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="mt-7 grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Username
              <input className="field" value={profile.username} onChange={(event) => setProfile({ ...profile, username: event.target.value })} />
            </label>
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Email
              <input className="field" type="email" value={profile.email} onChange={(event) => setProfile({ ...profile, email: event.target.value })} />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Role
              <select className="field" value={profile.role} onChange={(event) => setProfile({ ...profile, role: event.target.value })}>
                <option value="student">Student</option>
                <option value="developer">Developer</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold text-gray-700">
              Target role
              <input className="field" value={profile.targetRole} onChange={(event) => setProfile({ ...profile, targetRole: event.target.value })} placeholder="Frontend Developer" />
            </label>
          </div>

          <label className="grid gap-2 text-sm font-bold text-gray-700">
            Skills
            <textarea className="field min-h-28 resize-none" value={profile.skills} onChange={(event) => setProfile({ ...profile, skills: event.target.value })} placeholder="React, Node.js, MongoDB" />
          </label>

          <button className="primary-btn w-full sm:w-fit" type="submit" disabled={loading.auth}>
            <Save size={18} />
            {loading.auth ? "Saving..." : "Save profile"}
          </button>
        </form>
      </section>

      <section className="glass-panel max-w-2xl rounded-[2rem] p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-rose-50 text-rose-700">
            <KeyRound size={21} />
          </span>
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-rose-700">Security</p>
            <h2 className="text-xl font-black tracking-normal text-gray-950">Change password</h2>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input
            className="field"
            type="password"
            placeholder="Current password"
            value={passwords.currentPassword}
            onChange={(event) => setPasswords({ ...passwords, currentPassword: event.target.value })}
            required
          />
          <input
            className="field"
            type="password"
            placeholder="New password"
            value={passwords.newPassword}
            onChange={(event) => setPasswords({ ...passwords, newPassword: event.target.value })}
            required
          />
          <button className="secondary-btn w-full whitespace-nowrap" type="submit" disabled={loading.auth}>
            <KeyRound size={18} />
            {loading.auth ? "Updating..." : "Update"}
          </button>
        </form>
      </section>
    </main>
  );
}
