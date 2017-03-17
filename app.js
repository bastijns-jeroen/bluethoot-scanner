var noble = require('noble');

const serviceUuid = 0xffe5;
const charasteristicId = 0xffe9;

noble.on('stateChange', function(state) {
	if (state === 'poweredOn') {
		noble.startScanning(serviceUuid, false);
	} else {
		noble.stopScanning();
	}
});

noble.on('discover', function(peripheral) {
	console.log('Found device with local name: ' + peripheral.advertisement.localName);
	console.log('advertising the following service uuid\'s: ' + peripheral.advertisement.serviceUuids);

	if(peripheral.advertisement.localName === "LEDBLE-01010282") {
		let bulb = new Bulb(peripheral);
		bulb.connect();
	}
});

class Bulb {

	constructor(peripheral) {
		this.peripheral = peripheral;
	}

	connect() {
		this.peripheral.connect((error) => this.peripheralConnected(error));
	}

	peripheralConnected(error) {
		this.peripheral.discoverSomeServicesAndCharacteristics(serviceUuid, charasteristicId, (error, services, charasteristics) => this.servicesDiscovered(error, services, charasteristics));
	}

	servicesDiscovered(error, services, charasteristics) {
		charasteristics.filter(charasteristic => charasteristic.uuid == charasteristicId.toString(16))
			.map(charasteristic => this.writeCharacteristic(charasteristic));
	}

	writeCharacteristic(charasteristic) {
		let turnOn = new Buffer([0x56, 0, 0, 0, 255, 0x0f, 0xaa]);
		let turnOff = new Buffer([0x56, 0, 0, 0, 0, 0x0f, 0xaa]);
		charasteristic.write(turnOn, (error) => this.outputCharasteristicValue(error));
	}

	outputCharasteristicValue(error) {
		console.log(error);
	}

}