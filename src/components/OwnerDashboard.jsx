import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function OwnerDashboard() {
    const [profile, SetProfile] = useState("")
    const navigate = useNavigate();
    useEffect(() => {

        //Check only spa-owner can visit this dashboard
        function checkUser() {
            const data = JSON.parse(sessionStorage.getItem('user'));
            if(data == null) {
                navigate('/');
            }
            else if (!(data.role === 'spa_owner')) {
                navigate('/');
            }
        }

        async function loadProfile() {
            const token = sessionStorage.getItem('token');
            try {
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                const data = (await response.json()).user;
                console.log(data);
                SetProfile(data);
            }
            catch (err) {

            }
        }
        checkUser();
        loadProfile();
    }, [])

    function logout() {
        console.log("logout called");
        sessionStorage.clear();
        navigate('/');
    }

    return (
        <>
            <h2>Owner Dashboard</h2>
            <h2>Welcome {profile.fullName}</h2>
            <button onClick={() => { logout() }}>Logout</button>
        </>
    )
}

export default OwnerDashboard;