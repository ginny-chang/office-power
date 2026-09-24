import React from 'react';
import ScenarioScene from '../usecase-src/components/ScenarioScene';
import {OvertimeContext} from '../usecase-src/components/OvertimeStory';
import {Agent} from './OfficeScene';
import {useScenarioTime} from './scenario-time';

// Share the Hero robot and keep the 0911 scenario clock driving the HR room.
function DeskAgent(props){return <Agent {...props} working={!props.reduced}/>;}
export default function HRScenarioScene(props){
 const time=useScenarioTime();
 return <OvertimeContext.Provider value={time}><ScenarioScene {...props} RobotComponent={DeskAgent}/></OvertimeContext.Provider>;
}
