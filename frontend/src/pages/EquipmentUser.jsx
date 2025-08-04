import React from 'react';
import UserDoorList from '../components/UserDoorList';
import UserLightList from '../components/UserLightList';
import UserACList from '../components/UserACList';

const EquipmentUser = () => {
  const userId = localStorage.getItem('userId'); // Get logged-in user's ID

  return (
    <div>
      <UserDoorList userId={userId}/>  {/* Pass userId only for user filtering */}
      <UserLightList userId={userId} />
      <UserACList userId={userId} />
    </div>
  );
};

export default EquipmentUser;
