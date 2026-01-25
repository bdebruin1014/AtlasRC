import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const ArchitectProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="architect" profileData={profileData} onChange={onChange} />
);

export default ArchitectProfile;
