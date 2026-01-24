import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const ContractorProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="contractor" profileData={profileData} onChange={onChange} />
);

export default ContractorProfile;
