import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function CustomerDashboard() {

    const[profile, SetProfile] = useState("")
    const navigate = useNavigate();
    
    useEffect(()=>{

        //Check only Customer can visit this dashboard
        function checkUser() {
            const user = JSON.parse(sessionStorage.getItem('user'));
            console.log(user);
            if(user == null) {
                navigate('/');
            }
            else if (!(user.role == 'customer')) {
                navigate('/');
            }
    
        }

       async function loadProfile() {
            const token = sessionStorage.getItem('token');

            try{
                const response = await fetch('http://localhost:5000/api/auth/profile', {
                    method : 'GET',
                    headers : {
                        'Content-Type' : 'application/json',
                        'Authorization' : `Bearer ${token}`
                    }
                })
                const data = (await response.json());
                if(data.success) {
                    console.log(data);
                    SetProfile(data.user);
                }

            }
            catch(err) {

            }
       }
       checkUser();
       loadProfile();
    },[])

    function logout() {
        console.log("logout called");
        sessionStorage.clear();
        navigate('/');
    }

    return(
        <>
            <h1>Welcome {profile.fullName}</h1>
            <h2></h2>
            <button onClick={()=>{logout()}}>Logout</button>
        </>
    );
}

export default CustomerDashboard;