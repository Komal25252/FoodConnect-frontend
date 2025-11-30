import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api';

const GoogleLoginButton = ({ role, isRegister = false }) => {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      // Send the Google token to backend
      const response = await api.post('/auth/google-auth', {
        credential: credentialResponse.credential,
        role: role
      });

      const { token, user, needsLocation } = response.data;

      // Store token and user data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Check if user needs to add location
      if (needsLocation || !user.location) {
        toast.info('Please add your location to complete registration');
        navigate(`/add-location/${role}`, { state: { user } });
      } else {
        toast.success(`Welcome back, ${user.name}!`);
        // Navigate to appropriate dashboard
        if (role === 'ngo') {
          navigate('/ngo-dashboard');
        } else {
          navigate('/restaurant-dashboard');
        }
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast.error(error.response?.data?.message || 'Google authentication failed');
    }
  };

  const handleGoogleError = () => {
    toast.error('Google authentication failed. Please try again.');
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
        text={isRegister ? 'signup_with' : 'signin_with'}
        shape="rectangular"
        size="large"
        width="100%"
        logo_alignment="left"
      />
    </div>
  );
};

export default GoogleLoginButton;