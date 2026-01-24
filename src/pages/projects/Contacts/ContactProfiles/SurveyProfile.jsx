import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const SurveyProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="survey" profileData={profileData} onChange={onChange} />
);

export default SurveyProfile;
