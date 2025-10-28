import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';


const DoctorsRoster = () => {
  const navigate = useNavigate();
  const [specialisations, setSpecialisations] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedSpecialisation, setSelectedSpecialisation] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDays, setSelectedDays] = useState([]);
  const [shift1Start, setShift1Start] = useState('');
  const [shift1End, setShift1End] = useState('');
  const [shift2Start, setShift2Start] = useState('');
  const [shift2End, setShift2End] = useState('');
  const [rosterList, setRosterList] = useState([]);
  const [createdby, setCreatedBy] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState({ doctor_id: '', day_of_week: '' });
  const [selectedShiftOption, setSelectedShiftOption] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const role = user?.role_title?.toLowerCase();
    const userId = user?.userId?.toLowerCase();

    const isSuperOrAdmin = role === 'admin' || userId === 'superadmin';

    if (!isSuperOrAdmin) {
      alert("❌ Access Denied: Only Superadmin or Admin can access Doctor Roster");
      navigate('/');
    } else {
      setCreatedBy(userId === 'superadmin' ? 0 : user?.emp_id || userId);
      fetchSpecialisations();
      fetchRoster();
    }
  }, [navigate]);

  useEffect(() => {
    if (selectedSpecialisation) {
      fetch(`${process.env.REACT_APP_SERVER_URL}/patient/doctors-by-specialisation/${selectedSpecialisation}`)
        .then(res => res.json())
        .then(data => setDoctors(data));
    }
  }, [selectedSpecialisation]);

  const fetchSpecialisations = async () => {
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/specialisations`);
    const data = await res.json();
    setSpecialisations(data);
  };

  const fetchRoster = async () => {
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/doctor-roster`);
    const data = await res.json();
    if (data.success) setRosterList(data.roster);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = async () => {
    if (!selectedDoctor || selectedDays.length === 0) {
      alert("❌ Please select doctor and at least one day.");
      return;
    }

    const shifts = [];

    for (const day of selectedDays) {
      if (shift1Start && shift1End) {
        shifts.push({
          day_of_week: day,
          opd_shift: "OPD Shift 1",
          start_time: shift1Start,
          end_time: shift1End
        });
      }
      if (shift2Start && shift2End) {
        shifts.push({
          day_of_week: day,
          opd_shift: "OPD Shift 2",
          start_time: shift2Start,
          end_time: shift2End
        });
      }
    }

    if (shifts.length === 0) {
      alert("❌ Please fill at least one shift time.");
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/doctor-roster`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctor_id: selectedDoctor,
        createdBy: createdby,
        shifts
      })
    });

    const data = await response.json();

    if (data.success) {
      alert("✅ Roster saved successfully");
      fetchRoster();
      setSelectedDoctor('');
      setSelectedSpecialisation('');
      setDoctors([]);
      setSelectedDays([]);
      setShift1Start('');
      setShift1End('');
      setShift2Start('');
      setShift2End('');
    } else {
      alert("❌ Failed to save roster: " + (data.message || ""));
    }
  };

 const confirmDelete = async (shiftOption) => {
  const { doctor_id, day_of_week } = deleteInfo;

  const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/doctor-roster`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ doctor_id, day_of_week, shiftOption })
  });

  const data = await res.json();
  if (data.success) {
    alert("✅ " + data.message);
    fetchRoster();
  } else {
    alert("❌ Failed to delete: " + (data.message || data.error));
  }
  setShowDeleteModal(false);
  setSelectedShiftOption('');
};

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <>
     <div className="dashboard-wrapper ">
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Select OPD Shift to Delete</h3>
            <p>Day: <strong>{deleteInfo.day_of_week}</strong></p>

            <div className="modal-radio-group">
              <label>
                <input
                  type="radio"
                  name="shift"
                  value="OPD Shift 1"
                  checked={selectedShiftOption === "OPD Shift 1"}
                  onChange={(e) => setSelectedShiftOption(e.target.value)}
                />
                OPD Shift 1
              </label>
              <label>
                <input
                  type="radio"
                  name="shift"
                  value="OPD Shift 2"
                  checked={selectedShiftOption === "OPD Shift 2"}
                  onChange={(e) => setSelectedShiftOption(e.target.value)}
                />
                OPD Shift 2
              </label>
              <label>
                <input
                  type="radio"
                  name="shift"
                  value="Both"
                  checked={selectedShiftOption === "Both"}
                  onChange={(e) => setSelectedShiftOption(e.target.value)}
                />
                Both Shifts
              </label>
            </div>

            <div className="modal-button-row">
              <button
                onClick={() => {
                  if (!selectedShiftOption) {
                    alert("❌ Please select a shift option.");
                    return;
                  }
                  confirmDelete(selectedShiftOption);
                }}
              >
                Delete
              </button>
              <button
                className="modal-cancel-btn"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedShiftOption('');
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

        {/* ✅ Global Header */}
        <div className="dashboard-header">
          <img src="Logo.jpg" alt="Logo" className="global-logo" />
          <h1 className="dashboard-title">Doctor Roster</h1>
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
       

        <div className="doctorroster-content">
          <div className="doctorroster-form-box">
