import React from 'react';
import ProfileFieldRenderer from './ProfileFieldRenderer';

const TeamMemberProfile = ({ profileData, onChange }) => (
  <ProfileFieldRenderer category="team_member" profileData={profileData} onChange={onChange} />
);

export default TeamMemberProfile;
