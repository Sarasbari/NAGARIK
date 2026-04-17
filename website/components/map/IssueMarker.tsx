'use client';

import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface IssueMarkerProps {
  position: [number, number];
  type: string;
  severity: number;
  id: string;
}

// Bold black-border pin icon
const issueIcon = (severity: number) =>
  L.divIcon({
    className: 'issue-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid #1a1a1a;
        background: ${severity >= 4 ? '#FF6B6B' : severity >= 3 ? '#FCC419' : '#51CF66'};
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 800;
        font-size: 14px;
        box-shadow: 2px 2px 0 #1a1a1a;
      ">
        ${severity}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

export default function IssueMarker({ position, type, severity, id }: IssueMarkerProps) {
  return (
    <Marker position={position} icon={issueIcon(severity)}>
      <Popup>
        <strong>{type}</strong>
        <br />
        Severity: {severity}/5
        <br />
        <a href={`/issues/${id}`}>View Details →</a>
      </Popup>
    </Marker>
  );
}
