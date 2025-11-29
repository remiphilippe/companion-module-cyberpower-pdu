module.exports = {
	// ##########################
	// #### Define Variables ####
	// ##########################
	initVariables: function () {
		let self = this;

		// default assumed ATS outlets until discovery
		if (!self.DATA.atsTotalOutlets) self.DATA.atsTotalOutlets = 8
		self.rebuildATSVariables = function(count) {
			// Rebuild full variable list including ATS outlets up to count (capped at 19)
			const max = Math.min(count || self.DATA.atsTotalOutlets || 8, 19)
			let vars = []
			vars.push({ variableId: 'Model', name: 'Cyberpower product code' })
			vars.push({ variableId: 'SerialNumber', name: 'Serial number' })
			vars.push({ variableId: 'Firmware', name: 'Firmware version' })
			vars.push({ variableId: 'NumberSockets', name: 'Number of output sockets' })
			for (let i = 1; i <= 8; i++) { // existing PDU sockets remain fixed here
				vars.push({ variableId: `Socket_${i}_Name`, name: `Socket ${i} Name` })
			}
			for (let i = 1; i <= 8; i++) {
				vars.push({ variableId: `Socket_${i}_Status`, name: `Socket ${i} Status` })
			}
			vars.push({ variableId: 'Bank_Amps', name: 'Bank Amps' })
			vars.push({ variableId: 'Bank_Volts', name: 'Bank Volts' })
			vars.push({ variableId: 'Bank_Watts', name: 'Bank Watts' })

			// ATS variables
			vars.push({ variableId: 'ATS_Model', name: 'ATS Model' })
			vars.push({ variableId: 'ATS_SerialNumber', name: 'ATS Serial Number' })
			vars.push({ variableId: 'ATS_Firmware', name: 'ATS Firmware Version' })
			vars.push({ variableId: 'ATS_Device_Rating_Current', name: 'ATS Device Rating Current (A)' })
			vars.push({ variableId: 'ATS_Total_Outlets', name: 'ATS Total Outlets' })
			vars.push({ variableId: 'ATS_Active_Source', name: 'ATS Active Source' })
			vars.push({ variableId: 'ATS_SourceA_Volts', name: 'ATS Source A Volts (V)' })
			vars.push({ variableId: 'ATS_SourceB_Volts', name: 'ATS Source B Volts (V)' })
			vars.push({ variableId: 'ATS_SourceA_Freq', name: 'ATS Source A Frequency (Hz)' })
			vars.push({ variableId: 'ATS_SourceB_Freq', name: 'ATS Source B Frequency (Hz)' })
			for (let i = 1; i <= max; i++) {
				vars.push({ variableId: `ATS_Outlet_${i}_Name`, name: `ATS Outlet ${i} Name` })
				vars.push({ variableId: `ATS_Outlet_${i}_Status`, name: `ATS Outlet ${i} Status` })
			}
			self.setVariableDefinitions(vars)
		}

		// initial build
		self.rebuildATSVariables(self.DATA.atsTotalOutlets)
		 
		//Check info (names, model, etc) once every 5 seconds
		try {
			setInterval(function() {
				if (self.config.deviceType === 'ats') {
					self.getATSInfo(self.config.host, self.config.communityRead)
				} else {
					self.getInfo(self.config.host, self.config.communityWrite);
				}
			},5000);
		}
		catch(error) {
			self.log('error', 'Error setting info interval');
		}
		try {
			setInterval(function() {
				if (self.config.deviceType === 'ats') {
					self.getATSStatus(self.config.host, self.config.communityRead)
				} else {
					self.getStatus(self.config.host, self.config.communityWrite);
				}
			},1000);
		}
		catch(error) {
			self.log('error', 'Error setting status interval');
		}

		if (self.config.deviceType === 'ats') {
			self.getATSStatus(self.config.host, self.config.communityRead)
			self.getATSInfo(self.config.host, self.config.communityRead)
		} else {
			self.getStatus(self.config.host, self.config.communityWrite); 
			self.getInfo(self.config.host, self.config.communityWrite); 
		}
	},

	// #########################
	// #### Check Variables ####
	// #########################
	checkVariables: function () {
		let self = this;

		let variableObj = {};

		try {
			variableObj['Model'] = self.DATA.model;
			variableObj['SerialNumber'] = self.DATA.serialNumber;
			variableObj['Firmware'] = self.DATA.firmware;
			variableObj['NumberSockets'] = self.DATA.numberSockets;
			variableObj['Socket_1_Name'] = self.DATA.s1Name;
			variableObj['Socket_2_Name'] = self.DATA.s2Name;
			variableObj['Socket_3_Name'] = self.DATA.s3Name;
			variableObj['Socket_4_Name'] = self.DATA.s4Name;
			variableObj['Socket_5_Name'] = self.DATA.s5Name;
			variableObj['Socket_6_Name'] = self.DATA.s6Name;
			variableObj['Socket_7_Name'] = self.DATA.s7Name;
			variableObj['Socket_8_Name'] = self.DATA.s8Name;
			variableObj['Socket_1_Status'] = self.DATA.s1Status;
			variableObj['Socket_2_Status'] = self.DATA.s2Status;
			variableObj['Socket_3_Status'] = self.DATA.s3Status;
			variableObj['Socket_4_Status'] = self.DATA.s4Status;
			variableObj['Socket_5_Status'] = self.DATA.s5Status;
			variableObj['Socket_6_Status'] = self.DATA.s6Status;
			variableObj['Socket_7_Status'] = self.DATA.s7Status;
			variableObj['Socket_8_Status'] = self.DATA.s8Status;
			variableObj['Bank_Amps'] = self.DATA.bankAmps;
			variableObj['Bank_Volts'] = self.DATA.bankVolts;
			variableObj['Bank_Watts'] = self.DATA.bankWatts;
			// ATS mappings
			variableObj['ATS_Model'] = self.DATA.atsModel;
			variableObj['ATS_SerialNumber'] = self.DATA.atsSerialNumber;
			variableObj['ATS_Firmware'] = self.DATA.atsFirmware;
			variableObj['ATS_Device_Rating_Current'] = self.DATA.atsDeviceRatingCurrent;
			variableObj['ATS_Total_Outlets'] = self.DATA.atsTotalOutlets;
			variableObj['ATS_Active_Source'] = self.DATA.atsActiveSource;
			variableObj['ATS_SourceA_Volts'] = self.DATA.atsSourceAVolts;
			variableObj['ATS_SourceB_Volts'] = self.DATA.atsSourceBVolts;
			variableObj['ATS_SourceA_Freq'] = self.DATA.atsSourceAFreq;
			variableObj['ATS_SourceB_Freq'] = self.DATA.atsSourceBFreq;
			const total = self.DATA.atsTotalOutlets ? Math.min(self.DATA.atsTotalOutlets, 19) : 8
			for (let i = 1; i <= total; i++) {
				variableObj[`ATS_Outlet_${i}_Name`] = self.DATA[`atsOutlet${i}Name`]
				variableObj[`ATS_Outlet_${i}_Status`] = self.DATA[`atsOutlet${i}Status`]
			}

			self.setVariableValues(variableObj);
			
			self.log('info', 'Variable Objects Updated');
		}
		catch(error) {
			self.log('error', 'Error setting Variables from Device: ' + String(error));
		}
		
	}
}