import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import '../App.css';
import Footer from './Footer';

const RegisterAdmin = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [department, setDepartment] = useState([]);
  const [roles, setRole] = useState([]);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState("");

  const [searchParams] = useSearchParams();
  const operation = searchParams.get('operation'); // 'u' if updating
  const empId = searchParams.get('emp_id');        // employee ID if editing

  const navigate = useNavigate();
    const handleLogout = () => {
    navigate('/');
  };

  // form state for all fields except confirmPassword
  const [form, setForm] = useState({
    emp_fname: '',
    emp_mname: '',
    emp_lname: '',
    emp_mobile: '',
    emp_emailid: '',
    emp_loginid: '',
    emp_pwd: '',
    emp_address1: '',
    emp_address2: '',
    emp_address3: '',
    pincode: '',
    country_id: '',
    state_id: '',
    department_id: '',
    role_id: '',
    is_active: true,
    createdby: '0',
    created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updatedby: '',
    update_date: '',
  });

  // separate state for confirm password
  const [confirmPassword, setConfirmPassword] = useState('');

  // Function to check password strength
const checkPasswordStrength = (pwd) => {
  if (!pwd) return "";

  const strongRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,}$/;
  const mediumRegex =
    /^(?=.[A-Za-z])(?=.\d)[A-Za-z\d@$!%*?&]{6,}$/;

  if (strongRegex.test(pwd)) return "Strong";
  if (mediumRegex.test(pwd)) return "Moderate";
  return "Weak";
};

const getStrengthColor = () => {
  if (passwordStrength === "Strong") return "green";
  if (passwordStrength === "Moderate") return "orange";
  if (passwordStrength === "Weak") return "red";
  return "black";
};

  // FETCH departments + countries on mount
  useEffect(() => {
    // departments
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/department`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDepartment(data);
        } else {
          setError('Invalid department data from server');
        }
      })
      .catch(err => {
        console.error('Error loading department:', err);
        setError('Failed to load departments');
      });

    // countries
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/countries`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCountries(data);
        } else {
          setError('Invalid country data from server');
        }
      })
      .catch(err => {
        console.error('Error loading countries:', err);
        setError('Failed to load countries');
      });
  }, []);

  // FETCH existing employee if updating
  useEffect(() => {
    if (operation === 'u' && empId) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/employee/get-employee/${empId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            // populate form fields
            setForm(prev => ({
              ...prev,
              ...data,
              created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
              updatedby: '0',
              update_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            }));
            setConfirmPassword(data.emp_pwd); // set confirm password equal to fetched pwd

            // immediately fetch states if country_id exists
            if (data.country_id) {
              fetch(`${process.env.REACT_APP_SERVER_URL}/api/states-by-country/${data.country_id}`)
                .then(res => res.json())
                .then(stateData => {
                  if (Array.isArray(stateData)) {
                    setStates(stateData);
                  } else {
                    setStates([]);
                    setError('Invalid state data from server');
                  }
                })
                .catch(err => {
                  console.error('Error loading states:', err);
                  setStates([]);
                  setError('Failed to load states');
                });
            }

            // immediately fetch roles if department_id exists
            if (data.department_id) {
              fetch(`${process.env.REACT_APP_SERVER_URL}/api/roles-by-department/${data.department_id}`)
                .then(res => res.json())
                .then(roleData => {
                  if (Array.isArray(roleData)) {
                    setRole(roleData);
                  } else {
                    setRole([]);
                    setError('Invalid role data from server');
                  }
                })
                .catch(err => {
                  console.error('Error loading roles:', err);
                  setRole([]);
                  setError('Failed to load roles');
                });
            }
          }
        })
        .catch(err => {
          console.error('Failed to load employee for edit:', err);
          setError('Failed to load employee data');
        });
    }
  }, [operation, empId]);

  // FETCH roles whenever department_id changes (except during initial load if editing)
  useEffect(() => {
    if (form.department_id) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/api/roles-by-department/${form.department_id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRole(data);
            // if current role_id is no longer valid, clear it
            if (!data.some(r => String(r.role_id) === String(form.role_id))) {
              setForm(prev => ({ ...prev, role_id: '' }));
            }
          } else {
            setRole([]);
            setForm(prev => ({ ...prev, role_id: '' }));
            setError('Invalid role data from server');
          }
        })
        .catch(err => {
          console.error('Error loading roles:', err);
          setRole([]);
          setForm(prev => ({ ...prev, role_id: '' }));
          setError('Failed to load roles');
        });
    }
  }, [form.department_id]);

  // FETCH states whenever country_id changes (except during initial load if editing)
  useEffect(() => {
    if (form.country_id) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/api/states-by-country/${form.country_id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setStates(data);
            // if current state_id is no longer valid, clear it
            if (!data.some(s => String(s.state_id) === String(form.state_id))) {
              setForm(prev => ({ ...prev, state_id: '' }));
            }
          } else {
            setStates([]);
            setError('Invalid state data from server');
          }
        })
        .catch(err => {
          console.error('Error loading states:', err);
          setStates([]);
          setError('Failed to load states');
        });
    }
  }, [form.country_id]);

  // handleChange for all inputs except confirmPassword
