import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const SalesProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="sales" profileData={profileData} onChange={onChange} />
);

export default SalesProfile;
