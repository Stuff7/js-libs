import "whatwg-fetch"

(function remove (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('remove')) {
			return;
		}
		Object.defineProperty(item, 'remove', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function remove() {
				if (this.parentNode === null) {
					return;
				}
				this.parentNode.removeChild(this);
			}
		});
	});
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

function ReplaceWithPolyfill() {
	'use-strict'; // For safari, and IE > 10
	var parent = this.parentNode, i = arguments.length, currentNode;
	if (!parent) return;
	if (!i) // if there are no arguments
		parent.removeChild(this);
	while (i--) { // i-- decrements i and returns the value of i before the decrement
		currentNode = arguments[i];
		if (typeof currentNode !== 'object'){
			currentNode = this.ownerDocument.createTextNode(currentNode);
		} else if (currentNode.parentNode){
			currentNode.parentNode.removeChild(currentNode);
		}
		// the value of "i" below is after the decrement
		if (!i) // if currentNode is the first argument (currentNode === arguments[0])
			parent.replaceChild(currentNode, this);
		else // if currentNode isn't the first
			parent.insertBefore(currentNode, this.previousSibling);
	}
}
if (!Element.prototype.replaceWith)
	Element.prototype.replaceWith = ReplaceWithPolyfill;
if (!CharacterData.prototype.replaceWith)
	CharacterData.prototype.replaceWith = ReplaceWithPolyfill;
if (!DocumentType.prototype.replaceWith) 
	DocumentType.prototype.replaceWith = ReplaceWithPolyfill;

if (!String.prototype.repeat) {
	String.prototype.repeat = function(count) {
		if (this == null)
			throw new TypeError('can\'t convert ' + this + ' to object');

		var str = '' + this;
		// To convert string to integer.
		count = +count;
		// Check NaN
		if (count != count)
			count = 0;

		if (count < 0)
			throw new RangeError('repeat count must be non-negative');

		if (count == Infinity)
			throw new RangeError('repeat count must be less than infinity');

		count = Math.floor(count);
		if (str.length == 0 || count == 0)
			return '';

		// Ensuring count is a 31-bit integer allows us to heavily optimize the
		// main part. But anyway, most current (August 2014) browsers can't handle
		// strings 1 << 28 chars or longer, so:
		if (str.length * count >= 1 << 28)
			throw new RangeError('repeat count must not overflow maximum string size');

		var maxCount = str.length * count;
		count = Math.floor(Math.log(count) / Math.log(2));
		while (count) {
			 str += str;
			 count--;
		}
		str += str.substring(0, maxCount - str.length);
		return str;
	}
}

(function () {
	if ( typeof window.CustomEvent === "function" ) return false;
	function CustomEvent ( event, params ) {
		params = params || { bubbles: false, cancelable: false, detail: null };
		var evt = document.createEvent( 'CustomEvent' );
		evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
		return evt;
	 }
	window.CustomEvent = CustomEvent;
})();

if (typeof Object.assign !== 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource !== null && nextSource !== undefined) { 
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

if(!String.prototype.capitalize) {
	String.prototype.capitalize = function() {
		return this.charAt(0).toUpperCase() + this.slice(1).toLowerCase()
	}
}
