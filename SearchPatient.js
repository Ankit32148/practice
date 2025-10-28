import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileInvoice, faUpload } from '@fortawesome/free-solid-svg-icons';
import Footer from './Footer';




const SearchPatient = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("userRole");
  const [patients, setPatients] = useState([]);
  const [filters, setFilters] = useState({
    patient_uhid: '',
    patient_mobile: '',
    patient_emailid: '',
    fromDate: '',
    toDate: ''
  });
  const handleLogout = () => {
    navigate('/');
  };

  const today = new Date().toISOString().split('T')[0];
  
  useEffect(() => {
    fetchPatients({ date: today });
  }, []);

  const fetchPatients = async (queryParams = {}) => {
    const query = new URLSearchParams(queryParams).toString();
    try {
     const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/search?${query}`)
      if (!response.ok) {
        const errData = await response.json();
        console.error("Backend error:", errData?.error);
        return setPatients([]);
      }
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      console.error("❌ Failed to load patients:", err);
      setPatients([]);
    }
  };

const handleSearch = () => {
  const { patient_uhid, patient_mobile, patient_emailid, fromDate, toDate } = filters;
  const queryParams = {};
  if (patient_uhid) queryParams.patient_uhid = patient_uhid;
  if (patient_mobile) queryParams.patient_mobile = patient_mobile;
  if (patient_emailid) queryParams.patient_emailid = patient_emailid;
  if (fromDate && toDate) {
    queryParams.fromDate = fromDate;
    queryParams.toDate = toDate;
  } else if (fromDate) {
    queryParams.date = fromDate;
  }

  fetchPatients(queryParams); // 🔁 Make fetch call with correct keys
};


  const handleReset = () => {
    setFilters({ patient_uhid: '', patient_mobile: '', patient_emailid: '', fromDate: '', toDate: '' });
    fetchPatients({ date: today });
  };
const handleCreateOPDClick = (uhid) => {
  const selectedPatient = patients.find(p => p.patient_uhid === uhid);

  if (!selectedPatient) {
    alert("❌ Patient not found in search results");
    return;
  }

  const patientData = {
    patient_id: selectedPatient.patient_id,
    patient_name: selectedPatient.patient_name || "",
    patient_uhid: selectedPatient.patient_uhid || "",
    patient_mobile: selectedPatient.patient_mobile || "",
    patient_emailid: selectedPatient.patient_emailid || "",
    patient_address: selectedPatient.patient_address || "",
    patient_comment: selectedPatient.patient_notes || "",
    patient_dob: selectedPatient.patient_dob || "",
    patient_year: selectedPatient.patient_year || "",
    patient_month: selectedPatient.patient_month || "",
    patient_days: selectedPatient.patient_days || "",
    patient_id_proof_flag: selectedPatient.patient_id_proof_flag || "",
    patient_id_proof: selectedPatient.patient_id_proof || "",
    specialisation_id: selectedPatient.specialisation_id || "",
    doctor_id: selectedPatient.doctor_id || "",
    doctor_name: selectedPatient.doctor_name || "",
  };

  navigate("/register-patient", {
    state: { patient: patientData, fromCreateOPD: true }
  });
};

const handleEditClick = async (uhid) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/fetch-by?uhid=${uhid}`)
    const data = await res.json();

    if (res.ok && data?.patient_id) {
      const patientData = {
        patient_id: data.patient_id,
        patient_name: data.patient_name || "",
        patient_uhid: data.patient_uhid || "",
        patient_mobile: data.patient_mobile || "",
        patient_emailid: data.patient_emailid || "",
        patient_address: data.patient_address || "",
        patient_comment: data.patient_notes || "", // ✅ Correct mapping
        patient_dob: data.patient_dob || "",
        patient_year: data.patient_year || "",
        patient_month: data.patient_month || "",
        patient_days: data.patient_days || "",
        patient_id_proof_flag: data.patient_id_proof_flag || "",
        patient_id_proof: data.patient_id_proof || "",
        specialisation_id: data.specialisation_id || "",
        doctor_id: data.doctor_id || "",
        doctor_name: data.doctor_name || "",
        height: data.height || "",
        weight: data.weight || "",
        temperature: data.temperature || "",
        blood_pressure: data.blood_pressure || "",
        spo2: data.spo2 || "",
        heart_beat: data.heart_beat || ""
      };

      navigate("/register-patient", {
        state: { patient: patientData, fromEdit: true }
      });
    } else {
      alert("❌ Patient data not found for editing");
    }
  } catch (err) {
    alert("❌ Error loading patient data for editing");
    console.error("Error in handleEditClick:", err);
  }
};

