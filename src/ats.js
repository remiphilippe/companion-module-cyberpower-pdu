const { InstanceStatus } = require('@companion-module/base')
const snmp = require('net-snmp')

// Maximum ATS outlets supported by current MIB revision
const MAX_ATS_OUTLETS = 19

function ab2str(buf) {
        return String.fromCharCode.apply(null, new Uint16Array(buf))
}

function tenthsToString(tenths) {
        const val = tenths / 10;
        return val.toFixed(1);
}

module.exports = {
        getATSInfo: function(host, communityRead) {
                let self = this

                // First obtain total number of ATS outlets
                const totalOutletsOid = '1.3.6.1.4.1.3808.1.1.5.6.1.1.0' // atsOutletDevTotalOutletNum
                const identOids = [
                        '1.3.6.1.4.1.3808.1.1.5.1.1.0', // atsIdentModel
                        '1.3.6.1.4.1.3808.1.1.5.1.2.0', // atsIdentSerialNumber
                        '1.3.6.1.4.1.3808.1.1.5.1.3.0', // atsIdentFirmwareVersion
                        '1.3.6.1.4.1.3808.1.1.5.1.4.0', // atsIdentDeviceRatingCurrent
                        totalOutletsOid,
                ]

                let ident_session = snmp.createSession(host, communityRead)
                ident_session.get(identOids, function(error, varbinds) {
                        if (error) {
                                self.log('error', error.toString())
                                self.updateStatus(InstanceStatus.Error)
                                ident_session.close()
                                return
                        }
                        let ats_info = []
                        for (let i = 0; i < varbinds.length; i++) {
                                if (snmp.isVarbindError(varbinds[i])) {
                                        self.log('error', snmp.varbindError(varbinds[i]))
                                } else {
                                        if (typeof varbinds[i].value === 'object' && varbinds[i].value !== null) {
                                                ats_info.push(ab2str(varbinds[i].value))
                                        } else {
                                                ats_info.push(varbinds[i].value)
                                        }
                                }
                        }
                        ident_session.close()

                        // Parse ident info
                        const model = ats_info[0]
                        const serial = ats_info[1]
                        const firmware = ats_info[2]
                        const ratingCurrent = ats_info[3]
                        let totalOutlets = parseInt(ats_info[4], 10)
                        if (isNaN(totalOutlets) || totalOutlets < 1) totalOutlets = 8
                        if (totalOutlets > MAX_ATS_OUTLETS) totalOutlets = MAX_ATS_OUTLETS

                        const prevTotal = self.DATA.atsTotalOutlets
                        self.DATA.atsTotalOutlets = totalOutlets

                        // Store ident data
                        let dataChanged = false
                        if (self.DATA.atsModel !== model) { self.DATA.atsModel = model; dataChanged = true }
                        if (self.DATA.atsSerialNumber !== serial) { self.DATA.atsSerialNumber = serial; dataChanged = true }
                        if (self.DATA.atsFirmware !== firmware) { self.DATA.atsFirmware = firmware; dataChanged = true }
                        if (self.DATA.atsDeviceRatingCurrent !== ratingCurrent) { self.DATA.atsDeviceRatingCurrent = ratingCurrent; dataChanged = true }

                        // Now fetch outlet names limited to discovered count
                        const outletNameBase = '1.3.6.1.4.1.3808.1.1.5.6.3.1.2.'
                        const outletNameOids = []
                        for (let i = 1; i <= totalOutlets; i++) {
                                outletNameOids.push(outletNameBase + i)
                        }

                        let names_session = snmp.createSession(host, communityRead)
                        names_session.get(outletNameOids, function(err2, vb2) {
                                if (err2) {
                                        self.log('error', err2.toString())
                                        self.updateStatus(InstanceStatus.Error)
                                } else {
                                        for (let i = 0; i < vb2.length; i++) {
                                                if (snmp.isVarbindError(vb2[i])) {
                                                        self.log('error', snmp.varbindError(vb2[i]))
                                                } else {
                                                        let v
                                                        if (typeof vb2[i].value === 'object' && vb2[i].value !== null) {
                                                                v = ab2str(vb2[i].value)
                                                        } else {
                                                                v = vb2[i].value
                                                        }
                                                        const key = `atsOutlet${i+1}Name`
                                                        if (self.DATA[key] !== v) {
                                                                self.DATA[key] = v
                                                                dataChanged = true
                                                        }
                                                }
                                        }
                                }
                                names_session.close()

                                // If outlet count changed, rebuild variable/feedback/preset definitions
                                if (prevTotal !== totalOutlets) {
                                        self.log('info', `Discovered ${totalOutlets} ATS outlets (was ${prevTotal || 'unset'})`)
                                        if (typeof self.rebuildATSVariables === 'function') {
                                                self.rebuildATSVariables(totalOutlets)
                                        }
                                        if (typeof self.rebuildATSFeedbacks === 'function') {
                                                self.rebuildATSFeedbacks(totalOutlets)
                                        }
                                        if (typeof self.rebuildATSPresets === 'function') {
                                                self.rebuildATSPresets(totalOutlets)
                                        }
                                        if (typeof self.rebuildATSActions === 'function') {
                                                self.rebuildATSActions(totalOutlets)
                                        }
                                }

                                if (dataChanged) {
                                        self.checkVariables()
                                }
                        })
                })
                return

                get_session.get(oids, function (error, varbinds) {
                        if (error) {
                                self.log('error', error.toString())
                                self.updateStatus(InstanceStatus.Error)
                        } else {
                                for (let i = 0; i < varbinds.length; i++) {
                                        if (snmp.isVarbindError(varbinds[i])) {
                                                console.error(snmp.varbindError(varbinds[i]))
                                        } else {
                                                if (typeof varbinds[i].value === 'object' && varbinds[i].value !== null) {
                                                        ats_info.push(ab2str(varbinds[i].value))
                                                } else {
                                                        ats_info.push(varbinds[i].value)
                                                }
                                        }
                                }
                        }

                        get_session.close()

                        const dataKeys = [
                                'atsModel', 'atsSerialNumber', 'atsFirmware', 'atsDeviceRatingCurrent'
                        ]
                        for (let i = 1; i <= MAX_ATS_OUTLETS; i++) {
                                dataKeys.push(`atsOutlet${i}Name`)
                        }

                        let dataChanged = false

                        for (let i = 0; i < dataKeys.length; i++) {
                                const key = dataKeys[i]
                                if (self.DATA[key] !== ats_info[i]) {
                                        self.DATA[key] = ats_info[i]
                                        dataChanged = true
                                }
                        }

                        if (dataChanged) {
                                self.checkVariables()
                        }
                })
                return
        },

        getATSStatus: function(host, communityRead) {
                let self = this
                let ats_status = []
                let nToWords = ['unknown', 'On', 'Off']

                let get_session = snmp.createSession(host, communityRead)

                const total = self.DATA.atsTotalOutlets ? Math.min(self.DATA.atsTotalOutlets, MAX_ATS_OUTLETS) : 8
                const activeSourceOid = '1.3.6.1.4.1.3808.1.1.5.2.1.1.0'
                const outletStatusBase = '1.3.6.1.4.1.3808.1.1.5.6.3.1.3.'
                let oids = [activeSourceOid]
                for (let i = 1; i <= total; i++) {
                        oids.push(outletStatusBase + i)
                }

                get_session.get(oids, function (error, varbinds) {
                        if (error) {
                                self.log('error', error.toString())
                                self.updateStatus(InstanceStatus.Error)
                        } else {
                                for (let i = 0; i < varbinds.length; i++) {
                                        if (snmp.isVarbindError(varbinds[i])) {
                                                console.error(snmp.varbindError(varbinds[i]))
                                        } else {
                                                if (typeof varbinds[i].value === 'object' && varbinds[i].value !== null) {
                                                        ats_status.push(ab2str(varbinds[i].value))
                                                } else {
                                                        ats_status.push(varbinds[i].value)
                                                }
                                        }
                                }
                        }

                        get_session.close()

                        let dataChanged = false

                        // Active source (0 = Source A, 1 = Source B typically)
                        const sourceMapping = { 0: 'Source A', 1: 'Source B' }
                        const activeSource = sourceMapping[ats_status[0]] || 'Unknown'
                        if (self.DATA.atsActiveSource !== activeSource) {
                                self.DATA.atsActiveSource = activeSource
                                dataChanged = true
                        }

                        // Outlet statuses (1 = On, 2 = Off) iterate discovered range
                        for (let i = 1; i <= total; i++) {
                                const key = `atsOutlet${i}Status`
                                const newValue = nToWords[ats_status[i]]
                                if (self.DATA[key] !== newValue) {
                                        self.DATA[key] = newValue
                                        dataChanged = true
                                }
                        }

                        if (dataChanged) {
                                self.checkVariables()
                                self.checkFeedbacks('ATSActiveSource', 'ATSOutletState')
                        }
                })
                return
        },

        sendATSCommand: function(command) {
                let self = this

                // SNMP Options
                let snmp_options = {
                        port: self.config.port,
                        version: snmp.Version1,
                        backwardsGetNexts: true,
                        idBitsSize: 32,
                }

                let varbinds

                // ATS Control OID for source transfer
                // 1.3.6.1.4.1.3808.1.1.5.4.1.0 = atsControlDeviceCommand
                // Values: 1 = Transfer to Source A, 2 = Transfer to Source B
                if (command === 'sourceA') {
                        varbinds = [{
                                oid: '1.3.6.1.4.1.3808.1.1.5.4.1.0',
                                type: snmp.ObjectType.Integer,
                                value: 1,
                        }]
                } else if (command === 'sourceB') {
                        varbinds = [{
                                oid: '1.3.6.1.4.1.3808.1.1.5.4.1.0',
                                type: snmp.ObjectType.Integer,
                                value: 2,
                        }]
                }

                if (!varbinds) {
                        self.log('warn', `Unknown ATS command: ${command}`)
                        return
                }

                let snmp_session = snmp.createSession(self.config.host, self.config.communityWrite, snmp_options)
                snmp_session.set(varbinds, function (error, varbinds) {
                        if (error) {
                                self.log('warn', error.toString())
                        } else {
                                for (let i = 0; i < varbinds.length; i++) {
                                        if (snmp.isVarbindError(varbinds[i])) {
                                                self.log('error', snmp.varbindError(varbinds[i]))
                                        }
                                }
                        }
                        snmp_session.close()
                })

                // Check status after command
                setTimeout(function() {
                        self.getATSStatus(self.config.host, self.config.communityRead)
                }, 500)

                setTimeout(function() {
                        self.getATSStatus(self.config.host, self.config.communityRead)
                }, 1500)
        },

        sendATSOutletCommand: function(control, outputValue, cmdValue) {
                let self = this

                // SNMP Options
                let snmp_options = {
                        port: self.config.port,
                        version: snmp.Version1,
                        backwardsGetNexts: true,
                        idBitsSize: 32,
                }

                let varbinds

                // ATS Outlet Control OID from atsOutletCtrlTable
                // 1.3.6.1.4.1.3808.1.1.5.6.5.1.3.X = atsOutletCtrlCommand
                // where X is outlet number (1-8)
                // Values: 2 = immediateOn, 3 = immediateOff, 4 = immediateReboot

                if (control === 'individual') {
                        varbinds = [{
                                oid: '1.3.6.1.4.1.3808.1.1.5.6.5.1.3.' + outputValue,
                                type: snmp.ObjectType.Integer,
                                value: cmdValue,
                        }]
                } else if (control === 'all') {
                        // For "all" outlets, send commands to each supported outlet
                        varbinds = []
                        for (let i = 1; i <= MAX_ATS_OUTLETS; i++) {
                                varbinds.push({
                                        oid: '1.3.6.1.4.1.3808.1.1.5.6.5.1.3.' + i,
                                        type: snmp.ObjectType.Integer,
                                        value: cmdValue,
                                })
                        }
                }

                if (!varbinds) {
                        self.log('warn', `Unknown ATS outlet control: ${control}`)
                        return
                }

                let snmp_session = snmp.createSession(self.config.host, self.config.communityWrite, snmp_options)
                snmp_session.set(varbinds, function (error, varbinds) {
                        if (error) {
                                self.log('warn', error.toString())
                        } else {
                                for (let i = 0; i < varbinds.length; i++) {
                                        if (snmp.isVarbindError(varbinds[i])) {
                                                self.log('error', snmp.varbindError(varbinds[i]))
                                        }
                                }
                        }
                        snmp_session.close()
                })

                // Check status after command
                setTimeout(function() {
                        self.getATSStatus(self.config.host, self.config.communityRead)
                }, 500)

                setTimeout(function() {
                        self.getATSStatus(self.config.host, self.config.communityRead)
                }, 1500)
        }
}