import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const ConsultantProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="consultant" profileData={profileData} onChange={onChange} />
);

export default ConsultantProfile;
