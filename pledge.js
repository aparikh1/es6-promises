/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:



function $Promise() {
	this.state = 'pending';
	this.handlerGroups = [];
};

$Promise.prototype.then = function(successCb, errorCb) {
	
	var forwarder = defer();
	
	if (typeof successCb !== 'function') {
		successCb = null;
	}
	if (typeof errorCb !== 'function') {
		errorCb = null;
	}

	this.handlerGroups.push({successCb: successCb, errorCb: errorCb, forwarder: forwarder})
	

	if (this.state === 'resolved') {
		this.callHandlers(successCb, null, forwarder);
	}

	if (this.state === 'rejected') {
		this.callHandlers(null, errorCb, forwarder);
	}
	
	return forwarder.$promise;
	
};

$Promise.prototype.callHandlers = function(successCb, errorCb, forwarder) {
	
	var val;

	if (successCb && this.state === 'resolved') {
		try {
			val = successCb(this.value);
			if (val instanceof $Promise) {
				val.then(function (resolvedValue) {
					forwarder.resolve(resolvedValue);
				}, function (rejectedValue) {
					forwarder.reject(rejectedValue);
				});
			} else {
			 	forwarder.resolve(val);
			}
		} catch (e) {
		    forwarder.reject(e);
		}
	}

	if (errorCb && this.state === 'rejected') {
		try {
		    val = errorCb(this.value);
		    if (val instanceof $Promise) {
				val.then(function (resolvedValue) {
					forwarder.resolve(resolvedValue);
				}, function (rejectedValue) {
					forwarder.reject(rejectedValue);
				});
			} else {
			 	forwarder.resolve(val);
			}
		} catch (e) {
		    forwarder.reject(e);
		}		
	}

	if (!successCb && this.state === 'resolved') {
		val = this.value;
		forwarder.resolve(val);
	}

	if (!errorCb && this.state === 'rejected') {
		val = this.value;
		forwarder.reject(val);
	}
	
};	

$Promise.prototype.catch = function(errorFn) {
	return this.then(null, errorFn);
};



function Deferral() {
	this.$promise = new $Promise;
};

Deferral.prototype.resolve = function(data) {
	
	if (this.$promise.state === 'pending') {
		this.$promise.value = data;
	}
	if (this.$promise.state !== 'rejected') {
		this.$promise.state = 'resolved';
		var self = this; //change scope
		this.$promise.handlerGroups.forEach(function(obj) {
			self.$promise.callHandlers(obj.successCb, obj.errorCb, obj.forwarder);
		})
		this.$promise.handlerGroups = [];
	}
};

Deferral.prototype.reject = function(data) {
	
	if (this.$promise.state === 'pending') {
		this.$promise.value = data;
	}
	if (this.$promise.state !== 'resolved') {
		this.$promise.state = 'rejected';
		var self = this; //change scope
		this.$promise.handlerGroups.forEach(function(obj) {
			self.$promise.callHandlers(obj.successCb, obj.errorCb, obj.forwarder);
		})
	}
};


var defer = function() {
	return new Deferral;
}


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