const handleBillClick = async (p) => {
  try {
    const billingDate = new Date(p.opd_date).toISOString().split('T')[0];

    const queryParams = new URLSearchParams({
      uhid: p.patient_uhid,
      opd_id: p.patient_opd_id,
      date: billingDate
    }).toString();

    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/fetch-by?${queryParams}`)
    const data = await res.json();

    const patient = Array.isArray(data) ? data[0] : data;

    if (res.ok && patient?.patient_id) {
      const billItems = (patient.billing_items || []).map(item => ({
        description: item.billed_for || "",
        amount: item.billing_amount != null ? item.billing_amount : "",
        tax: item.taxes_in_percentage != null ? item.taxes_in_percentage : ""
      }));

      const patientInfo = {
        name: patient.patient_name,
        mobile: patient.patient_mobile,
        uhid: patient.patient_uhid,
        emailid: patient.patient_emailid,
        address: patient.patient_address,
        doctor: patient.doctor_name || "-",
        date: patient.visit_date
          ? new Date(patient.visit_date).toLocaleDateString("en-GB")
          : "-",
        invoiceNo: patient.invoice_number || "-",
        patient_billing_id: patient.patient_billing_id,
        discountedAmount: patient.discounted_amount || 0,
        patient_opd_id: patient.patient_opd_id,
      };

      // ✅ Navigate directly to PrintPreview with data
      navigate("/print-preview", {
        state: {
          patient: patientInfo,
          billItems,
          discountedAmount: patient.discounted_amount || 0,
          paymentMode: patient.payment_mode || ""
        }
      });
    } else {
      alert("❌ Patient or billing info not found");
    }
  } catch (err) {
    alert("❌ Error loading patient billing data");
    console.error("Error in handleBillClick:", err);
  }
};

const handleGenerateBillClick = (p) => {
  const billingDate = new Date(p.opd_date).toISOString().split('T')[0];

  navigate(`/generate-bill?uhid=${p.patient_uhid}&opd_id=${p.patient_opd_id}&date=${billingDate}`);
};

const handleDeleteClick = async (patient_id) => {
  if (!window.confirm("Are you sure you want to delete this patient?")) return;

  try {
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/delete/${patient_id}`, {
      method: "DELETE"
    });

    if (res.ok) {
      alert("✅ Patient deleted successfully.");
      fetchPatients(); // Refresh the list
    } else {
      const err = await res.json();
      alert("❌ Failed to delete patient: " + (err?.error || ""));
    }
  } catch (err) {
    alert("❌ Error deleting patient");
    console.error("Error in handleDeleteClick:", err);
  }
};





