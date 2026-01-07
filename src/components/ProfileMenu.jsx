import { CiCirclePlus, CiLogout, CiUser } from "react-icons/ci";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

const ProfileMenu = ({setIsProfileOpen}) => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleProfileClick = () => {
        navigate("/profile")    
        setIsProfileOpen(false)
    }
    
    const handleLogout = () => {
        logout();
        setIsProfileOpen(false);
    };
    
    return (
        <div className="bg-white rounded-md shadow-xl p-2">
            <div className="flex flex-col">
                <button onClick={handleProfileClick} className="flex justify-between rounded items-center gap-2 cursor-pointer hover:bg-neutral-200 py-2 px-4">
                    <CiUser />
                    Profile
                </button>
                <button className="flex justify-between items-center gap-2 cursor-pointer rounded hover:bg-neutral-200  py-2 px-4">
                    <CiCirclePlus />
                    Create
                </button>
                <button onClick={handleLogout} className="flex justify-between items-center gap-2 cursor-pointer rounded  hover:bg-neutral-200 py-2 px-4">
                    <CiLogout />
                    Logout
                </button>
            </div>
        </div>
    )
}

export default ProfileMenu