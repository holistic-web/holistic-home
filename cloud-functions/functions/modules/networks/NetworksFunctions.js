const functions = require('firebase-functions');
const admin = require('firebase-admin');
const getValidUser = require('../../lib/getValidUser');

exports.getNetworks = functions.https.onCall(async (data, context) => {
	console.log('> getNetworks~ called with: ' + JSON.stringify({ data, auth: context.auth }, null, 4));
	const user = await getValidUser(context);
	console.log('user: ', user);

	// Fetch the networks
	const networkSnaps = await admin.firestore().collection('networks').get();
	const networks = networkSnaps.docs.map(doc => doc.data());
	console.log('networks: ', networks);

	const loadUsersPromises = networks.map(async network => {
		console.log('network: ', network);
		const userSnaps = await admin.firestore().collection('networks').doc(network._id).collection('users').get();
		const users = userSnaps.docs.map(doc =>  doc.data());
		network.users = users;
	});

	await Promise.all(loadUsersPromises);

	const filteredNetworks = networks.filter(network => {
		if (network.owner === user.email) return true;
		let isNetworkUser = false;
		network.users.forEach(networkUser => {
			if (networkUser.email === user.email) {
				isNetworkUser = true;
			}
		});
		return isNetworkUser;
	});

	console.log('filteredNetworks: ', filteredNetworks);
	return filteredNetworks
});