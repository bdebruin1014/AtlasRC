import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const LenderProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="lender" profileData={profileData} onChange={onChange} />
);

export default LenderProfile;
