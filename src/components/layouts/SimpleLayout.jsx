import React from 'react';
import { Outlet } from 'react-router-dom';

const SimpleLayout = () => {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default SimpleLayout;
