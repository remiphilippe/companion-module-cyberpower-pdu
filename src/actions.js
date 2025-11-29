module.exports = {
	// ##########################
	// #### Instance Actions ####
	// ##########################
	initActions: function () {
		var self = this;
        const buildActions = (atsCount) => {
            const totalATS = atsCount && atsCount > 0 ? Math.min(atsCount, 19) : 8
            let actions = {}

            actions.switchOn = {
                name: 'Set Output Socket On',
                options: [
                    {
                        type: 'number',
                        label: 'Socket',
                        id: 'socketOn',
                        min: 1,
                        max: self.config.deviceType === 'ats' ? totalATS : 24,
                        default: 1,
                        required: true,
                    },
                ],
                callback: async function(event) {
                    let options = event.options;
                    if (self.config.deviceType === 'ats') {
                        const total = self.DATA.atsTotalOutlets || totalATS
                        if (options.socketOn < 1 || options.socketOn > total) {
                            self.log('warn', `ATS outlet ${options.socketOn} out of range 1-${total}`)
                            return
                        }
                        self.sendATSOutletCommand('individual', options.socketOn, 1)
                    } else {
                        self.sendCommand('individual', options.socketOn, 1);
                    }
                }
            }

            actions.switchOff = {
                name: 'Set Output Socket Off',
                options: [
                    {
                        type: 'number',
                        label: 'Socket',
                        id: 'socketOff',
                        min: 1,
                        max: self.config.deviceType === 'ats' ? totalATS : 24,
                        default: 1,
                        required: true,
                    },
                ],
                callback: async function(event) {
                    let options = event.options;
                    if (self.config.deviceType === 'ats') {
                        const total = self.DATA.atsTotalOutlets || totalATS
                        if (options.socketOff < 1 || options.socketOff > total) {
                            self.log('warn', `ATS outlet ${options.socketOff} out of range 1-${total}`)
                            return
                        }
                        self.sendATSOutletCommand('individual', options.socketOff, 2)
                    } else {
                        self.sendCommand('individual', options.socketOff, 2);
                    }
                }
            }

            actions.toggleSocket = {
                name: 'Toggle Output Socket',
                options: [
                    {
                        type: 'number',
                        label: 'Socket',
                        id: 'socketToggle',
                        min: 1,
                        max: self.config.deviceType === 'ats' ? totalATS : 24,
                        default: 1,
                        required: true,
                    },
                ],
                callback: async function(event) {
                    let options = event.options;
                    if (self.config.deviceType === 'ats') {
                        const total = self.DATA.atsTotalOutlets || totalATS
                        if (options.socketToggle < 1 || options.socketToggle > total) {
                            self.log('warn', `ATS outlet ${options.socketToggle} out of range 1-${total}`)
                            return
                        }
                        const statusKey = `atsOutlet${options.socketToggle}Status`
                        const current = self.DATA[statusKey]
                        const nextVal = current === 'On' ? 2 : 1
                        self.sendATSOutletCommand('individual', options.socketToggle, nextVal)
                    } else {
                        self.sendCommand('toggle', options.socketToggle, 5); //5 is dummy
                    }
                }
            }

		actions.allOn = {
			name: 'Set All Sockets On',
			options: [],
			callback: async function(event) {
				if (self.config.deviceType === 'ats') {
					self.sendATSOutletCommand('all', null, 1)
				} else {
					self.sendCommand('all', null, 2);
				}
			}
		};

		actions.allOff = {
			name: 'Set All Sockets Off',
			options: [],
			callback: async function(event) {
				if (self.config.deviceType === 'ats') {
					self.sendATSOutletCommand('all', null, 2)
				} else {
					self.sendCommand('all', null, 3);
				}
			}
		};

		// ATS actions (only active when deviceType === 'ats')
		actions.transferToSourceA = {
			name: 'ATS: Transfer to Source A',
			options: [],
			callback: async function() {
				if (self.config.deviceType === 'ats') self.sendATSCommand('sourceA')
			}
		}
		actions.transferToSourceB = {
			name: 'ATS: Transfer to Source B',
			options: [],
			callback: async function() {
				if (self.config.deviceType === 'ats') self.sendATSCommand('sourceB')
			}
		}

		//TEST - Get values "manually"
		/*
		actions.getValues = {
			name: 'Get Values',
			options: [],
			callback: async function(event) {
				self.getInfo(self.config.host, self.config.communityWrite);
				
			}
		};
		
	    actions.getStatus = {
			name: 'Get Status Values',
			options: [],
			callback: async function(event) {
				self.getStatus(self.config.host, self.config.communityWrite);
				
			}
		};
		
		//END TEST
        */

		return actions
		}

		self.rebuildATSActions = function(count) {
			this.setActionDefinitions(buildActions(count))
		}

		// initial build
		this.setActionDefinitions(buildActions(self.DATA.atsTotalOutlets || 8));
	}
}