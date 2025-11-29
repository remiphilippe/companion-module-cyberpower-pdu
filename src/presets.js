const { combineRgb } = require('@companion-module/base')

module.exports = {
	initPresets: function () {
		let self = this;
		let buildATSPresets = function(count) {
			let p = []
			const total = count && count > 0 ? Math.min(count,19) : 8
			for (let i = 1; i <= total; i++) {
				p.push({
					type: 'button',
					category: 'ATS Outlet On',
					name: 'ATS Outlet ' + String(i) + ' On',
					style: { bgcolor: 0, text: 'ATS ' + String(i) + ' ON', size: '14', color: 16777215 },
					steps: [{ down: [{ actionId: 'switchOn', options: { socketOn: String(i) } }], up: [] }],
					feedbacks: []
				})
				p.push({
					type: 'button',
					category: 'ATS Outlet Off',
					name: 'ATS Outlet ' + String(i) + ' Off',
					style: { bgcolor: 0, text: 'ATS ' + String(i) + ' OFF', size: '14', color: 16777215 },
					steps: [{ down: [{ actionId: 'switchOff', options: { socketOff: String(i) } }], up: [] }],
					feedbacks: []
				})
				p.push({
					type: 'button',
					category: 'ATS Outlet Toggle',
					name: 'ATS Outlet ' + String(i) + ' Toggle',
					style: { bgcolor: 0, text: 'ATS ' + String(i) + ' TOGGLE', size: '14', color: 16777215, latch: true },
					steps: [
						{ down: [{ actionId: 'switchOn', options: { socketOn: String(i) } }], up: [] },
						{ down: [{ actionId: 'switchOff', options: { socketOff: String(i) } }], up: [] }
					],
					feedbacks: []
				})
			}
			return p
		}

		let presets = [];

		const foregroundColor = combineRgb(255, 255, 255) // White
		const foregroundColorBlack = combineRgb(0, 0, 0) // Black
		const backgroundColorRed = combineRgb(255, 0, 0) // Red
		const backgroundColorWhite = combineRgb(255, 255, 255) // White

		for (let i = 1; i < 9; i++) {
			presets.push({
				type: 'button',
				category: 'Socket On',
				name: 'Switch Output ' + String(i) + ' On',
				style: {
					bgcolor: 0,
					text: String(i),
					size: '44',
					color: 16777215,
				},
				steps: [
					{
						// Put the 'latch' actions here
						down: [
							{
								actionId: 'switchOn',
								options: {
									socketOn: String(i),
								},
							}
						],
						up: [],
					},
				],
				feedbacks: []
			})
		}
	
		for (let i = 1; i < 9; i++) {
			presets.push({
				type: 'button',
				category: 'Socket Off',
				name: 'Switch Output ' + String(i) + ' Off',
				style: {
					bgcolor: 0,
					text: String(i),
					size: '44',
					color: 16777215,
				},
				steps: [
					{
						// Put the 'latch' actions here
						down: [
							{
								actionId: 'switchOff',
								options: {
									socketOn: String(i),
								},
							}
						],
						up: [],
					},
				],
				feedbacks: []
			})
		}
	
		for (let i = 1; i < 9; i++) {
			presets.push({
				type: 'button',
				category: 'Socket Latch On & Off',
				name: 'Toggle Output ' + String(i),
				style: {
					bgcolor: 0,
					text: String(i),
					size: '44',
					color: 16777215,
					latch: true,
				},
				steps: [
					{
						// Put the 'latch' actions here
						down: [
							{
								actionId: 'switchOn',
								options: {
									socketOn: String(i),
								},
							}
						],
						up: [],
					},
					{
						// Put the 'unlatch' actions here
						down: [
							{
								actionId: 'switchOff',
								options: {
									socketOff: String(i),
								},
							}
						],
						up: [],
					},
				],
				feedbacks: []
			})
		}
	
		// Add ATS presets (using discovered count if available)
		const atsTotal = self.DATA.atsTotalOutlets || 8
		presets = presets.concat(buildATSPresets(atsTotal))

		self.rebuildATSPresets = function(count) {
			// rebuild only ATS-related presets
			const other = presets.filter(pr => !/^ATS Outlet /.test(pr.name))
			const ats = buildATSPresets(count)
			this.setPresetDefinitions(other.concat(ats))
		}

		this.setPresetDefinitions(presets);
	}
}