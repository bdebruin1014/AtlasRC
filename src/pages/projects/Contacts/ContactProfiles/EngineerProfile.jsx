import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const EngineerProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="engineer" profileData={profileData} onChange={onChange} />
);

export default EngineerProfile;