const handleUploadClick = async (p) => {
  try {
    const res = await fetch(`${process.env.REACT_APP_SERVER_URL}/patient/fetch-by?uhid=${p.patient_uhid}`);
    const data = await res.json();

    console.log("📦 Response from /patient/fetch-by:", data);

    const patient = Array.isArray(data) ? data[0] : data;

    if (res.ok && patient?.patient_id) {
      navigate('/upload-reports', { state: { ...patient, opd_date: p.opd_date } }); // ✅ sends full object with patient_id
    } else {
      alert("❌ Patient data not found or invalid for upload");
    }
  } catch (err) {
    alert("❌ Error loading patient data for upload");
    console.error("handleUploadClick Error:", err);
  }
};

  return (
    <>
    <div className="dashboard-wrapper ">
                {/* ✅ Global Header */}
                <div className="dashboard-header">
                  <img src="Logo.jpg" alt="Logo" className="global-logo" />
                  <h1 className="dashboard-title">Search Patient</h1>
                </div>
            
                {/* ✅ Global Body Layout: Sidebar + Form */}
                <div className="dashboard-body">
                  {/* ✅ Global Sidebar */}
                  <div className="global-sidebar">
                    <ul>
                      <li><Link to="/register-patient">Register a Patient</Link></li>
                      <li><Link to="/search-patient">Search Patient</Link></li>
                      <li><Link to="/record-patient-vitals">Record Patient Vitals</Link></li>
                      <li><Link to="/schedule-appointment">Schedule Appointment</Link></li>
                      <li><Link to="/generate-bill">Generate Bill</Link></li>

                      {/* ✅ Only show this if user is Receptionist */}
                      {userRole === "Receptionist" && (
                        <li><Link to="/schedule-appointment">Schedule Appointment</Link></li>
                      )}

                      <li><Link to="/upload-reports">Upload Reports</Link></li>
                      <li><span className="logout-link" onClick={handleLogout}>Log out</span></li>
                    </ul>
                  </div>
    
        <div className="searchpatient-form-container">
          <div className="searchpatient-search-box">
            <div className="searchpatient-form-grid-aligned">
  {/* Row 1 */}
              <div className="searchpatient-form-group">
                <label>Patient UHID</label>
                <input
                  type="text"
                  placeholder="Enter UHID"
                  value={filters.patient_uhid}
                  onChange={(e) => setFilters({ ...filters, patient_uhid: e.target.value })}
                />
              </div>

              <div className="searchpatient-form-group mobile-box">
                <label>Mobile</label>
                <input
                  type="text"
                  placeholder="Enter Mobile"
                  value={filters.patient_mobile}
                  onChange={(e) => setFilters({ ...filters, patient_mobile: e.target.value })}
                />
              </div>

              <div className="searchpatient-form-group">
                <label>Email ID</label>
                <input
                  type="text"
                  placeholder="Enter Email"
                  value={filters.patient_emailid}
                  onChange={(e) => setFilters({ ...filters, patient_emailid: e.target.value })}
                />
              </div>

              {/* Row 2 */}
              <div className="searchpatient-form-group">
                <label>From Date</label>
                <input
                  type="date"
                  value={filters.fromDate}
                  onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })}
                />
              </div>

              <div className="searchpatient-form-group to-date-box">
                <label>To Date</label>
                <input
                  type="date"
                  value={filters.toDate}
                  onChange={(e) => setFilters({ ...filters, toDate: e.target.value })}
                />
              </div>

              <div className="all-patients-buttons">
                <button type="button" className="global-reset-button" onClick={handleReset}>Reset</button>
                <button type="button" className="global-search-button" onClick={handleSearch}>Search</button>
              </div>

            </div>
            </div>


          <div className="searchpatient-table">
            <table>
              <thead>
                <tr>
                  <th style={{ display: 'none' }}>Patient ID</th>
                  <th style={{ display: 'none' }}>OPD ID</th>
                  <th>UHID</th>
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Doctor</th>
                  <th>OPD Date</th>
                  <th>Bill/Reports</th>
                  <th>Create OPD</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.length > 0 ? (
                  patients.map((p, i) => (
                    <tr key={i}>
                      <td style={{ display: 'none' }}>{p.patient_id}</td>    {/* ✅ hidden */}
                      <td style={{ display: 'none' }}>{p.patient_opd_id}</td>
                      <td>{p.patient_uhid}</td>
                      <td>{p.patient_name}</td>
                      <td>{p.patient_mobile}</td>
                      <td>{p.patient_emailid}</td>
                      <td>{p.doctor_name || "-"}</td>   
                      <td style={{ verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {p.opd_date}
                      </td>

                      <td>
                         <img
                            src="/View Bill.png"
                            alt="View Bill"
                            title="View Bill"
                            style={{ width: '25px', height: '25px', cursor: 'pointer', marginRight: '10px' }}
                            onClick={() => handleBillClick(p)}
                          />
                        <FontAwesomeIcon
                          icon={faFileInvoice}
                          className="bill-report-icon"
                          title="Generate-Bill"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleGenerateBillClick(p)}
                        />
                        <FontAwesomeIcon
                          icon={faUpload}
                          className="bill-report-icon"
                          title="Upload Report"
                          style={{ cursor: 'pointer' }}
                          onClick={() => handleUploadClick(p)}
                        />
                      </td>
                      <td>
                        <img
                          src="/opd.jpg"
                          alt="Create OPD"
                          title="Create OPD"
                          style={{ width: '55px', cursor: 'pointer' }}
                          onClick={() => handleCreateOPDClick(p.patient_uhid)}
                        />
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center' }}>
                          <button className="edit-button" onClick={() => handleEditClick(p.patient_uhid)}>Edit</button>
                          <button className="delete-button" onClick={() => handleDeleteClick(p.patient_id)}>Delete</button>
                        </div>
                      </td>


                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="11" style={{ textAlign: 'center' }}>
                      ❌ No patients found
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

export default SearchPatient;