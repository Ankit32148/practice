import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import idProofOptions from '../data/idProof.json';
import Footer from './Footer';

const RegisterPatient = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromVitals = location.state?.fromVitals || false;
  const isExistingPatient = !!location.state?.patient;
  const fromCreateOPD = location.state?.fromCreateOPD === true;
  const fromEdit = location.state?.fromEdit || false;
  const operation = location.state?.operation || "save";


  const handleLogout = () => {
    navigate('/');
  };

  const user = JSON.parse(sessionStorage.getItem('user'));
  const userRole = user?.role_title?.toLowerCase();

  useEffect(() => {
    const allowedRoles = ['admin', 'receptionist', 'nurse'];
    const isSuperadmin = user?.userId?.toLowerCase() === 'superadmin';

    if (!user || (!isSuperadmin && !allowedRoles.includes(userRole))) {
      alert('❌ Access Denied: Only Superadmin, Admin, or Receptionist can access this page.');
      navigate('/sign-in');
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    patient_name: '',
    patient_uhid: '',
    patient_mobile: '',
    patient_emailid: '',
    patient_year: '',
    patient_month: '',
    patient_days: '',
    patient_dob: '',
    patient_id_proof_flag: '',
    patient_id_proof: '',
    patient_address: '',
    patient_comment: '',
    doctor_id: '',
    height: '',
    weight: '',
    temperature: '',
    blood_pressure: '',
    spo2: '',
    heart_beat: '',
    created_by:  user?.emp_id || 0,
    created_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    patient_opd_id: ''
  });

  const [doctorSpecialisations, setDoctorSpecialisations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [error, setError] = useState('');
  const [showGenerateBill, setShowGenerateBill] = useState(false);
  const [registeredPatientData, setRegisteredPatientData] = useState(null);

useEffect(() => {
  fetchDoctorSpecialisations();

  // Check if we came from ScheduleAppointment -> Create OPD
  if (fromCreateOPD && location.state?.patient) {
    const { patient_name, patient_mobile } = location.state.patient;

    // 🔍 Check if patient already exists in DB
    fetch(`${process.env.REACT_APP_SERVER_URL}/patient/fetch-existing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ patient_name, patient_mobile })
    })
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          const p = data.patient;
          const dob = p.patient_dob ? new Date(p.patient_dob).toISOString().slice(0, 10) : "";

          setFormData(prev => ({
            ...prev,
            patient_id: p.patient_id || '',
            patient_uhid: p.patient_uhid || '',
            patient_name: p.patient_name || '',
            patient_mobile: p.patient_mobile || '',
            patient_emailid: p.patient_emailid || '',
            patient_dob: dob,
            patient_year: p.patient_year || '',
            patient_month: p.patient_month || '',
            patient_days: p.patient_days || '',
            patient_id_proof_flag: p.patient_id_proof_flag || '',
            patient_id_proof: p.patient_id_proof || '',
            patient_address: p.patient_address || '',
            patient_comment: p.patient_notes || '',
            doctor_id: location.state.patient.doctor_id || '',
            appointment_date: location.state.patient.appointment_date || '',
            appointment_slot: location.state.patient.appointment_slot || '',
            specialisation_id: location.state.patient.specialisation_id || ''
          }));

          // 🧠 Load doctors if specialisation exists
          if (location.state.patient.specialisation_id) {
            fetchDoctors(location.state.patient.specialisation_id);
          }
        } else {
          // 🆕 Patient does not exist: load from ScheduleAppointment data
          const p = location.state.patient;
          setFormData(prev => ({
            ...prev,
            patient_name: p.patient_name || '',
            patient_mobile: p.patient_mobile || '',
            patient_emailid: p.patient_emailid || '',
            doctor_id: p.doctor_id || '',
            appointment_date: p.appointment_date || '',
            appointment_slot: p.appointment_slot || '',
            specialisation_id: p.specialisation_id || ''
          }));

          // 🧠 Load doctors if specialisation exists
          if (p.specialisation_id) {
            fetchDoctors(p.specialisation_id);
          }
        }
      })
      .catch(err => {
        console.error("❌ Error fetching existing patient:", err);
      });

    return;
  }

  // Fallback if came from Edit or Vitals
  if (location.state?.patient) {
    const p = location.state.patient;
    const dob = p.patient_dob ? new Date(p.patient_dob).toISOString().slice(0, 10) : "";

    setFormData(prev => ({
      ...prev,
      patient_id: p.patient_id || '',
      patient_uhid: p.patient_uhid || '',
      patient_name: p.patient_name || '',
      patient_mobile: p.patient_mobile || '',
      patient_emailid: p.patient_emailid || '',
      patient_dob: dob,
      patient_year: p.patient_year || '',
      patient_month: p.patient_month || '',
      patient_days: p.patient_days || '',
      patient_id_proof_flag: p.patient_id_proof_flag || '',
      patient_id_proof: p.patient_id_proof || '',
      patient_address: p.patient_address || '',
      patient_comment: p.patient_notes || '',
      appointment_date: p.appointment_date || '',
      appointment_slot: p.appointment_slot || '',
      doctor_id: p.doctor_id || '',
      specialisation_id: p.specialisation_id || ''
    }));

    if (p.specialisation_id) {
      fetchDoctors(p.specialisation_id);
    }
  }
}, []);





  const fetchDoctorSpecialisations = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/specialisations`);
      const data = await response.json();
      setDoctorSpecialisations(data);
    } catch (err) {
      console.error('Error fetching specialisations:', err);
      setError('Failed to load specialisations');
    }
  };

  const fetchDoctors = async (specialisationId) => {
    try {
      if (!specialisationId) return setDoctors([]);
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/doctors-by-specialisation/${specialisationId}`);
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors');
    }
  };

  const calculateAgeFromDOB = (dob) => {
    const dobDate = new Date(dob);
    const today = new Date();
    let years = today.getFullYear() - dobDate.getFullYear();
    let months = today.getMonth() - dobDate.getMonth();
    let days = today.getDate() - dobDate.getDate();
    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    return {
      patient_year: years.toString(),
      patient_month: months.toString(),
      patient_days: days.toString()
    };
  };

const handleChange = (e) => {
  const { name, value, type } = e.target;

  if (name === 'patient_dob') {
    // Keep DOB + age calculation logic as is
    const age = calculateAgeFromDOB(value);
    setFormData(prev => ({ ...prev, patient_dob: value, ...age }));
  } 
  else {
    let formattedValue = value;

    // Capitalize only for text or textarea fields
    if (type === "text" || type === "textarea") {
      if (value.length > 0) {
        formattedValue = value.charAt(0).toUpperCase() + value.slice(1);
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
  }

  setError('');
};

  const handleSpecialisationChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, specialisation_id: value, doctor_id: '' }));
    fetchDoctors(value);
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  const {
    patient_id,
    patient_uhid,
    patient_name,
    patient_mobile,
    patient_emailid,
    patient_id_proof,
    doctor_id,
    patient_dob,
    patient_year,
    patient_month,
    patient_days
  } = formData;

  if (!patient_name || !patient_mobile || !patient_id_proof || !doctor_id)
    return setError('Please fill all required fields.');

  if (!patient_dob && !patient_year && !patient_month && !patient_days)
    return setError('DOB or age must be provided.');

  try {
    const isNurse = userRole === 'nurse';

    // ✅ 1. If Nurse: Update only vitals
    if (isNurse && formData.patient_opd_id) {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/update-vitals`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patient_opd_id: formData.patient_opd_id,
          height: formData.height,
          weight: formData.weight,
          temperature: formData.temperature,
          blood_pressure: formData.blood_pressure,
          spo2: formData.spo2,
          heart_beat: formData.heart_beat,
          updatedby: user?.emp_id || 0,
        })
      });

      const result = await response.json();
      if (result.success) {
        alert("Vitals updated successfully ✅");
        navigate("/all-patients");
      } else {
        alert("❌ Vitals update failed");
      }
      return;
    }

    // ✅ 2. If fromEdit: update hms_patient_master only
    if (fromEdit && patient_id) {
      const updatePayload = {
        patient_id,
        patient_name,
        patient_mobile,
        patient_emailid: formData.patient_emailid || '',
        patient_address: formData.patient_address || '',
        patient_dob: formData.patient_dob || null,
        patient_id_proof: formData.patient_id_proof || '',
        patient_id_proof_flag: formData.patient_id_proof_flag || '',
        patient_comment: formData.patient_comment || '',
        updatedby: user?.emp_id || 0
      };

      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/update-master`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload)
      });

      const result = await response.json();
      if (response.ok && result.success) {
        alert("✅ Patient details updated successfully");
        navigate("/all-patients");
      } else {
        alert(`❌ Update failed: ${result?.error || "Unknown error"}`);
      }
      return;
    }

    // ✅ 3. Save new patient or create OPD for existing
    const isExisting = !!patient_id;
    const operationType = fromVitals ? "update" : isExisting ? "create_opd" : "save";

    const payload = {
      ...formData,
      patient_opd_id: formData.patient_opd_id || null,
      operation: operationType,
      patient_id: formData.patient_id || null,
      patient_uhid: formData.patient_uhid || null,
      createdby: user?.emp_id || 0
    };

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (response.ok && result.success) {
      alert(`✅ Patient registered successfully! UHID: ${result.uhid}`);

      // ✅ Fetch latest OPD details using UHID and today's date
      const fetchRes = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/fetch-by?uhid=${result.uhid}&date=${new Date().toISOString().split("T")[0]}`);
      const data = await fetchRes.json();

      if (!fetchRes.ok || !data?.patient_opd_id) {
        console.error("❌ OPD not found in response:", data);
        alert("❌ Error: Could not retrieve OPD info after registration.");
        return;
      }

      const selectedDoctor = doctors.find(doc => doc.doctor_id === doctor_id);

      setFormData(prev => ({ ...prev, patient_uhid: result.uhid }));
      setRegisteredPatientData({
        patient_uhid: result.uhid,
        patient_name,
        patient_mobile,
        patient_emailid: formData.patient_emailid || '',
        patient_address: formData.patient_address || '',
        doctor_name: selectedDoctor?.doctor_name || '',
        created_date: new Date().toLocaleString('en-GB'),
        patient_opd_id: data.patient_opd_id // ✅ Store for bill
      });

      setShowGenerateBill(true);
    } else {
      alert(`❌ Registration failed: ${result?.error || 'Unknown error'}`);
    }

  } catch (err) {
    console.error("❌ Submit error:", err);
    alert("❌ Error during submission");
  }
};


