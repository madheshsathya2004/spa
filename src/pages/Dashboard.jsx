import React, { useEffect, useState } from 'react'
import SpaCard from '../components/SpaCard'

export default function Dashboard({ user }) {
  const [spa, setSpa] = useState(null)

  useEffect(()=>{
    // load spa for demo client id (1)
    const clientId = user?.id || '1'
    fetch(`http://localhost:5000/spas/${clientId}`).then(r=>r.json()).then(data=>{
      if(Array.isArray(data) && data.length) setSpa(data[0])
    }).catch(()=>{})
  }, [user])

  return (
    <>
      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card card-dark p-4 rounded-4 mb-4">
            <h4>Welcome back, <span className="fw-bold">{user?.name || 'Owner'}</span></h4>
            <p className="text-muted">Manage your spa, services, and bookings from this dashboard.</p>
            <div className="mt-3">
              <button className="btn btn-accent">Create Promotion</button>
              <button className="btn btn-outline-light ms-2">View Insights</button>
            </div>
          </div>

          <div className="mb-4">
            <SpaCard spa={spa} />
          </div>

          <div className="card card-dark p-4 rounded-4">
            <h5 className="mb-3">Recent activity</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-muted">You have 3 upcoming bookings.</li>
              <li className="mb-2 text-muted">Service 'Aroma Massage' got a 5-star review.</li>
              <li className="mb-2 text-muted">Update your spa gallery to attract customers.</li>
            </ul>
          </div>
        </div>

        <div className="col-12 col-lg-4">
          <div className="card card-dark p-4 rounded-4 mb-4 text-center">
            <h6 className="fw-semibold">Quick Stats</h6>
            <div className="row mt-3">
              <div className="col-6">
                <div className="fs-4 fw-bold">12</div>
                <div className="small text-muted">Bookings</div>
              </div>
              <div className="col-6">
                <div className="fs-4 fw-bold">8</div>
                <div className="small text-muted">Services</div>
              </div>
            </div>
          </div>

          <div className="card card-dark p-4 rounded-4">
            <h6 className="fw-semibold">Tips</h6>
            <ul className="small text-muted mt-2">
              <li>Update availability daily.</li>
              <li>Use high-res images for each service.</li>
              <li>Respond promptly to pending bookings.</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
