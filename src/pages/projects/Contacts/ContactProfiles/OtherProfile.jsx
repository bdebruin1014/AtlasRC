import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const OtherProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="other" profileData={profileData} onChange={onChange} />
);

export default OtherProfile;
