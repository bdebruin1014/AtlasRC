import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const LegalTitleProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="legal_title" profileData={profileData} onChange={onChange} />
);

export default LegalTitleProfile;
