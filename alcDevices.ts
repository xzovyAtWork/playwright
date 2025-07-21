class Device {
	name: string;
	feedbackValue : number | undefined;
	lockedValue?: number;
	commandValue?: number;
  
	constructor(
	  name: string,
	  feedbackValue?: number,
	  lockedValue?: number,
	  commandValue?: number
	) {
	  this.name = name;
	  this.feedbackValue = feedbackValue;
	  this.lockedValue = lockedValue;
	  this.commandValue = commandValue;
	}
  }
export const devices = {
 wol : new Device("WOL", 1234),
 whl : new Device("WHL", 1263),
 wll : new Device("WLL", 1292),

 faceDamper : new Device('Face Damper', 414, 1975, 1964),
 bypassDamper : new Device('Bypass Damper', 458, 2019, 2008),

 fill : new Device('Fill', 1147, 2061, 2052),
 drain : new Device('Drain', 1205, 2091, 2082),

 leak1 : new Device('MPDC Leak', 1089),
 leak2 : new Device('Mech. Gallery Leak Detector', 1118),

 conductivity : new Device('Conductivity', 502),

 maTemp : new Device('M/A', 546),
 saTemp : new Device('S/A', 103),
 rh1 : new Device('RH One', 590),
 rh2 : new Device('RH Two', 634),

 primary : new Device('UPS Primary Status', 1582),
 secondary : new Device('Secondary Status', 1611),

 vfd : new Device('VFD', 766, 1709, 1698), //speed command
 vfdHOA : new Device('VFD HOA', 1524, 2169),
 vfdEnable : new Device('VFD Enable', undefined, 2178),
 vfdFault : new Device('VFD Fault', 1553),

 sump : new Device('Pump Status', 1321, 2149, 2140),
 bleed : new Device('bleed', undefined, 2120, 2111),

 airflow : new Device("airflow", 722),

 sf1 : new Device('sf1', 1350),
 sf2 : new Device('sf2', 1379),
 sf3 : new Device('sf3', 1408),
 sf4 : new Device('sf4', 1437),
 sf5 : new Device('sf5', 1466),
 sf6 : new Device('sf6', 1495),

}