const handleGenerateBill = () => {
  if (registeredPatientData?.patient_uhid && registeredPatientData?.patient_opd_id) {
    const today = new Date().toISOString().split('T')[0]; // yyyy-mm-dd
    navigate(`/generate-bill?uhid=${registeredPatientData.patient_uhid}&opd_id=${registeredPatientData.patient_opd_id}&date=${today}&fromRegister=true`);
  } else {
    alert("❌ Error: UHID or OPD ID not found.");
  }
};

useEffect(() => {
  if (fromEdit && location.state?.patient) {
    const p = location.state.patient;
    const dob = p.patient_dob ? new Date(p.patient_dob).toISOString().slice(0, 10) : '';

    setFormData(prev => ({
      ...prev,
      patient_id: p.patient_id || '',
      patient_uhid: p.patient_uhid || '',
      patient_name: p.patient_name || '',
      patient_mobile: p.patient_mobile || '',
      patient_emailid: p.patient_emailid || '',
      patient_address: p.patient_address || '',
      patient_dob: dob,
      patient_year: p.patient_year || '',
      patient_month: p.patient_month || '',
      patient_days: p.patient_days || '',
      patient_id_proof: p.patient_id_proof || '',
      patient_id_proof_flag: p.patient_id_proof_flag || '',
      doctor_id: p.doctor_id || '',
      specialisation_id: p.specialisation_id || '',
      patient_comment: p.patient_comment || '',
      height: p.height || '',
      weight: p.weight || '',
      temperature: p.temperature || '',
      blood_pressure: p.blood_pressure || '',
      spo2: p.spo2 || '',
      heart_beat: p.heart_beat || '',
      patient_opd_id: p.patient_opd_id || ''
    }));

    if (p.specialisation_id) fetchDoctors(p.specialisation_id);
  }
}, []);

  return (
    <>
    <div className="dashboard-wrapper ">
        {/* ✅ Global Header */}
        <div className="dashboard-header">
          <img src="Logo.jpg" alt="Logo" className="global-logo" />
          <h1 className="dashboard-title">Patient Registration</h1>
        </div>
    
        {/* ✅ Global Body Layout: Sidebar + Form */}
        <div className="dashboard-body">
          {/* ✅ Global Sidebar */}
          <div className="global-sidebar">
            <ul>
               <li><Link to="/register-patient">Register a Patient</Link></li>
               <li><Link to="/search-patient">Search Patient</Link></li>
               <li><Link to="/record-patient-vitals">Record Patient Vitals</Link></li>
               <li><Link to="/generate-bill">Generate Bill</Link></li>
               <li><Link to="/schedule-appointment">Schedule Appointment</Link></li>
               <li><Link to="/upload-reports">Upload Reports</Link></li>
              <li><span className="logout-link" onClick={handleLogout}>Log out</span></li>
            </ul>
          </div>
        <div className="form-page">
  {error && (
    <div className="error-message" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
      {error}
    </div>
  )}
  <form className="form-grid" onSubmit={handleSubmit}>

    <label>Patient Name *</label>
    <input name="patient_name" value={formData.patient_name} onChange={handleChange} required disabled={isExistingPatient && !fromCreateOPD && !fromEdit} />

    <label>UHID</label>
    <input name="patient_uhid" value={formData.patient_uhid} readOnly disabled />

    <label>Mobile No *</label>
      <input
        type="tel"
        name="patient_mobile"
        value={formData.patient_mobile}
        onChange={(e) => {
          const onlyNums = e.target.value.replace(/\D/g, ""); // only digits
          if (onlyNums.length <= 10) {
            setFormData(prev => ({ ...prev, patient_mobile: onlyNums }));
          }
        }}
        maxLength={10}
        pattern="^\d{10}$"
        title="Please enter exactly 10 digits"
        required
        disabled={isExistingPatient && !fromCreateOPD && !fromEdit}
        placeholder="9876543210"
      />

    <label>Email ID</label>
    <input name="patient_emailid" type="email" value={formData.patient_emailid} onChange={handleChange} disabled={isExistingPatient && !fromCreateOPD && !fromEdit} />

    <label>DOB</label>
    <input name="patient_dob" type="date" value={formData.patient_dob} onChange={handleChange} disabled={isExistingPatient && !fromCreateOPD && !fromEdit} />

    <label>Age</label>
    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <input name="patient_year" type="number" placeholder="Years" value={formData.patient_year} onChange={handleChange} disabled={isExistingPatient && !fromEdit} style={{ width: '100px' }} />
        <span style={{ color: 'white' }}>Years</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <input name="patient_month" type="number" placeholder="Months" value={formData.patient_month} onChange={handleChange} disabled={isExistingPatient && !fromEdit} style={{ width: '100px' }} />
        <span style={{ color: 'white' }}>Months</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <input name="patient_days" type="number" placeholder="Days" value={formData.patient_days} onChange={handleChange} disabled={isExistingPatient && !fromEdit} style={{ width: '100px' }} />
        <span style={{ color: 'white' }}>Days</span>
      </div>
    </div>

    <label>ID Proof</label>
    <select name="patient_id_proof_flag" value={formData.patient_id_proof_flag} onChange={handleChange} required disabled={isExistingPatient && !fromCreateOPD && !fromEdit}>
      <option value="">Select ID</option>
      {Object.entries(idProofOptions).map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>

    <label>ID Proof No</label>
    <input name="patient_id_proof" value={formData.patient_id_proof} onChange={handleChange} required disabled={isExistingPatient && !fromCreateOPD && !fromEdit} />

    <label>Address</label>
    <textarea name="patient_address" value={formData.patient_address} onChange={handleChange} rows={3} disabled={isExistingPatient && !fromCreateOPD && !fromEdit} />

    <label>Comment</label>
    <textarea name="patient_comment" value={formData.patient_comment} onChange={handleChange} rows={3} />

    <label>Doctor Specialisation</label>
    <select name="specialisation_id" value={formData.specialisation_id} onChange={handleSpecialisationChange}>
      <option value="">Select</option>
      {doctorSpecialisations.map((spec) => (
        <option key={spec.specialisation_id} value={spec.specialisation_id}>{spec.specialisation_name}</option>
      ))}
    </select>

    <label>Doctor</label>
    <select name="doctor_id" value={formData.doctor_id} onChange={handleChange}>
      <option value="">Select Doctor</option>
      {doctors.map((doc) => (
        <option key={doc.doctor_id} value={doc.doctor_id}>{doc.doctor_name}</option>
      ))}
    </select>
            <div className="form-group-full">
              <fieldset className="vitals">
                <legend style={{color: 'white'}}>Patient Vitals</legend>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                  <div><label style={{color: 'white'}}>Height (cm)</label><input name="height" value={formData.height} onChange={handleChange} /></div>
                  <div><label style={{color: 'white'}}>Weight (kg)</label><input name="weight" value={formData.weight} onChange={handleChange} /></div>
                  <div><label style={{color: 'white'}}>Temperature (°C)</label><input name="temperature" value={formData.temperature} onChange={handleChange} /></div>
                  <div><label style={{color: 'white'}}>Blood Pressure (mmHg)</label><input name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} /></div>
                  <div><label style={{color: 'white'}}>SPO2 (%)</label><input name="spo2" value={formData.spo2} onChange={handleChange} /></div>
                  <div><label style={{color: 'white'}}>Heart Beat (bpm)</label><input name="heart_beat" value={formData.heart_beat} onChange={handleChange} /></div>
                </div>
              </fieldset>
            </div>

           <div className="form-buttons">
      <button type="reset" className="global-reset-button">Reset</button>
     <button type="button" onClick={handleSubmit} className="global-save-button">
        Save
      </button>
      {showGenerateBill && userRole !== "nurse" && (
  <button
    type="button"
    onClick={handleGenerateBill}
    style={{
      backgroundColor: "#28a745",
      color: "white",
      border: "none",
      padding: "10px 25px",
      borderRadius: "6px",
      fontWeight: "bold",
    }}
  >
    Generate Bill
  </button>
)}

      
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

export default RegisterPatient;