import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const InvestorProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="investor" profileData={profileData} onChange={onChange} />
);

export default InvestorProfile;
