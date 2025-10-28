import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";


// i am modifying the code

// doing one more changes

// one more changes done on this code

export default function ChangePassword({ isOpen, onClose }) {
  const [form, setForm] = useState({
    emp_loginid: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const togglePassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      setMessage("❌ New password and confirm password do not match");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/employee/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });

      const data = await res.json();
      setMessage(data.message || "Unknown error");
      if (res.ok) {
        setForm({ emp_loginid: "", oldPassword: "", newPassword: "", confirmPassword: "" });
      }
    } catch (err) {
      setMessage("❌ Server error: " + err.message);
    }
  };

  if (!isOpen) return null; // Popup band ho to kuch mat render karo

  return (
  <div className="modal-overlay" onClick={onClose}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h2 className="modal-title">Change Password</h2>
      <form onSubmit={handleSubmit}>
        
        {/* User ID + Old Password same row */}
        <div className="input-row">
          <div className="input-group">
            <label>User ID *</label>
            <input
              name="emp_loginid"
              value={form.emp_loginid}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Old Password *</label>
            <div className="password-field">
              <input
                type={showPassword.oldPassword ? "text" : "password"}
                name="oldPassword"
                value={form.oldPassword}
                onChange={handleChange}
                required
              />
              <span onClick={() => togglePassword("oldPassword")}>
                <FontAwesomeIcon icon={showPassword.oldPassword ?  faEye : faEyeSlash} />
              </span>
            </div>
          </div>
        </div>

        {/* New Password */}
        <label>New Password *</label>
        <div className="password-field">
          <input
            type={showPassword.newPassword ? "text" : "password"}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            required
          />
          <span onClick={() => togglePassword("newPassword")}>
            <FontAwesomeIcon icon={showPassword.newPassword ? faEye : faEyeSlash} />
          </span>
        </div>

        {/* Confirm New Password */}
        <label>Confirm New Password *</label>
        <div className="password-field">
          <input
            type={showPassword.confirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            required
          />
          <span onClick={() => togglePassword("confirmPassword")}>
            <FontAwesomeIcon icon={showPassword.confirmPassword ? faEye : faEyeSlash} />
          </span>
        </div>

        {/* Buttons Right Aligned */}
        <div className="modal-actions">
          <button type="button" className="close-btn" onClick={onClose}>
            Close
          </button>
          <button type="submit" className="update-btn">
            Update Password
          </button>
        </div>
      </form>
      {message && <p>{message}</p>}
    </div>
  </div>
);

}
