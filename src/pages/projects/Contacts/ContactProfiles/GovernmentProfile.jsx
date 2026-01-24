import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const GovernmentProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="government" profileData={profileData} onChange={onChange} />
);

export default GovernmentProfile;
