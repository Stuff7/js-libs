export function CustomEventHandler(...events) {
	for(const event of events)
		this[`${event}Handlers`] = []
}
CustomEventHandler.prototype.on = function(event, handler) {
	this[`${event}Handlers`].push(handler)
}
CustomEventHandler.prototype.dispatchEvent = function(event, ...args) {
	for(const handler of this[`${event}Handlers`])
		handler.call(this,...args)
}