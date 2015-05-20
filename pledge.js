/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:


function $Promise () {
	this.state = 'pending';
	this.handlerGroups = [];
};

$Promise.prototype.then = function (successCb, errorCb) {

	if (typeof successCb !== 'function')
		successCb = null;

	if (typeof errorCb !== 'function')
		errorCb = null;

	if (this.state === 'resolved')
		this.callHandlers(successCb, errorCb);

	this.handlerGroups.push({successCb: successCb, errorCb: errorCb})
}

$Promise.prototype.callHandlers = function (successCb, errorCb) {
	successCb(this.value);
}

function Deferral () {
	this.$promise = new $Promise;
};

Deferral.prototype.resolve = function (data) {
	
	var promise = this.$promise;

	if (promise.state === 'pending')
		promise.value = data;

	
	if (promise.state !== 'rejected') {

		promise.handlerGroups.forEach(function (obj) {
			promise.callHandlers(obj.successCb, obj.errorCb);
		})
		
		promise.state = 'resolved';
	}
}


Deferral.prototype.reject = function (reason) {

	if (this.$promise.state === 'pending') 
		this.$promise.value = reason;

	if (this.$promise.state !== 'resolved')
		this.$promise.state = 'rejected';
	
}

var defer = function () {
	return new Deferral;
}



// var Deferral = $q.defer();

// someAsyncCall( function (err, data) {
//   if (err) myDeferral.reject( err );
//   else myDeferral.resolve( data );
// });
// var myPromise = myDeferral.promise;



/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