const handleChange = (e) => {
  const { name, value, type, checked } = e.target;

  let formattedValue = value;

  // Capitalize only for text-like inputs (not numbers, emails, passwords, checkboxes, etc.)
  if (type === "text" || type === "textarea") {
    if (value.length > 0) {
      formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
  }

  setForm(prev => ({
    ...prev,
    [name]: type === "checkbox" ? checked : formattedValue
  }));

  setError(""); // clear any existing error
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // ------- VALIDATION -------
    if (!form.emp_fname.trim()) {
      setError('First Name is required.');
      return;
    }
    if (!form.emp_lname.trim()) {
      setError('Last Name is required.');
      return;
    }
    if (!form.emp_mobile.trim()) {
      setError('Mobile Number is required.');
      return;
    }
    if (!/^\d{10}$/.test(form.emp_mobile)) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }
    if (!form.emp_emailid.trim()) {
      setError('Email ID is required.');
      return;
    }
    if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(form.emp_emailid)) {
      setError('Invalid email format (e.g., abc@gmail.com).');
      return;
    }
    if (!form.emp_loginid.trim()) {
      setError('User ID is required.');
      return;
    }
    if (!form.emp_pwd) {
      setError('Password is required.');
      return;
    }
    if (!confirmPassword) {
      setError('Confirm Password is required.');
      return;
    }
    if (form.emp_pwd !== confirmPassword) {
      setError('Password and Confirm Password are not same.');
      return;
    }
    if (!form.emp_address1.trim()) {
      setError('Address 1 is required.');
      return;
    }
    if (!form.pincode.trim()) {
      setError('Pincode is required.');
      return;
    }
    if (!/^\d{6}$/.test(form.pincode)) {
      setError('Pincode must be exactly 6 digits.');
      return;
    }
    if (!form.country_id) {
      setError('Country is required.');
      return;
    }
    if (!form.state_id) {
      setError('State is required.');
      return;
    }
    if (!form.department_id) {
      setError('Department is required.');
      return;
    }
    if (!form.role_id) {
      setError('Role is required.');
      return;
    }

    // ------- API CALL -------
    try {
      const endpoint =
        operation === 'u' && empId
          ? `${process.env.REACT_APP_SERVER_URL}/employee/update-employee/${empId}`
          : `${process.env.REACT_APP_SERVER_URL}/employee/create-employee`;

      const method = operation === 'u' && empId ? 'PUT' : 'POST';

      console.log('Calling API:', endpoint, 'method:', method);

      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      console.log('API Response:', res.status, data);

      if (res.ok) {
          const selectedRole = roles.find(role => String(role.role_id) === String(form.role_id));
          const roleName = selectedRole?.role_title || 'Employee';
          alert(`✅ ${roleName} registered successfully!`);
        // reset form
        setForm({
          emp_fname: '',
          emp_mname: '',
          emp_lname: '',
          emp_mobile: '',
          emp_emailid: '',
          emp_loginid: '',
          emp_pwd: '',
          emp_address1: '',
          emp_address2: '',
          emp_address3: '',
          pincode: '',
          country_id: '',
          state_id: '',
          department_id: '',
          role_id: '',
          is_active: true,
          createdby: '',
          created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          updatedby: '',
          update_date: '',
        });
        setConfirmPassword('');
        navigate('/all-employees');
      } else {
        setError(data.error || 'Unknown error occurred');
        alert('❌ Error: ' + (data.error || 'Unknown error occurred'));
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register admin: ' + err.message);
      alert('❌ Failed to register admin: ' + err.message);
    }
  };

  const handleReset = () => {
    setForm({
      emp_fname: '',
      emp_mname: '',
      emp_lname: '',
      emp_mobile: '',
      emp_emailid: '',
      emp_loginid: '',
      emp_pwd: '',
      emp_address1: '',
      emp_address2: '',
      emp_address3: '',
      pincode: '',
      country_id: '',
      state_id: '',
      department_id: '',
      role_id: '',
      is_active: true,
      createdby: '',
      created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updatedby: '',
      update_date: '',
    });
    setConfirmPassword('');
    setRole([]);
    setStates([]);
    setError('');
  };
  


  return (
    <>
    <div className="dashboard-wrapper ">
    {/* ✅ Global Header */}
    <div className="dashboard-header">
      <img src="Logo.jpg" alt="Logo" className="global-logo" />
      <h1 className="dashboard-title">Employee Registration</h1>
    </div>

    {/* ✅ Global Body Layout: Sidebar + Form */}
    <div className="dashboard-body">
      {/* ✅ Global Sidebar */}
      <div className="global-sidebar">
        <ul>
          <li><Link to="/register-admin">Register Employee</Link></li>
          <li><Link to="/all-employees">All Employees</Link></li>
          <li><Link to="/register-doctor">Register Doctor</Link></li>
          <li><Link to="/doctor-roster">Doctor Roster</Link></li>
          <li><Link to="/all-doctors">All Doctors</Link></li>
          <li><Link to="/all-patients">All Patients</Link></li>
          <li><Link to="/upload-reports">Reports</Link></li>
          <li><span className="logout-link" onClick={handleLogout}>Log out</span></li>
        </ul>
      </div>
        <div className="form-page">
          {error && (
            <div
              className="error-message"
              style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}
            >
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="form-grid">

  {/* First Name */}
  <label>First Name *</label>
  <input
    name="emp_fname"
    value={form.emp_fname}
    onChange={handleChange}
    required
    placeholder="Enter First Name"
  />
   {/* Middle Name */}
<label>Middle Name</label>
  <input
    name="emp_mname"
    value={form.emp_mname}
    onChange={handleChange}
    placeholder="Enter Middle Name"
  />
  {/* Last Name */}
<label>Last Name *</label>
  <input
    name="emp_lname"
    value={form.emp_lname}
    onChange={handleChange}
    required
    placeholder="Enter Last Name"
  />
  {/* Mobile No */}
<label>Mobile No *</label>
<input
  name="emp_mobile"
  value={form.emp_mobile}
  onChange={(e) => {
    const onlyNums = e.target.value.replace(/\D/g, ""); // sirf numbers
    if (onlyNums.length <= 10) {
      setForm(prev => ({ ...prev, emp_mobile: onlyNums }));
    }
  }}
  maxLength={10}
  pattern="^\d{10}$"
  title="Please enter exactly 10 digits"
  required
  placeholder="9876543210"
/>

    {/* Email */}
  <label>Email ID *</label>
  <input
    name="emp_emailid"
    value={form.emp_emailid}
    onChange={handleChange}
    type="email"
    required
    placeholder="Enter Mail ID"
  />
    {/* Address 1 */}
  <label>Address 1 *</label>
  <input
    name="emp_address1"
    value={form.emp_address1}
    onChange={handleChange}
    required
    placeholder="Enter Address"
  />

  {/* Address 2 */}
  <label>Address 2</label>
  <input
    name="emp_address2"
    value={form.emp_address2}
    onChange={handleChange}
    placeholder="Enter Address"
  />



  {/* Address 3 */}
  <label>Address 3</label>
  <input
    name="emp_address3"
    value={form.emp_address3}
    onChange={handleChange}
    placeholder="Enter Address"
  />



  {/* Pincode */}
  <label>Pincode *</label>
  <input
    name="pincode"
    value={form.pincode}
    onChange={handleChange}
    required
    placeholder="Enter Pincode"
  />
    {/* Country */}
  <label>Country *</label>
  <select
    name="country_id"
    value={form.country_id}
    onChange={handleChange}
    required
  >
    <option value="">Select Country</option>
    {countries.map(country => (
      <option key={country.country_id} value={country.country_id}>
        {country.country_name}
      </option>
    ))}
  </select>
 
   {/* State */}
  <label>State *</label>
  <select
    name="state_id"
    value={form.state_id}
    onChange={handleChange}
    required
  >
    <option value="">Select State</option>
    {states.map(state => (
      <option key={state.state_id} value={state.state_id}>
        {state.state_name}
      </option>
    ))}
  </select>

  {/* Department */}
  <label>Department *</label>
  <select
    name="department_id"
    value={form.department_id}
    onChange={handleChange}
    required
  >
    <option value="">Select Department</option>
    {department.map(dept => (
      <option key={dept.department_id} value={dept.department_id}>
        {dept.department_name}
      </option>
    ))}
  </select>



  {/* Role */}
  <label>Role *</label>
  <select
    name="role_id"
    value={form.role_id}
    onChange={handleChange}
    required
  >
    <option value="">Select Role</option>
    {roles.map(role => (
      <option key={role.role_id} value={role.role_id}>
        {role.role_title}
      </option>
    ))}
  </select>





  {/* User ID */}
  <label>User ID *</label>
  <input
    name="emp_loginid"
    value={form.emp_loginid}
    onChange={handleChange}
    required
    placeholder="Enter User Name"
  />



  {/* Password */}
  {/* Password */}
<label>Password *</label>
<div style={{ position: 'relative' }}>
  <input
    type={showPassword ? 'text' : 'password'}
    name="emp_pwd"
    value={form.emp_pwd}
    onChange={(e) => {
      handleChange(e);
      setPasswordStrength(checkPasswordStrength(e.target.value));
    }}
    required
    style={{ paddingRight: '35px', width: '100%' }}
    placeholder="Enter Password"
  />
  <FontAwesomeIcon
    icon={showPassword ? faEye : faEyeSlash}
    onClick={() => setShowPassword(!showPassword)}
    style={{
      position: 'absolute',
      top: '50%',
      right: '10px',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#888',
    }}
    title={showPassword ? 'Hide password' : 'Show password'}
  />
</div>
{form.emp_pwd && (
  <>
    <p style={{ color: getStrengthColor(), margin: '5px 0' }}>
      Password Strength: {passwordStrength}
    </p>
    <ul style={{ fontSize: '0.85em', marginTop: '5px' }}>
      <li style={{ color: form.emp_pwd.length >= 8 ? "green" : "red" }}>
        Minimum 8 characters
      </li>
      <li style={{ color: /[A-Z]/.test(form.emp_pwd) ? "green" : "red" }}>
        At least one uppercase letter
      </li>
      <li style={{ color: /[a-z]/.test(form.emp_pwd) ? "green" : "red" }}>
        At least one lowercase letter
      </li>
      <li style={{ color: /\d/.test(form.emp_pwd) ? "green" : "red" }}>
        At least one number
      </li>
      <li style={{ color: /[@$!%*?&]/.test(form.emp_pwd) ? "green" : "red" }}>
        At least one special character (@$!%*?&)
      </li>
    </ul>
  </>
)}

{/* Confirm Password */}
<label>Confirm Password *</label>
<div style={{ position: 'relative' }}>
  <input
    type={showConfirmPassword ? 'text' : 'password'}
    name="confirmPassword"
    value={confirmPassword}
    onChange={(e) => {
      setConfirmPassword(e.target.value);
      setError('');
    }}
    required
    style={{ paddingRight: '35px', width: '100%' }}
    placeholder="Confirm Password"
  />
  <FontAwesomeIcon
    icon={showConfirmPassword ? faEye : faEyeSlash}
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    style={{
      position: 'absolute',
      top: '50%',
      right: '10px',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#888',
    }}
    title={showConfirmPassword ? 'Hide password' : 'Show password'}
  />
</div>

            {/* Is Active */}
            <div className="form-action-row-split">
  <div className="checkbox-wrapper">
    <label>Is Active</label>
    <input
      type="checkbox"
      name="is_active"
      checked={form.is_active}
      onChange={handleChange}
    />
  </div>

  <div className="button-group">
    <button
      type="button"
      className="global-reset-button"
      onClick={handleReset}
    >
      Reset
    </button>
    <button
      type="submit"
      className="global-save-button"
    >
      Save
    </button>
  </div>
</div>



          </form>
        </div>
      </div>
    </div>
    {/* ✅ Footer placed outside .dashboard-wrapper but still inside return */}
      <Footer />
    </>
  );
};

export default RegisterAdmin;