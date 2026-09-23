import React from 'react';
import RealHROffice from '../../src/components/RealHROffice';
import { OvertimeContext } from '../../src/components/OvertimeStory';
import { useScenarioTime } from './scenario-time';

// Use the existing 0911 clock so visibility, replay and manual navigation
// keep driving the same eight-stage office animation as the main site.
export default function ModeledHROffice(props) {
  const clock = useScenarioTime();
  return <OvertimeContext.Provider value={clock}>
    <RealHROffice {...props} />
  </OvertimeContext.Provider>;
}
