'use client';

import React from 'react';
import { Cell as RechartsCell } from 'recharts';

interface DistributionCellProps {
  fill: string;
  fillOpacity: number;
  stroke: string;
  strokeWidth: number;
}

export const Cell: React.FC<DistributionCellProps> = ({
  fill,
  fillOpacity,
  stroke,
  strokeWidth
}) => {
  return (
    <RechartsCell
      fill={fill}
      fillOpacity={fillOpacity}
      stroke={stroke}
      strokeWidth={strokeWidth}
    />
  );
}; 