<div className="doctorroster-form-row">
  <div className="doctorroster-field-pair-row">
    <label htmlFor="specialisation">Specialisation*</label>
    <select id="specialisation" value={selectedSpecialisation} onChange={e => setSelectedSpecialisation(e.target.value)}>
      <option value="">Select</option>
      {specialisations.map(sp => (
        <option key={sp.specialisation_id} value={sp.specialisation_id}>
          {sp.specialisation_name}
        </option>
      ))}
    </select>
  </div>

<div className="doctorroster-field-pair-row doctorroster-doctor-row">
  <label htmlFor="doctor">Doctor*</label>
  <select
    id="doctor"
    value={selectedDoctor}
    onChange={e => setSelectedDoctor(e.target.value)}
    className="doctorroster-doctor-dropdown"
  >
    <option value="">Select</option>
    {doctors.map(doc => (
      <option key={doc.doctor_id} value={doc.doctor_id}>
        {doc.doctor_name}
      </option>
    ))}
  </select>
</div>

</div>


<div className="doctorroster-form-row">
  <label style={{ minWidth: '120px', color: 'white', fontWeight: 'bold' }}>Days *</label>
  
  <div className="doctorroster-days-shift-wrapper">
    <div className="doctorroster-days-container">
      <div className="doctorroster-days-box-vertical">
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday'].map(day => (
          <div key={day} className="doctorroster-day-item-vertical">
            <input type="checkbox" id={day} checked={selectedDays.includes(day)} onChange={() => toggleDay(day)} />
            <label htmlFor={day}>{day}</label>
          </div>
        ))}
      </div>
      <div className="doctorroster-days-box-vertical">
        {['Friday', 'Saturday', 'Sunday'].map(day => (
          <div key={day} className="doctorroster-day-item-vertical">
            <input type="checkbox" id={day} checked={selectedDays.includes(day)} onChange={() => toggleDay(day)} />
            <label htmlFor={day}>{day}</label>
          </div>
        ))}
      </div>
    </div>

    <div className="doctorroster-opd-shifts">
  <div className="opd-shift-row">
    <label>OPD Shift 1</label>
    <input className="opd-time-start" type="time" value={shift1Start} onChange={e => setShift1Start(e.target.value)} />
    <input className="opd-time-end" type="time" value={shift1End} onChange={e => setShift1End(e.target.value)} />
  </div>
  <div className="opd-shift-row">
    <label>OPD Shift 2</label>
    <input className="opd-time-start" type="time" value={shift2Start} onChange={e => setShift2Start(e.target.value)} />
    <input className="opd-time-end" type="time" value={shift2End} onChange={e => setShift2End(e.target.value)} />
  </div>

  {/* ✅ Reset + Save Buttons */}
  <div style={{ marginLeft: 'auto' }}>
    <button
      className="global-reset-button"
      onClick={() => {
        setSelectedDoctor('');
        setSelectedSpecialisation('');
        setDoctors([]);
        setSelectedDays([]);
        setShift1Start('');
        setShift1End('');
        setShift2Start('');
        setShift2End('');
      }}
    >
      Reset
    </button>

    <button className="global-save-button" onClick={handleSave}>
      Save
    </button>
  </div>
</div>


  </div>
</div>


</div>

          {/* 🔹 TABLE */}
          <div className="doctorroster-table-container">
            <table className="doctorroster-table">
          <thead>
                <tr>
                  <th>Specialisation</th>
                  {/* <th>Doctor ID</th> */}
                  <th>Doctor Name</th>
                  <th>Day</th>
                  <th>OPD Shift 1</th>
                  <th>OPD Shift 2</th>
                  <th>Action</th>
                </tr>
              </thead>
<tbody>
  {rosterList.length > 0 ? (
    Object.values(
      rosterList.reduce((acc, curr) => {
        const key = `${curr.doctor_id}-${curr.day_of_week}`;
        if (!acc[key]) {
          acc[key] = {
            ...curr,
            shift1: curr.opd_shift === 'OPD Shift 1' ? `${curr.start_time} - ${curr.end_time}` : '-',
            shift2: curr.opd_shift === 'OPD Shift 2' ? `${curr.start_time} - ${curr.end_time}` : '-'
          };
        } else {
          if (curr.opd_shift === 'OPD Shift 1') acc[key].shift1 = `${curr.start_time} - ${curr.end_time}`;
          if (curr.opd_shift === 'OPD Shift 2') acc[key].shift2 = `${curr.start_time} - ${curr.end_time}`;
        }
        return acc;
      }, {})
    ).map((r, index) => (
      <tr key={index}>
        <td>{r.specialisation_name}</td>
        {/* <td>{r.doctor_id}</td> */}
        <td>{r.doctor_name}</td>
        <td>{r.day_of_week}</td>
        <td>{r.shift1}</td>
        <td>{r.shift2}</td>
        <td>
          <FontAwesomeIcon
            icon={faTrash}
            className="bill-report-icon"
            title="Delete"
            onClick={() => {
              setDeleteInfo({ doctor_id: r.doctor_id, day_of_week: r.day_of_week });
              setShowDeleteModal(true);
            }}


          />
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="7" style={{ textAlign: 'center'}}>
        ❌ No roster records found
      </td>
    </tr>
  )}
</tbody>  

            </table>
          </div>
        </div>
      </div>
    </div>
    {/* ✅ Footer placed outside .dashboard-wrapper but still inside return */}
      <Footer />
    </>
  );
};

export default DoctorsRoster;