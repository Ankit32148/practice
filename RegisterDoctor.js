import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import doctortype from '../data/doctortype.json';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';

const RegisterDoctor = () => {
  const [form, setForm] = useState({
    doctor_name: '',
    specialisation_id: '',
    doctor_mobile: '',
    doctor_emailid: '',
    doctor_qualification: '',
    doctor_address1: '',
    doctor_address2: '',
    doctor_address3: '',
    pincode: '',
    state_id: '',
    country_id: '',
    doctor_hms_loginid: '',
    doctor_hms_password: '',
    Confirm_password: '', // ✅ added
    doctor_type: '',
    years_of_experience: '',
    is_active: true,
    createdby: '0',
    created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    updatedby: '',
    update_date: null
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [specialisations, setSpecialisations] = useState([]);
  const [searchParams] = useSearchParams();
  const operation = searchParams.get('operation');
  const doctorId = searchParams.get('doctor_id');
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/countries`)
      .then(res => res.json())
      .then(data => setCountries(data))
      .catch(err => console.error('❌ Failed to load countries:', err));
  }, []);

  useEffect(() => {
    if (form.country_id) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/api/states-by-country/${form.country_id}`)
        .then(res => res.json())
        .then(data => setStates(data))
        .catch(err => console.error('❌ Failed to load states:', err));
    } else {
      setStates([]);
    }
  }, [form.country_id]);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_SERVER_URL}/api/specialisations`)
      .then(res => res.json())
      .then(data => setSpecialisations(data))
      .catch(err => console.error('❌ Failed to load specialisations:', err));
  }, []);

  useEffect(() => {
    if (operation === 'u' && doctorId) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/api/get-doctor/${doctorId}`)
        .then(res => res.json())
        .then(data => {
          if (data) {
            setForm(prev => ({
              ...prev,
              ...data,
              Confirm_password: data.doctor_hms_password, // to keep confirm field filled
              update_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
              updatedby: '0'
            }));
          }
        })
        .catch(err => console.error('❌ Failed to fetch doctor:', err));
    }
  }, [operation, doctorId]);

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
};

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validation
    if (!/^\d{10}$/.test(form.doctor_mobile)) {
      alert('❌ Mobile number must be exactly 10 digits');
      return;
    }

    if (form.doctor_emailid && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.doctor_emailid)) {
      alert('❌ Invalid email format');
      return;
    }

    if (form.doctor_hms_password !== form.Confirm_password) {
      alert('❌ Password and Confirm Password do not match');
      return;
    }

    if (form.doctor_hms_password.length < 6) {
      alert('❌ Password must be at least 6 characters');
      return;
    }

    if (form.years_of_experience && isNaN(form.years_of_experience)) {
      alert('❌ Experience must be numeric');
      return;
    }

    if (form.pincode && !/^\d+$/.test(form.pincode)) {
      alert('❌ Pincode must be numeric');
      return;
    }

    const requiredFields = [
      'doctor_name',
      'doctor_mobile',
      'doctor_hms_loginid',
      'doctor_hms_password',
      'Confirm_password'
    ];

    for (let field of requiredFields) {
      if (!form[field]) {
        alert(`❌ ${field.replace(/_/g, ' ')} is required`);
        return;
      }
    }

    const endpoint = operation === 'u' && doctorId
      ? `${process.env.REACT_APP_SERVER_URL}/api/update-doctor/${doctorId}`
      : `${process.env.REACT_APP_SERVER_URL}/api/register-doctor`;

    const method = operation === 'u' && doctorId ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      const data = await res.json();

      if (res.ok) {
        alert(`✅ Doctor ${operation === 'u' ? 'updated' : 'registered'} successfully!`);
        navigate('/all-doctors');
      } else {
        alert('❌ Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      alert('❌ Failed to submit doctor data');
    }
  };

  const handleReset = () => {
    setForm({
      doctor_name: '',
      specialisation_id: '',
      doctor_mobile: '',
      doctor_emailid: '',
      doctor_qualification: '',
      doctor_address1: '',
      doctor_address2: '',
      doctor_address3: '',
      pincode: '',
      state_id: '',
      country_id: '',
      doctor_hms_loginid: '',
      doctor_hms_password: '',
      Confirm_password: '',
      doctor_type: '',
      years_of_experience: '',
      is_active: true,
      createdby: '0',
      created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updatedby: '',
      update_date: null
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  return (
    <>
      <div className="dashboard-wrapper">
        <div className="dashboard-header">
          <img src="Logo.jpg" alt="Logo" className="global-logo" />
          <h1 className="dashboard-title">Doctor Registration</h1>
        </div>

        <div className="dashboard-body">
          <div className="global-sidebar">
            <ul>
              <li><Link to="/register-admin">Register Employee</Link></li>
              <li><Link to="/all-employees">All Employees</Link></li>
              <li><Link to="/register-doctor">Register Doctor</Link></li>
              <li><Link to="/all-doctors">All Doctors</Link></li>
              <li><Link to="/doctor-roster">Doctor Roster</Link></li>
              <li><Link to="/all-patients">All Patients</Link></li>
              <li><Link to="/upload-reports">Reports</Link></li>
              <li><span className="logout-link" onClick={handleLogout}>Log out</span></li>
            </ul>
          </div>

          <div className="form-page">
            <form onSubmit={handleSubmit} className="form-grid">
              <label>Doctor Name *</label>
              <input name="doctor_name" value={form.doctor_name} onChange={handleChange} required placeholder='Doctor Name'/>

              <label>Mobile *</label>
              <input
                name="doctor_mobile"
                value={form.doctor_mobile}
                onChange={(e) => {
                  const onlyNums = e.target.value.replace(/\D/g, ""); // sirf numbers
                  if (onlyNums.length <= 10) {
                    setForm(prev => ({ ...prev, doctor_mobile: onlyNums }));
                  }
                }}
                maxLength={10}
                pattern="^\d{10}$"
                title="Please enter exactly 10 digits"
                required
                placeholder="9876543210"
              />

              <label>Email ID</label>
              <input name="doctor_emailid" value={form.doctor_emailid} onChange={handleChange} placeholder='Email Id'/>

              <label>Qualification</label>
              <input name="doctor_qualification" value={form.doctor_qualification} onChange={handleChange} placeholder='Qualification'/>

              <label>Specialisation</label>
              <select name="specialisation_id" value={form.specialisation_id} onChange={handleChange}>
                <option value="">Specialisation</option>
                {specialisations.map(s => (
                  <option key={s.specialisation_id} value={s.specialisation_id}>{s.specialisation_name}</option>
                ))}
              </select>

              <label>Type</label>
              <select name="doctor_type" value={form.doctor_type} onChange={handleChange}>
                <option value="">Select</option>
                {doctortype.map((type, index) => (
                  <option key={index} value={type.value}>{type.label}</option>
                ))}
              </select>

              <label>Experience</label>
              <input name="years_of_experience" value={form.years_of_experience} onChange={handleChange} placeholder='Experience'/>

              <label>Address 1</label>
              <input name="doctor_address1" value={form.doctor_address1} onChange={handleChange} placeholder='Address'/>

              <label>Address 2</label>
              <input name="doctor_address2" value={form.doctor_address2} onChange={handleChange} placeholder='Address'/>

              <label>Address 3</label>
              <input name="doctor_address3" value={form.doctor_address3} onChange={handleChange} placeholder='Address'/>

              <label>Pincode</label>
              <input name="pincode" value={form.pincode} onChange={handleChange} placeholder='Enter Pincode'/>

              <label>Country</label>
              <select name="country_id" value={form.country_id} onChange={handleChange}>
                <option value="">Select Country</option>
                {countries.map(c => (
                  <option key={c.country_id} value={c.country_id}>{c.country_name}</option>
                ))}
              </select>

              <label>State</label>
              <select name="state_id" value={form.state_id} onChange={handleChange}>
                <option value="">Select State</option>
                {states.map(s => (
                  <option key={s.state_id} value={s.state_id}>{s.state_name}</option>
                ))}
              </select>

              <label>Login ID *</label>
              <input name="doctor_hms_loginid" value={form.doctor_hms_loginid} onChange={handleChange} required />

              <label>Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="doctor_hms_password"
                  value={form.doctor_hms_password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '35px', width: '100%' }}
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

              <label>Confirm Password *</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="Confirm_password"
                  value={form.Confirm_password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '35px', width: '100%' }}
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
      <Footer />
    </>
  );
};

export default RegisterDoctor;